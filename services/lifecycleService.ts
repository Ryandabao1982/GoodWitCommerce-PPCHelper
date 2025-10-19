/**
 * Lifecycle Service - Database API for Lifecycle Management
 * 
 * Provides database operations for keyword performance, lifecycle events,
 * negative keywords, cannibalization alerts, and more.
 */

import { supabase } from './supabaseClient';
import type {
  KeywordPerformance,
  LifecycleEvent,
  NegativeKeyword,
  CannibalizationAlert,
  KeywordImport,
  BrandSettings,
  KeywordCampaignAssignment,
  LifecycleEventType,
  ImportSource,
} from '../types';

/**
 * Keyword Performance API
 */
export class KeywordPerformanceAPI {
  /**
   * Get performance data for a keyword
   */
  static async get(keywordId: string, brandId: string) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .select('*')
      .eq('keyword_id', keywordId)
      .eq('brand_id', brandId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all performance data for a brand
   */
  static async listByBrand(brandId: string) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .select('*')
      .eq('brand_id', brandId)
      .order('opportunity_score', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create or update performance data
   */
  static async upsert(performance: Partial<KeywordPerformance> & { keywordId: string; brandId: string }) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .upsert({
        keyword_id: performance.keywordId,
        brand_id: performance.brandId,
        impressions: performance.impressions || 0,
        clicks: performance.clicks || 0,
        spend: performance.spend || 0,
        sales: performance.sales || 0,
        orders: performance.orders || 0,
        ctr: performance.ctr || 0,
        cvr: performance.cvr || 0,
        cpc: performance.cpc || 0,
        acos: performance.acos || 0,
        roas: performance.roas || 0,
        lifecycle_stage: performance.lifecycleStage || 'Discovery',
        rag_status: performance.ragStatus || 'Green',
        rag_drivers: performance.ragDrivers || [],
        opportunity_score: performance.opportunityScore || 0,
        intent: performance.intent,
        current_bid: performance.currentBid,
        suggested_bid: performance.suggestedBid,
        cpc_max: performance.cpcMax,
      }, { onConflict: 'keyword_id,brand_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update lifecycle stage
   */
  static async updateLifecycleStage(keywordId: string, brandId: string, stage: string) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .update({ lifecycle_stage: stage })
      .eq('keyword_id', keywordId)
      .eq('brand_id', brandId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get keywords by lifecycle stage
   */
  static async listByStage(brandId: string, stage: string) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .select('*')
      .eq('brand_id', brandId)
      .eq('lifecycle_stage', stage);

    if (error) throw error;
    return data;
  }

  /**
   * Get keywords by RAG status
   */
  static async listByRAGStatus(brandId: string, status: string) {
    const { data, error } = await supabase
      .from('keyword_performance')
      .select('*')
      .eq('brand_id', brandId)
      .eq('rag_status', status)
      .order('spend', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Delete performance data
   */
  static async delete(keywordId: string, brandId: string) {
    const { error } = await supabase
      .from('keyword_performance')
      .delete()
      .eq('keyword_id', keywordId)
      .eq('brand_id', brandId);

    if (error) throw error;
  }
}

/**
 * Lifecycle Events API
 */
export class LifecycleEventsAPI {
  /**
   * Create a lifecycle event
   */
  static async create(event: {
    keywordId: string;
    brandId: string;
    eventType: LifecycleEventType;
    fromStage?: string;
    toStage?: string;
    reason: string;
    automated?: boolean;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('lifecycle_events')
      .insert({
        keyword_id: event.keywordId,
        brand_id: event.brandId,
        event_type: event.eventType,
        from_stage: event.fromStage,
        to_stage: event.toStage,
        reason: event.reason,
        automated: event.automated || false,
        metadata: event.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get events for a keyword
   */
  static async listByKeyword(keywordId: string, brandId: string) {
    const { data, error } = await supabase
      .from('lifecycle_events')
      .select('*')
      .eq('keyword_id', keywordId)
      .eq('brand_id', brandId)
      .order('occurred_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get events for a brand
   */
  static async listByBrand(brandId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('lifecycle_events')
      .select('*')
      .eq('brand_id', brandId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get automated events
   */
  static async listAutomated(brandId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('lifecycle_events')
      .select('*')
      .eq('brand_id', brandId)
      .eq('automated', true)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

/**
 * Negative Keywords API
 */
export class NegativeKeywordsAPI {
  /**
   * Create a negative keyword
   */
  static async create(negative: {
    brandId: string;
    campaignId?: string;
    keyword: string;
    matchType?: 'Negative Exact' | 'Negative Phrase';
    source?: 'manual' | 'automated' | 'cannibalization';
    originalKeywordId?: string;
    reason: string;
  }) {
    const { data, error } = await supabase
      .from('negative_keywords')
      .insert({
        brand_id: negative.brandId,
        campaign_id: negative.campaignId,
        keyword: negative.keyword,
        match_type: negative.matchType || 'Negative Exact',
        source: negative.source || 'manual',
        original_keyword_id: negative.originalKeywordId,
        reason: negative.reason,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * List negative keywords for a brand
   */
  static async listByBrand(brandId: string) {
    const { data, error } = await supabase
      .from('negative_keywords')
      .select('*')
      .eq('brand_id', brandId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * List negative keywords for a campaign
   */
  static async listByCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('negative_keywords')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }

  /**
   * Remove a negative keyword
   */
  static async remove(id: string) {
    const { data, error } = await supabase
      .from('negative_keywords')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a negative keyword permanently
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('negative_keywords')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

/**
 * Cannibalization Alerts API
 */
export class CannibalizationAlertsAPI {
  /**
   * Create a cannibalization alert
   */
  static async create(alert: {
    brandId: string;
    keyword1Id: string;
    keyword2Id: string;
    campaign1Id?: string;
    campaign2Id?: string;
    cannibalizationScore: number;
    reason: string;
    suggestedAction: string;
  }) {
    const { data, error } = await supabase
      .from('cannibalization_alerts')
      .insert({
        brand_id: alert.brandId,
        keyword_1_id: alert.keyword1Id,
        keyword_2_id: alert.keyword2Id,
        campaign_1_id: alert.campaign1Id,
        campaign_2_id: alert.campaign2Id,
        cannibalization_score: alert.cannibalizationScore,
        reason: alert.reason,
        suggested_action: alert.suggestedAction,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * List active alerts for a brand
   */
  static async listActive(brandId: string) {
    const { data, error } = await supabase
      .from('cannibalization_alerts')
      .select('*')
      .eq('brand_id', brandId)
      .eq('status', 'active')
      .order('cannibalization_score', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Resolve an alert
   */
  static async resolve(id: string, resolvedAction: string) {
    const { data, error } = await supabase
      .from('cannibalization_alerts')
      .update({
        status: 'resolved',
        resolved_action: resolvedAction,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Ignore an alert
   */
  static async ignore(id: string) {
    const { data, error } = await supabase
      .from('cannibalization_alerts')
      .update({ status: 'ignored' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an alert
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('cannibalization_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

/**
 * Keyword Imports API
 */
export class KeywordImportsAPI {
  /**
   * Create an import record
   */
  static async create(importData: {
    brandId: string;
    source: ImportSource;
    filename?: string;
    totalRows: number;
  }) {
    const { data, error } = await supabase
      .from('keyword_imports')
      .insert({
        brand_id: importData.brandId,
        source: importData.source,
        filename: importData.filename,
        total_rows: importData.totalRows,
        successful_imports: 0,
        failed_imports: 0,
        status: 'processing',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update import record
   */
  static async update(
    id: string,
    updates: {
      successfulImports?: number;
      failedImports?: number;
      status?: 'processing' | 'completed' | 'failed';
      errors?: any;
    }
  ) {
    const { data, error } = await supabase
      .from('keyword_imports')
      .update({
        successful_imports: updates.successfulImports,
        failed_imports: updates.failedImports,
        status: updates.status,
        errors: updates.errors,
        completed_at: updates.status === 'completed' || updates.status === 'failed'
          ? new Date().toISOString()
          : undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * List imports for a brand
   */
  static async listByBrand(brandId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('keyword_imports')
      .select('*')
      .eq('brand_id', brandId)
      .order('imported_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get import by ID
   */
  static async get(id: string) {
    const { data, error } = await supabase
      .from('keyword_imports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Brand Settings API
 */
export class BrandSettingsAPI {
  /**
   * Get settings for a brand
   */
  static async get(brandId: string) {
    const { data, error } = await supabase
      .from('brand_settings')
      .select('*')
      .eq('brand_id', brandId)
      .single();

    if (error) {
      // If not found, return default settings
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  /**
   * Create or update settings
   */
  static async upsert(settings: Partial<BrandSettings> & { brandId: string }) {
    const { data, error } = await supabase
      .from('brand_settings')
      .upsert({
        brand_id: settings.brandId,
        clicks_to_promote: settings.clicksToPromote,
        clicks_to_negate: settings.clicksToNegate,
        ctr_pause_threshold: settings.ctrPauseThreshold,
        cvr_factor_median: settings.cvrFactorMedian,
        wasted_spend_red_threshold: settings.wastedSpendRedThreshold,
        target_acos: settings.targetAcos,
        product_price: settings.productPrice,
        is_competitive_category: settings.isCompetitiveCategory,
        target_roas: settings.targetRoas,
        target_ctr: settings.targetCtr,
        target_cvr: settings.targetCvr,
        enable_auto_promotion: settings.enableAutoPromotion,
        enable_auto_negation: settings.enableAutoNegation,
        enable_auto_pause: settings.enableAutoPause,
        enable_cannibalization_detection: settings.enableCannibalizationDetection,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete settings
   */
  static async delete(brandId: string) {
    const { error } = await supabase
      .from('brand_settings')
      .delete()
      .eq('brand_id', brandId);

    if (error) throw error;
  }
}

/**
 * Keyword Campaign Assignments API
 */
export class KeywordAssignmentsAPI {
  /**
   * Create a recommendation
   */
  static async createRecommendation(assignment: {
    keywordId: string;
    campaignId: string;
    adGroupId?: string;
    matchType: string;
    bid?: number;
    recommendationScore: number;
    recommendationReason?: string;
  }) {
    const { data, error } = await supabase
      .from('keyword_campaign_assignments')
      .insert({
        keyword_id: assignment.keywordId,
        campaign_id: assignment.campaignId,
        ad_group_id: assignment.adGroupId,
        match_type: assignment.matchType,
        bid: assignment.bid,
        is_recommended: true,
        recommendation_score: assignment.recommendationScore,
        recommendation_reason: assignment.recommendationReason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Accept a recommendation (mark as assigned)
   */
  static async accept(id: string) {
    const { data, error } = await supabase
      .from('keyword_campaign_assignments')
      .update({
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get recommendations for a keyword
   */
  static async listByKeyword(keywordId: string) {
    const { data, error } = await supabase
      .from('keyword_campaign_assignments')
      .select('*')
      .eq('keyword_id', keywordId)
      .eq('is_recommended', true)
      .order('recommendation_score', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get assignments for a campaign
   */
  static async listByCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('keyword_campaign_assignments')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'assigned');

    if (error) throw error;
    return data;
  }

  /**
   * Delete an assignment
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('keyword_campaign_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
