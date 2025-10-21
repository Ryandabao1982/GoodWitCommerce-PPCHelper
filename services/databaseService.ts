/**
 * Database API Service
 * This module provides high-level API methods for database operations
 */

import { supabase } from './supabaseClient';
import type { KeywordData, Campaign, AdGroup, SOP, SOPCategory } from '../types';

/**
 * Brand API Operations
 */
export class BrandAPI {
  /**
   * Get all brands for the current user
   */
  static async list() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific brand by ID
   */
  static async get(brandId: string) {
    const { data, error } = await supabase.from('brands').select('*').eq('id', brandId).single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new brand
   */
  static async create(name: string, description?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('brands')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing brand
   */
  static async update(brandId: string, updates: { name?: string; description?: string }) {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', brandId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a brand (soft delete by setting is_active to false)
   */
  static async delete(brandId: string) {
    const { error } = await supabase.from('brands').update({ is_active: false }).eq('id', brandId);

    if (error) throw error;
  }

  /**
   * Permanently delete a brand
   */
  static async hardDelete(brandId: string) {
    const { error } = await supabase.from('brands').delete().eq('id', brandId);

    if (error) throw error;
  }
}

/**
 * Keyword API Operations
 */
export class KeywordAPI {
  /**
   * Get all keywords for a brand
   */
  static async list(brandId: string) {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific keyword by ID
   */
  static async get(keywordId: string) {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('id', keywordId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a single keyword
   */
  static async create(brandId: string, keyword: Omit<KeywordData, 'id'>) {
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        brand_id: brandId,
        keyword: keyword.keyword,
        type: keyword.type,
        category: keyword.category,
        search_volume: keyword.searchVolume,
        competition: keyword.competition,
        relevance: keyword.relevance,
        source: keyword.source,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create multiple keywords in bulk
   */
  static async createBulk(brandId: string, keywords: Omit<KeywordData, 'id'>[]) {
    const keywordsToInsert = keywords.map((kw) => ({
      brand_id: brandId,
      keyword: kw.keyword,
      type: kw.type,
      category: kw.category,
      search_volume: kw.searchVolume,
      competition: kw.competition,
      relevance: kw.relevance,
      source: kw.source,
    }));

    const { data, error } = await supabase.from('keywords').insert(keywordsToInsert).select();

    if (error) throw error;
    return data;
  }

  /**
   * Update a keyword
   */
  static async update(keywordId: string, updates: Partial<KeywordData>) {
    const updateData: any = {};

    if (updates.keyword !== undefined) updateData.keyword = updates.keyword;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.searchVolume !== undefined) updateData.search_volume = updates.searchVolume;
    if (updates.competition !== undefined) updateData.competition = updates.competition;
    if (updates.relevance !== undefined) updateData.relevance = updates.relevance;
    if (updates.source !== undefined) updateData.source = updates.source;

    const { data, error } = await supabase
      .from('keywords')
      .update(updateData)
      .eq('id', keywordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a keyword
   */
  static async delete(keywordId: string) {
    const { error } = await supabase.from('keywords').delete().eq('id', keywordId);

    if (error) throw error;
  }

  /**
   * Delete multiple keywords
   */
  static async deleteBulk(keywordIds: string[]) {
    const { error } = await supabase.from('keywords').delete().in('id', keywordIds);

    if (error) throw error;
  }

  /**
   * Search keywords by text
   */
  static async search(brandId: string, searchText: string) {
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('brand_id', brandId)
      .ilike('keyword', `%${searchText}%`);

    if (error) throw error;
    return data;
  }
}

/**
 * Campaign API Operations
 */
export class CampaignAPI {
  /**
   * Get all campaigns for a brand
   */
  static async list(brandId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(
        `
        *,
        ad_groups (
          *,
          ad_group_keywords (
            *,
            keyword:keywords (*)
          )
        )
      `
      )
      .eq('brand_id', brandId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific campaign by ID
   */
  static async get(campaignId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(
        `
        *,
        ad_groups (
          *,
          ad_group_keywords (
            *,
            keyword:keywords (*)
          )
        )
      `
      )
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new campaign
   */
  static async create(brandId: string, campaign: Omit<Campaign, 'id' | 'adGroups'>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        brand_id: brandId,
        name: campaign.name,
        total_budget: campaign.totalBudget || null,
        projections: campaign.projections || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a campaign
   */
  static async update(campaignId: string, updates: Partial<Campaign>) {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.totalBudget !== undefined) updateData.total_budget = updates.totalBudget;
    if (updates.projections !== undefined) updateData.projections = updates.projections;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a campaign (soft delete)
   */
  static async delete(campaignId: string) {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'archived' })
      .eq('id', campaignId);

    if (error) throw error;
  }

  /**
   * Permanently delete a campaign
   */
  static async hardDelete(campaignId: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);

    if (error) throw error;
  }
}

/**
 * Ad Group API Operations
 */
export class AdGroupAPI {
  /**
   * Get all ad groups for a campaign
   */
  static async list(campaignId: string) {
    const { data, error } = await supabase
      .from('ad_groups')
      .select(
        `
        *,
        ad_group_keywords (
          *,
          keyword:keywords (*)
        )
      `
      )
      .eq('campaign_id', campaignId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new ad group
   */
  static async create(campaignId: string, adGroup: Omit<AdGroup, 'id' | 'keywords'>) {
    const { data, error } = await supabase
      .from('ad_groups')
      .insert({
        campaign_id: campaignId,
        name: adGroup.name,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an ad group
   */
  static async update(adGroupId: string, updates: { name?: string }) {
    const { data, error } = await supabase
      .from('ad_groups')
      .update(updates)
      .eq('id', adGroupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an ad group
   */
  static async delete(adGroupId: string) {
    const { error } = await supabase
      .from('ad_groups')
      .update({ status: 'archived' })
      .eq('id', adGroupId);

    if (error) throw error;
  }

  /**
   * Assign keywords to an ad group
   */
  static async assignKeywords(adGroupId: string, keywordIds: string[]) {
    const assignments = keywordIds.map((keywordId) => ({
      ad_group_id: adGroupId,
      keyword_id: keywordId,
    }));

    const { data, error } = await supabase.from('ad_group_keywords').insert(assignments).select();

    if (error) throw error;
    return data;
  }

  /**
   * Remove keywords from an ad group
   */
  static async removeKeywords(adGroupId: string, keywordIds: string[]) {
    const { error } = await supabase
      .from('ad_group_keywords')
      .delete()
      .eq('ad_group_id', adGroupId)
      .in('keyword_id', keywordIds);

    if (error) throw error;
  }
}

/**
 * Search History API Operations
 */
export class SearchHistoryAPI {
  /**
   * Get search history for a brand
   */
  static async list(brandId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('brand_id', brandId)
      .order('searched_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Log a search
   */
  static async create(
    brandId: string,
    searchTerms: string[],
    searchMode: 'simple' | 'advanced',
    settings?: any,
    resultsCount?: number
  ) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        brand_id: brandId,
        search_terms: searchTerms,
        search_mode: searchMode,
        settings: settings || null,
        results_count: resultsCount || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a search history entry
   */
  static async delete(historyId: string) {
    const { error } = await supabase.from('search_history').delete().eq('id', historyId);

    if (error) throw error;
  }

  /**
   * Clear all search history for a brand
   */
  static async clear(brandId: string) {
    const { error } = await supabase.from('search_history').delete().eq('brand_id', brandId);

    if (error) throw error;
  }
}

/**
 * Keyword Cluster API Operations
 */
export class KeywordClusterAPI {
  /**
   * Get all keyword clusters for a brand
   */
  static async list(brandId: string) {
    const { data, error } = await supabase
      .from('keyword_clusters')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Save a keyword cluster
   */
  static async create(brandId: string, clusterName: string, keywordIds: string[], intent?: string) {
    const { data, error } = await supabase
      .from('keyword_clusters')
      .insert({
        brand_id: brandId,
        cluster_name: clusterName,
        keyword_ids: keywordIds,
        intent: intent || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a keyword cluster
   */
  static async delete(clusterId: string) {
    const { error } = await supabase.from('keyword_clusters').delete().eq('id', clusterId);

    if (error) throw error;
  }
}

/**
 * SOP API Operations
 */
export class SOPAPI {
  /**
   * Get all SOPs for a brand
   */
  static async list(brandId: string) {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a specific SOP by ID
   */
  static async get(sopId: string) {
    const { data, error } = await supabase.from('sops').select('*').eq('id', sopId).single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new SOP
   */
  static async create(brandId: string, sop: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('sops')
      .insert({
        brand_id: brandId,
        title: sop.title,
        content: sop.content,
        category: sop.category,
        tags: sop.tags || [],
        is_favorite: sop.isFavorite || false,
        view_count: sop.viewCount || 0,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing SOP
   */
  static async update(sopId: string, updates: Partial<SOP>) {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

    const { data, error } = await supabase
      .from('sops')
      .update(updateData)
      .eq('id', sopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a SOP
   */
  static async delete(sopId: string) {
    const { error } = await supabase.from('sops').delete().eq('id', sopId);

    if (error) throw error;
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(sopId: string) {
    // First get the current state
    const { data: sop, error: fetchError } = await supabase
      .from('sops')
      .select('is_favorite')
      .eq('id', sopId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the favorite status
    const { data, error } = await supabase
      .from('sops')
      .update({ is_favorite: !sop.is_favorite })
      .eq('id', sopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Record a view (this will auto-increment view_count via trigger)
   */
  static async recordView(sopId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // Don't record views for anonymous users

    const { error } = await supabase.from('sop_view_history').insert({
      sop_id: sopId,
      user_id: user.id,
    });

    if (error) throw error;
  }

  /**
   * Search SOPs by text
   */
  static async search(brandId: string, searchText: string) {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('brand_id', brandId)
      .or(`title.ilike.%${searchText}%,content.ilike.%${searchText}%`);

    if (error) throw error;
    return data;
  }

  /**
   * Get SOPs by category
   */
  static async getByCategory(brandId: string, category: SOPCategory) {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('brand_id', brandId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get favorite SOPs
   */
  static async getFavorites(brandId: string) {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get most viewed SOPs
   */
  static async getMostViewed(brandId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('sops')
      .select('*')
      .eq('brand_id', brandId)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get recently viewed SOPs for current user
   */
  static async getRecentlyViewed(brandId: string, limit: number = 10) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('sop_view_history')
      .select(
        `
        viewed_at,
        sop:sops (*)
      `
      )
      .eq('user_id', user.id)
      .eq('sops.brand_id', brandId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map((item) => item.sop).filter(Boolean) || [];
  }
}

/**
 * Export all API classes
 */
export const api = {
  brands: BrandAPI,
  keywords: KeywordAPI,
  campaigns: CampaignAPI,
  adGroups: AdGroupAPI,
  searchHistory: SearchHistoryAPI,
  clusters: KeywordClusterAPI,
  sops: SOPAPI,
};

export default api;
