/**
 * Extended Database API Service for Lifecycle Management
 * Provides API methods for new lifecycle management tables
 */

import { supabase } from './supabaseClient';
import type {
  Product,
  KeywordMetricsDaily,
  KeywordDiscovery,
  KeywordLifecycle,
  KeywordAssignment,
  Negative,
  Alert,
  KeywordActionLog,
  SettingsThresholds,
} from '../types';

/**
 * Products API Operations
 */
export class ProductAPI {
  static async list(brandId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async get(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(brandId: string, product: Omit<Product, 'id'>) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        brand_id: brandId,
        asin: product.asin,
        title: product.title,
        price: product.price,
        lifecycle_stage: product.lifecycleStage,
        priority: product.priority,
        inventory_days: product.inventoryDays,
        cpc_max: product.cpcMax,
        metadata: product.metadata || {},
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(productId: string, updates: Partial<Product>) {
    const updateData: any = {};
    
    if (updates.asin !== undefined) updateData.asin = updates.asin;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.lifecycleStage !== undefined) updateData.lifecycle_stage = updates.lifecycleStage;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.inventoryDays !== undefined) updateData.inventory_days = updates.inventoryDays;
    if (updates.cpcMax !== undefined) updateData.cpc_max = updates.cpcMax;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
  }
}

/**
 * Keyword Metrics API Operations
 */
