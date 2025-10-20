/**
 * Hybrid Storage Service
 * Provides unified storage interface with Supabase as the default storage
 * and localStorage as fallback only.
 *
 * Pattern: Supabase-first (default) with localStorage fallback
 * - Default: Always use Supabase database when configured and authenticated
 * - Fallback: localStorage used only when:
 *   1. Supabase is not configured
 *   2. User is not authenticated
 *   3. Database operation fails
 * - localStorage serves as local cache for performance and offline access
 */

import { api } from '../services/databaseService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { loadFromLocalStorage, saveToLocalStorage } from './storage';
import type { BrandState } from '../types';
import type { ViewType } from '../components/ViewSwitcher';

const DEFAULT_VIEW: ViewType = 'research';
const VIEW_OPTIONS: ViewType[] = ['research', 'bank', 'planner', 'brand', 'sop', 'settings'];

/**
 * Check if Supabase database is available (configured and user authenticated)
 * This determines whether to use Supabase (default) or localStorage (fallback)
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  // Fallback to localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Use Supabase as default when user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user !== null;
  } catch (error) {
    // Fallback to localStorage on error
    console.error('Error checking database availability, falling back to localStorage:', error);
    return false;
  }
}

/**
 * Brand Storage Operations
 */
export const brandStorage = {
  /**
   * Get all brands
   * Uses Supabase as default storage, localStorage as fallback
   */
  async list(): Promise<string[]> {
    const dbAvailable = await isDatabaseAvailable();

    // Default: Use Supabase when available
    if (dbAvailable) {
      try {
        const brands = await api.brands.list();
        const brandNames = brands.map((b) => b.name);
        // Cache in localStorage for performance and offline access
        saveToLocalStorage('ppcGeniusBrands', brandNames);
        return brandNames;
      } catch (error) {
        console.warn('Supabase unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback: localStorage when Supabase not available
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
   * Saves to Supabase (default) with localStorage as fallback/cache
   */
  async create(brandName: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();

    // Optimistic update to localStorage (cache/fallback)
    const brands = loadFromLocalStorage<string[]>('ppcGeniusBrands', []);
    if (!brands.includes(brandName)) {
      brands.push(brandName);
      saveToLocalStorage('ppcGeniusBrands', brands);
    }

    // Default: Save to Supabase when available
    if (dbAvailable) {
      try {
        await api.brands.create(brandName);
      } catch (error) {
        console.warn('Failed to save brand to Supabase, using localStorage fallback:', error);
      }
    }
  },

  /**
   * Delete a brand
   * Deletes from Supabase (default) with localStorage as fallback
   */
  async delete(brandName: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();

    // Update localStorage (cache/fallback)
    const brands = loadFromLocalStorage<string[]>('ppcGeniusBrands', []);
    const filteredBrands = brands.filter((b) => b !== brandName);
    saveToLocalStorage('ppcGeniusBrands', filteredBrands);

    // Remove brand state from localStorage
    const brandStates = loadFromLocalStorage<Record<string, BrandState>>(
      'ppcGeniusBrandStates',
      {}
    );
    delete brandStates[brandName];
    saveToLocalStorage('ppcGeniusBrandStates', brandStates);

    // Default: Delete from Supabase when available
    if (dbAvailable) {
      try {
        const dbBrands = await api.brands.list();
        const dbBrand = dbBrands.find((b) => b.name === brandName);
        if (dbBrand) {
          await api.brands.delete(dbBrand.id);
        }
      } catch (error) {
        console.warn('Failed to delete brand from database:', error);
      }
    }
  },
};

/**
 * Brand State Storage Operations
 * Uses Supabase as default storage, localStorage as fallback
 */
export const brandStateStorage = {
  /**
   * Get all brand states
   * Uses Supabase as default storage, localStorage as fallback
   */
  async getAll(): Promise<Record<string, BrandState>> {
    const dbAvailable = await isDatabaseAvailable();

    // Default: Use Supabase when available
    if (dbAvailable) {
      try {
        // Fetch all brands from Supabase database
        const dbBrands = await api.brands.list();
        const brandStates: Record<string, BrandState> = {};

        for (const brand of dbBrands) {
          // Fetch keywords for this brand
          const keywords = await api.keywords.list(brand.id);
          // Fetch campaigns for this brand
          const campaigns = await api.campaigns.list(brand.id);

          brandStates[brand.name] = {
            keywordResults: keywords.map((k) => ({
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
            campaigns: campaigns.map((c) => ({
              id: c.id,
              name: c.name,
              adGroups:
                c.ad_groups?.map((ag: any) => ({
                  id: ag.id,
                  name: ag.name,
                  keywords: ag.ad_group_keywords?.map((agk: any) => agk.keyword.keyword) || [],
                })) || [],
              totalBudget: c.total_budget ? Number(c.total_budget) : undefined,
              projections: c.projections as any,
            })),
          };
        }

        // Cache in localStorage for performance
        saveToLocalStorage('ppcGeniusBrandStates', brandStates);
        return brandStates;
      } catch (error) {
        console.warn('Supabase unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback: localStorage when Supabase not available
    return loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {});
  },

  /**
   * Get state for a specific brand
   * Uses Supabase as default storage, localStorage as fallback
   */
  async get(brandName: string): Promise<BrandState | null> {
    const allStates = await this.getAll();
    return allStates[brandName] || null;
  },

  /**
   * Update brand state
   * Saves to Supabase (default) with localStorage as fallback/cache
   */
  async update(brandName: string, updates: Partial<BrandState>): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();

    // Optimistic update to localStorage (cache/fallback)
    const brandStates = loadFromLocalStorage<Record<string, BrandState>>(
      'ppcGeniusBrandStates',
      {}
    );
    const currentState = brandStates[brandName] || {
      keywordResults: [],
      searchedKeywords: [],
      advancedSearchSettings: {
        advancedKeywords: '',
        minVolume: '',
        maxVolume: '',
        isWebAnalysisEnabled: false,
        brandName,
      },
      keywordClusters: null,
      campaigns: [],
    };

    brandStates[brandName] = { ...currentState, ...updates };
    saveToLocalStorage('ppcGeniusBrandStates', brandStates);

    // Default: Sync to Supabase when available
    if (dbAvailable) {
      try {
        // Find brand in Supabase database
        const dbBrands = await api.brands.list();
        const dbBrand = dbBrands.find((b) => b.name === brandName);

        if (!dbBrand) {
          // Brand doesn't exist in Supabase, create it
          const newBrand = await api.brands.create(brandName);
          await this.syncBrandToDatabase(newBrand.id, brandStates[brandName]);
        } else {
          // Sync the updates to Supabase
          await this.syncBrandToDatabase(dbBrand.id, brandStates[brandName]);
        }
      } catch (error) {
        console.warn('Failed to sync brand state to Supabase:', error);
      }
    }
  },

  /**
   * Internal: Sync brand state to Supabase database
   */
  async syncBrandToDatabase(brandId: string, state: BrandState): Promise<void> {
    // Sync keywords to Supabase if they changed
    if (state.keywordResults && state.keywordResults.length > 0) {
      try {
        // Get existing keywords from Supabase to avoid duplicates
        const existingKeywords = await api.keywords.list(brandId);
        const existingKeywordTexts = new Set(existingKeywords.map((k) => k.keyword));

        // Only create keywords that don't exist in Supabase yet
        const newKeywords = state.keywordResults.filter(
          (k) => !existingKeywordTexts.has(k.keyword)
        );

        if (newKeywords.length > 0) {
          await api.keywords.createBulk(brandId, newKeywords);
        }
      } catch (error) {
        console.warn('Failed to sync keywords to Supabase:', error);
      }
    }

    // Sync campaigns to Supabase if they exist
    if (state.campaigns && state.campaigns.length > 0) {
      try {
        const existingCampaigns = await api.campaigns.list(brandId);
        const existingCampaignNames = new Set(existingCampaigns.map((c) => c.name));

        for (const campaign of state.campaigns) {
          if (!existingCampaignNames.has(campaign.name)) {
            await api.campaigns.create(brandId, campaign);
          }
        }
      } catch (error) {
        console.warn('Failed to sync campaigns to Supabase:', error);
      }
    }
  },
};

/**
 * Settings Storage Operations
 * Settings always use localStorage (session-specific preferences)
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
  },

  /**
   * Get last active view
   */
  getLastView(): ViewType {
    if (typeof window === 'undefined') {
      return DEFAULT_VIEW;
    }

    const storedView = loadFromLocalStorage<string>('ppcGeniusLastView', DEFAULT_VIEW);
    return VIEW_OPTIONS.includes(storedView as ViewType) ? (storedView as ViewType) : DEFAULT_VIEW;
  },

  /**
   * Persist last active view
   */
  setLastView(view: ViewType): void {
    saveToLocalStorage('ppcGeniusLastView', VIEW_OPTIONS.includes(view) ? view : DEFAULT_VIEW);
  },
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isAuthenticated = user !== null;

    return {
      isConnected: true,
      isAuthenticated,
      usingDatabase: isAuthenticated,
      usingLocalStorage: true, // Always used as cache/fallback
    };
  } catch (error) {
    console.error('Error checking database availability for status:', error);
    return {
      isConnected: false,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    };
  }
}
