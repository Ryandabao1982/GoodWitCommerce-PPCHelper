/**
 * Lifecycle Decision Engine
 * Daily job that analyzes metrics and makes promotion/negation decisions
 */

import { lifecycleApi } from './lifecycleService';
import {
  shouldPromoteKeyword,
  shouldNegateKeyword,
  shouldPauseKeyword,
  generateKeywordAlert,
  getDefaultThresholds,
  aggregateMetrics,
} from './rulesService';
import type {
  KeywordMetricsDaily,
  SettingsThresholds,
  KeywordCategory,
  LifecycleState,
} from '../types';

export interface LifecycleDecisionResult {
  keywordId: string;
  currentState: LifecycleState;
  newState?: LifecycleState;
  action?: 'promote' | 'negate' | 'pause' | 'alert';
  reason: string;
  shouldAddNegative?: boolean;
  negativeCampaignId?: string;
  negativeMatchType?: string;
  alertLevel?: string;
  alertTitle?: string;
  alertMessage?: string;
}

/**
 * Run lifecycle decision engine for all keywords in a brand
 */
export async function runLifecycleDecisions(
  brandId: string,
  dateWindow: number = 30
): Promise<LifecycleDecisionResult[]> {
  const results: LifecycleDecisionResult[] = [];

  // Get brand thresholds or use defaults
  let thresholds = await lifecycleApi.thresholds.get(brandId);
  if (!thresholds) {
    thresholds = { ...getDefaultThresholds(), brandId };
    await lifecycleApi.thresholds.upsert(thresholds);
  }

  // Get all keywords for the brand (using existing API)
  const { data: keywords } = await (await import('./supabaseClient')).supabase
    .from('keywords')
    .select('*')
    .eq('brand_id', brandId);

  if (!keywords) return results;

  // Calculate median CVR for CVR graduation threshold
  const allMetricsPromises = keywords.map(k => 
    lifecycleApi.metrics.getAggregated(k.id, dateWindow)
  );
  const allMetricsArrays = await Promise.all(allMetricsPromises);
  const allMetrics = allMetricsArrays.flat();
  const cvrs = allMetrics
    .filter(m => m.clicks > 0 && m.orders > 0)
    .map(m => m.orders / m.clicks);
  const medianCvr = cvrs.length > 0 
    ? cvrs.sort((a, b) => a - b)[Math.floor(cvrs.length / 2)]
    : 0.05; // Default 5%

  // Process each keyword
  for (const keyword of keywords) {
    try {
      const decision = await analyzeKeyword(
        keyword.id,
        keyword.category as KeywordCategory,
        thresholds as SettingsThresholds,
        dateWindow,
        medianCvr
      );
      
      if (decision) {
        results.push(decision);
        
        // Apply the decision
        await applyDecision(decision, brandId);
      }
    } catch (error) {
      console.error(`Error analyzing keyword ${keyword.id}:`, error);
    }
  }

  return results;
}

/**
 * Analyze a single keyword and determine action
 */
async function analyzeKeyword(
  keywordId: string,
  category: KeywordCategory,
  thresholds: SettingsThresholds,
  dateWindow: number,
  medianCvr: number
): Promise<LifecycleDecisionResult | null> {
  // Get current lifecycle state
  const lifecycle = await lifecycleApi.lifecycle.get(keywordId);
  const currentState = (lifecycle?.state as LifecycleState) || 'Discovery';

  // Don't process archived keywords
  if (currentState === 'Archived') {
    return null;
  }

  // Get metrics for the date window
  const metrics = await lifecycleApi.metrics.getAggregated(keywordId, dateWindow);
  if (!metrics || metrics.length === 0) {
    return null; // No data to analyze
  }

  // Check for promotion
  const promotionDecision = shouldPromoteKeyword(
    metrics as KeywordMetricsDaily[],
    thresholds,
    category,
    medianCvr
  );

  if (promotionDecision.shouldPromote && promotionDecision.targetState) {
    return {
      keywordId,
      currentState,
      newState: promotionDecision.targetState,
      action: 'promote',
      reason: promotionDecision.reason,
      shouldAddNegative: true, // Add negative to research campaign
    };
  }

  // Check for negation
  const negationDecision = shouldNegateKeyword(
    metrics as KeywordMetricsDaily[],
    thresholds,
    category
  );

  if (negationDecision.shouldNegate) {
    return {
      keywordId,
      currentState,
      newState: 'Archived',
      action: 'negate',
      reason: negationDecision.reason,
    };
  }

  // Check for pause
  const pauseDecision = shouldPauseKeyword(
    metrics as KeywordMetricsDaily[],
    thresholds
  );

  if (pauseDecision.shouldPause) {
    return {
      keywordId,
      currentState,
      action: 'pause',
      reason: pauseDecision.reason,
    };
  }

  // Generate alert regardless
  const alert = generateKeywordAlert(
    metrics as KeywordMetricsDaily[],
    thresholds,
    0.25 // Default target ACOS, should be fetched from brand settings
  );

  if (alert.level === 'RED' || alert.level === 'AMBER') {
    return {
      keywordId,
      currentState,
      action: 'alert',
      reason: alert.message,
      alertLevel: alert.level,
      alertTitle: alert.title,
      alertMessage: alert.message,
    };
  }

  return null; // No action needed
}

/**
 * Apply a lifecycle decision
 */