export class KeywordMetricsAPI {
  static async list(keywordId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('keyword_metrics_daily')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('date', { ascending: false });
    
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async upsert(metrics: Omit<KeywordMetricsDaily, 'id'>[]) {
    const metricsToInsert = metrics.map(m => ({
      keyword_id: m.keywordId,
      product_id: m.productId || null,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      cpc: m.cpc,
      spend: m.spend,
      orders: m.orders,
      sales: m.sales,
      acos: m.acos,
      roas: m.roas,
      cvr: m.cvr,
    }));

    const { data, error } = await supabase
      .from('keyword_metrics_daily')
      .upsert(metricsToInsert, {
        onConflict: 'keyword_id,product_id,date',
      })
      .select();
    
    if (error) throw error;
    return data;
  }

  static async getAggregated(keywordId: string, days: number = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const { data, error } = await supabase
      .from('keyword_metrics_daily')
      .select('*')
      .eq('keyword_id', keywordId)
      .gte('date', dateFrom.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

/**
 * Keyword Discovery API Operations
 */
export class KeywordDiscoveryAPI {
  static async get(keywordId: string) {
    const { data, error } = await supabase
      .from('keyword_discovery')
      .select('*')
      .eq('keyword_id', keywordId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async upsert(discovery: Omit<KeywordDiscovery, 'id'>) {
    const { data, error } = await supabase
      .from('keyword_discovery')
      .upsert({
        keyword_id: discovery.keywordId,
        sv: discovery.sv,
        iq_score: discovery.iqScore,
        competing_products: discovery.competingProducts,
        h10_bid_min: discovery.h10BidMin,
        h10_bid_max: discovery.h10BidMax,
        source: discovery.source,
        opp_score: discovery.oppScore,
        metadata: discovery.metadata || {},
      }, {
        onConflict: 'keyword_id',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async listByBrand(brandId: string, minOppScore?: number) {
    let query = supabase
      .from('keyword_discovery')
      .select(`
        *,
        keyword:keywords!inner(*)
      `)
      .eq('keywords.brand_id', brandId)
      .order('opp_score', { ascending: false, nullsFirst: false });
    
    if (minOppScore) {
      query = query.gte('opp_score', minOppScore);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }
}

/**
 * Keyword Lifecycle API Operations
 */
export class KeywordLifecycleAPI {
  static async get(keywordId: string) {
    const { data, error } = await supabase
      .from('keyword_lifecycle')
      .select('*')
      .eq('keyword_id', keywordId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async upsert(lifecycle: Omit<KeywordLifecycle, 'id'>) {
    const { data, error } = await supabase
      .from('keyword_lifecycle')
      .upsert({
        keyword_id: lifecycle.keywordId,
        state: lifecycle.state,
        state_since: lifecycle.stateSince,
        last_decision: lifecycle.lastDecision,
        decision_reason: lifecycle.decisionReason,
      }, {
        onConflict: 'keyword_id',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async listByState(brandId: string, state: string) {
    const { data, error } = await supabase
      .from('keyword_lifecycle')
      .select(`
        *,
        keyword:keywords!inner(*)
      `)
      .eq('keywords.brand_id', brandId)
      .eq('state', state)
      .order('state_since', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

/**
 * Keyword Assignments API Operations
 */
export class KeywordAssignmentAPI {
  static async list(keywordId: string) {
    const { data, error } = await supabase
      .from('keyword_assignments')
      .select(`
        *,
        campaign:campaigns(*)
      `)
      .eq('keyword_id', keywordId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(assignment: Omit<KeywordAssignment, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('keyword_assignments')
      .insert({
        keyword_id: assignment.keywordId,
        campaign_id: assignment.campaignId,
        ad_group: assignment.adGroup,
        match_type: assignment.matchType,
        bid: assignment.bid,
        placement_tos: assignment.placementTos,
        placement_pp: assignment.placementPp,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(assignmentId: string) {
    const { error } = await supabase
      .from('keyword_assignments')
      .delete()
      .eq('id', assignmentId);
    
    if (error) throw error;
  }

  static async listByCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('keyword_assignments')
      .select(`
        *,
        keyword:keywords(*)
      `)
      .eq('campaign_id', campaignId)
      .order('ad_group', { ascending: true });
    
    if (error) throw error;
    return data;
  }
}

/**
 * Negatives API Operations
 */
export class NegativesAPI {
  static async list(brandId: string, campaignId?: string) {
    let query = supabase
      .from('negatives')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    
    if (campaignId) {
      query = query.eq('applied_to_campaign_id', campaignId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async create(negative: Omit<Negative, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('negatives')
      .insert({
        brand_id: negative.brandId,
        applied_to_campaign_id: negative.appliedToCampaignId,
        scope: negative.scope,
        match_type: negative.matchType,
        term: negative.term,
        reason: negative.reason,
        rule_trigger: negative.ruleTrigger,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(negativeId: string) {
    const { error } = await supabase
      .from('negatives')
      .delete()
      .eq('id', negativeId);
    
    if (error) throw error;
  }

  static async bulkCreate(negatives: Omit<Negative, 'id' | 'createdAt'>[]) {
    const negativesToInsert = negatives.map(n => ({
      brand_id: n.brandId,
      applied_to_campaign_id: n.appliedToCampaignId,
      scope: n.scope,
      match_type: n.matchType,
      term: n.term,
      reason: n.reason,
      rule_trigger: n.ruleTrigger,
    }));

    const { data, error } = await supabase
      .from('negatives')
      .insert(negativesToInsert)
      .select();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Alerts API Operations
 */
export class AlertsAPI {
  static async list(brandId: string, level?: string, unresolved?: boolean) {
    let query = supabase
      .from('alerts')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });
    
    if (level) {
      query = query.eq('level', level);
    }
    
    if (unresolved) {
      query = query.is('resolved_at', null);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async create(alert: Omit<Alert, 'id' | 'createdAt' | 'resolvedAt'>) {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        brand_id: alert.brandId,
        entity_type: alert.entityType,
        entity_id: alert.entityId,
        level: alert.level,
        title: alert.title,
        message: alert.message,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async resolve(alertId: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);
    
    if (error) throw error;
  }
}

/**
 * Keyword Action Logs API Operations
 */
export class KeywordActionLogAPI {
  static async list(keywordId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('logs_keyword_actions')
      .select('*')
      .eq('keyword_id', keywordId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async create(log: Omit<KeywordActionLog, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('logs_keyword_actions')
      .insert({
        keyword_id: log.keywordId,
        action: log.action,
        before: log.before,
        after: log.after,
        reason: log.reason,
        actor: log.actor,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async listByBrand(brandId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from('logs_keyword_actions')
      .select(`
        *,
        keyword:keywords!inner(*)
      `)
      .eq('keywords.brand_id', brandId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
}

/**
 * Settings Thresholds API Operations
 */
export class SettingsThresholdsAPI {
  static async get(brandId: string) {
    const { data, error } = await supabase
      .from('settings_thresholds')
      .select('*')
      .eq('brand_id', brandId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async upsert(thresholds: SettingsThresholds) {
    const { data, error } = await supabase
      .from('settings_thresholds')
      .upsert({
        brand_id: thresholds.brandId,
        clicks_promote_standard: thresholds.clicksPromoteStandard,
        clicks_negate_standard: thresholds.clicksNegateStandard,
        clicks_promote_competitive: thresholds.clicksPromoteCompetitive,
        clicks_negate_competitive: thresholds.clicksNegateCompetitive,
        cvr_graduation_factor: thresholds.cvrGraduationFactor,
        ctr_pause_threshold: thresholds.ctrPauseThreshold,
        wasted_spend_red: thresholds.wastedSpendRed,
      }, {
        onConflict: 'brand_id',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Export extended API
 */
export const lifecycleApi = {
  products: ProductAPI,
  metrics: KeywordMetricsAPI,
  discovery: KeywordDiscoveryAPI,
  lifecycle: KeywordLifecycleAPI,
  assignments: KeywordAssignmentAPI,
  negatives: NegativesAPI,
  alerts: AlertsAPI,
  actionLogs: KeywordActionLogAPI,
  thresholds: SettingsThresholdsAPI,
};

export default lifecycleApi;
