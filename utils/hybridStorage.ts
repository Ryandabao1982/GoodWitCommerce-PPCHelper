/**
 * Hybrid Storage Service
 * Provides unified storage interface that uses database when available,
 * with localStorage as a fallback/cache layer.
 * 
 * Pattern: Database-first with localStorage fallback
 * - When authenticated: Try database first, fall back to localStorage on error
 * - When not authenticated: Use localStorage only
 * - Always keep localStorage in sync as a cache/backup
 */

import { api } from '../services/databaseService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { loadFromLocalStorage, saveToLocalStorage } from './storage';
import type { BrandState, KeywordData, Campaign } from '../types';

/**
 * Check if user is authenticated and database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user !== null;
  } catch (error) {
    console.error('Error checking database availability:', error);
    return false;
  }
}

/**
 * Brand Storage Operations
 */
export const brandStorage = {
  /**
   * Get all brands
   */
  async list(): Promise<string[]> {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      try {
        const brands = await api.brands.list();
        const brandNames = brands.map(b => b.name);
        // Cache in localStorage
        saveToLocalStorage('ppcGeniusBrands', brandNames);
        return brandNames;
      } catch (error) {
        console.warn('Failed to fetch brands from database, using localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    return loadFromLocalStorage<string[]>('ppcGeniusBrands', []);
  },

  /**
   * Get active brand name
   */
  async getActive(): Promise<string | null> {
    // Active brand is always stored in localStorage for quick access
    return loadFromLocalStorage<string | null>('ppcGeniusActiveBrand', null);
  },

  /**
   * Set active brand
   */
  async setActive(brandName: string | null): Promise<void> {
    saveToLocalStorage('ppcGeniusActiveBrand', brandName);
  },

  /**
   * Create a new brand
   */
  async create(brandName: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Always update localStorage first (optimistic update)
    const brands = loadFromLocalStorage<string[]>('ppcGeniusBrands', []);
    if (!brands.includes(brandName)) {
      brands.push(brandName);
      saveToLocalStorage('ppcGeniusBrands', brands);
    }
    
    // Try to sync to database
    if (dbAvailable) {
      try {
        await api.brands.create(brandName);
      } catch (error) {
        console.warn('Failed to create brand in database, saved to localStorage only:', error);
      }
    }
  },

  /**
   * Delete a brand
   */
  async delete(brandName: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage first
    const brands = loadFromLocalStorage<string[]>('ppcGeniusBrands', []);
    const filteredBrands = brands.filter(b => b !== brandName);
    saveToLocalStorage('ppcGeniusBrands', filteredBrands);
    
    // Remove brand state from localStorage
    const brandStates = loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {});
    delete brandStates[brandName];
    saveToLocalStorage('ppcGeniusBrandStates', brandStates);
    
    // Try to delete from database
    if (dbAvailable) {
      try {
        const dbBrands = await api.brands.list();
        const dbBrand = dbBrands.find(b => b.name === brandName);
        if (dbBrand) {
          await api.brands.delete(dbBrand.id);
        }
      } catch (error) {
        console.warn('Failed to delete brand from database:', error);
      }
    }
  }
};

/**
 * Brand State Storage Operations
 */
export const brandStateStorage = {
  /**
   * Get all brand states
   */
  async getAll(): Promise<Record<string, BrandState>> {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      try {
        // Fetch all brands from database
        const dbBrands = await api.brands.list();
        const brandStates: Record<string, BrandState> = {};
        
        for (const brand of dbBrands) {
          // Fetch keywords for this brand
          const keywords = await api.keywords.list(brand.id);
          // Fetch campaigns for this brand
          const campaigns = await api.campaigns.list(brand.id);
          
          brandStates[brand.name] = {
            keywordResults: keywords.map(k => ({
              keyword: k.keyword,
              type: k.type as any,
              category: k.category as any,
              searchVolume: k.search_volume,
              competition: k.competition as any,
              relevance: k.relevance,
              source: k.source as any,
            })),
            searchedKeywords: [], // This is session-specific, keep in localStorage
            advancedSearchSettings: {
              advancedKeywords: '',
              minVolume: '',
              maxVolume: '',
              isWebAnalysisEnabled: false,
              brandName: brand.name,
            },
            keywordClusters: null, // TODO: Implement cluster loading
            campaigns: campaigns.map(c => ({
              id: c.id,
              name: c.name,
              adGroups: c.ad_groups?.map((ag: any) => ({
                id: ag.id,
                name: ag.name,
                keywords: ag.ad_group_keywords?.map((agk: any) => agk.keyword.keyword) || [],
              })) || [],
              totalBudget: c.total_budget ? Number(c.total_budget) : undefined,
              projections: c.projections as any,
            })),
          };
        }
        
        // Cache in localStorage
        saveToLocalStorage('ppcGeniusBrandStates', brandStates);
        return brandStates;
      } catch (error) {
        console.warn('Failed to fetch brand states from database, using localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    return loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {});
  },

  /**
   * Get state for a specific brand
   */
  async get(brandName: string): Promise<BrandState | null> {
    const allStates = await this.getAll();
    return allStates[brandName] || null;
  },

  /**
   * Update brand state
   */
  async update(brandName: string, updates: Partial<BrandState>): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage first (optimistic update)
    const brandStates = loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {});
    const currentState = brandStates[brandName] || {
      keywordResults: [],
      searchedKeywords: [],
      advancedSearchSettings: { advancedKeywords: '', minVolume: '', maxVolume: '', isWebAnalysisEnabled: false, brandName },
      keywordClusters: null,
      campaigns: [],
    };
    
    brandStates[brandName] = { ...currentState, ...updates };
    saveToLocalStorage('ppcGeniusBrandStates', brandStates);
    
    // Try to sync to database
    if (dbAvailable) {
      try {
        // Find brand in database
        const dbBrands = await api.brands.list();
        const dbBrand = dbBrands.find(b => b.name === brandName);
        
        if (!dbBrand) {
          // Brand doesn't exist in DB, create it
          const newBrand = await api.brands.create(brandName);
          await this.syncBrandToDatabase(newBrand.id, brandStates[brandName]);
        } else {
          // Sync the updates
          await this.syncBrandToDatabase(dbBrand.id, brandStates[brandName]);
        }
      } catch (error) {
        console.warn('Failed to sync brand state to database:', error);
      }
    }
  },

  /**
   * Internal: Sync brand state to database
   */
  async syncBrandToDatabase(brandId: string, state: BrandState): Promise<void> {
    // Sync keywords if they changed
    if (state.keywordResults && state.keywordResults.length > 0) {
      try {
        // Get existing keywords to avoid duplicates
        const existingKeywords = await api.keywords.list(brandId);
        const existingKeywordTexts = new Set(existingKeywords.map(k => k.keyword));
        
        // Only create keywords that don't exist yet
        const newKeywords = state.keywordResults.filter(k => !existingKeywordTexts.has(k.keyword));
        
        if (newKeywords.length > 0) {
          await api.keywords.createBulk(brandId, newKeywords);
        }
      } catch (error) {
        console.warn('Failed to sync keywords to database:', error);
      }
    }
    
    // Sync campaigns if they exist
    if (state.campaigns && state.campaigns.length > 0) {
      try {
        const existingCampaigns = await api.campaigns.list(brandId);
        const existingCampaignNames = new Set(existingCampaigns.map(c => c.name));
        
        for (const campaign of state.campaigns) {
          if (!existingCampaignNames.has(campaign.name)) {
            await api.campaigns.create(brandId, campaign);
          }
        }
      } catch (error) {
        console.warn('Failed to sync campaigns to database:', error);
      }
    }
  }
};

/**
 * Settings Storage Operations
 */
export const settingsStorage = {
  /**
   * Get dark mode setting
   */
  getDarkMode(): boolean {
    return loadFromLocalStorage<boolean>('ppcGeniusDarkMode', false);
  },

  /**
   * Set dark mode setting
   */
  setDarkMode(isDark: boolean): void {
    saveToLocalStorage('ppcGeniusDarkMode', isDark);
  },

  /**
   * Get quick start seen status
   */
  getQuickStartSeen(): boolean {
    return loadFromLocalStorage<boolean>('ppcGeniusHasSeenQuickStart', false);
  },

  /**
   * Set quick start seen status
   */
  setQuickStartSeen(seen: boolean): void {
    saveToLocalStorage('ppcGeniusHasSeenQuickStart', seen);
  }
};

/**
 * Get connection status for UI display
 */
export async function getConnectionStatus(): Promise<{
  isConnected: boolean;
  isAuthenticated: boolean;
  usingDatabase: boolean;
  usingLocalStorage: boolean;
}> {
  const isConfigured = isSupabaseConfigured();
  
  if (!isConfigured) {
    return {
      isConnected: false,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    };
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = user !== null;
    
    return {
      isConnected: true,
      isAuthenticated,
      usingDatabase: isAuthenticated,
      usingLocalStorage: true, // Always used as cache/fallback
    };
  } catch (error) {
    return {
      isConnected: false,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    };
  }
}