async function applyDecision(
  decision: LifecycleDecisionResult,
  brandId: string
): Promise<void> {
  const now = new Date().toISOString();

  // Log the action
  await lifecycleApi.actionLogs.create({
    keywordId: decision.keywordId,
    action: decision.action === 'promote' ? 'Promote' :
            decision.action === 'negate' ? 'Negate' :
            decision.action === 'pause' ? 'BidDown' : 'Promote',
    before: { state: decision.currentState },
    after: { state: decision.newState },
    reason: decision.reason,
    actor: 'system',
  });

  // Update lifecycle state if changed
  if (decision.newState && decision.newState !== decision.currentState) {
    await lifecycleApi.lifecycle.upsert({
      keywordId: decision.keywordId,
      state: decision.newState,
      stateSince: now.split('T')[0],
      lastDecision: decision.action || 'unknown',
      decisionReason: decision.reason,
    });
  }

  // Add negative keyword if needed
  if (decision.shouldAddNegative && decision.negativeCampaignId) {
    const { data: keyword } = await (await import('./supabaseClient')).supabase
      .from('keywords')
      .select('keyword, normalized')
      .eq('id', decision.keywordId)
      .single();

    if (keyword) {
      await lifecycleApi.negatives.create({
        brandId,
        appliedToCampaignId: decision.negativeCampaignId,
        scope: 'Campaign',
        matchType: decision.negativeMatchType as any || 'NEG_PHRASE',
        term: keyword.normalized || keyword.keyword,
        reason: 'Promoted to performance campaign',
        ruleTrigger: 'lifecycle_promotion',
      });
    }
  }

  // Create alert if needed
  if (decision.action === 'alert' && decision.alertLevel) {
    await lifecycleApi.alerts.create({
      brandId,
      entityType: 'Keyword',
      entityId: decision.keywordId,
      level: decision.alertLevel as any,
      title: decision.alertTitle || 'Alert',
      message: decision.alertMessage,
    });
  }
}

/**
 * Detect cannibalization - keywords active in multiple campaigns without negatives
 */
export async function detectCannibalization(
  brandId: string
): Promise<Array<{
  keywordId: string;
  keyword: string;
  campaigns: string[];
  recommendation: string;
}>> {
  const cannibalizationIssues: Array<{
    keywordId: string;
    keyword: string;
    campaigns: string[];
    recommendation: string;
  }> = [];

  // Get all keyword assignments for the brand
  const { data: keywords } = await (await import('./supabaseClient')).supabase
    .from('keywords')
    .select(`
      id,
      keyword,
      normalized,
      keyword_assignments (
        campaign_id,
        match_type,
        campaign:campaigns (
          id,
          name,
          targeting,
          theme
        )
      )
    `)
    .eq('brand_id', brandId);

  if (!keywords) return cannibalizationIssues;

  // Check each keyword for multiple assignments
  for (const kw of keywords) {
    const assignments = (kw as any).keyword_assignments || [];
    
    if (assignments.length <= 1) continue; // No issue

    // Check if keyword is in exact match AND broad/phrase
    const hasExact = assignments.some((a: any) => a.match_type === 'EXACT');
    const hasBroadOrPhrase = assignments.some((a: any) => 
      a.match_type === 'BROAD' || a.match_type === 'PHRASE'
    );

    if (hasExact && hasBroadOrPhrase) {
      // Get campaigns with broad/phrase that should have negatives
      const broadCampaigns = assignments
        .filter((a: any) => a.match_type !== 'EXACT')
        .map((a: any) => a.campaign);

      // Check if negatives exist
      for (const campaign of broadCampaigns) {
        const { data: existingNegative } = await (await import('./supabaseClient')).supabase
          .from('negatives')
          .select('id')
          .eq('applied_to_campaign_id', campaign.id)
          .eq('term', (kw as any).normalized || (kw as any).keyword)
          .single();

        if (!existingNegative) {
          cannibalizationIssues.push({
            keywordId: kw.id,
            keyword: (kw as any).keyword,
            campaigns: [campaign.name],
            recommendation: `Add negative exact match for "${(kw as any).keyword}" to campaign "${campaign.name}"`,
          });
        }
      }
    }
  }

  return cannibalizationIssues;
}

/**
 * Auto-apply negatives to prevent cannibalization
 */
export async function applyCannibalzationFixes(
  brandId: string,
  issues: Array<{
    keywordId: string;
    keyword: string;
    campaigns: string[];
  }>
): Promise<number> {
  let appliedCount = 0;

  for (const issue of issues) {
    // Get the keyword
    const { data: keyword } = await (await import('./supabaseClient')).supabase
      .from('keywords')
      .select('normalized, keyword')
      .eq('id', issue.keywordId)
      .single();

    if (!keyword) continue;

    // Get campaign IDs
    const { data: campaigns } = await (await import('./supabaseClient')).supabase
      .from('campaigns')
      .select('id')
      .eq('brand_id', brandId)
      .in('name', issue.campaigns);

    if (!campaigns) continue;

    // Add negative to each campaign
    for (const campaign of campaigns) {
      try {
        await lifecycleApi.negatives.create({
          brandId,
          appliedToCampaignId: campaign.id,
          scope: 'Campaign',
          matchType: 'NEG_EXACT',
          term: keyword.normalized || keyword.keyword,
          reason: 'Prevent cannibalization with exact match campaign',
          ruleTrigger: 'cannibalization_detector',
        });
        appliedCount++;
      } catch (error) {
        console.error(`Error adding negative for campaign ${campaign.id}:`, error);
      }
    }
  }

  return appliedCount;
}
