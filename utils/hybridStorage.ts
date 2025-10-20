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
import type {
  BrandState,
  Campaign,
  CompetitionLevel,
  KeywordCategory,
  KeywordSource,
  KeywordType,
  NegativeMatchType,
  PlannerNegativeKeyword,
} from '../types';

interface SupabaseKeywordRecord {
  keyword: string;
  type: string | null;
  category: string | null;
  search_volume: string;
  competition: string | null;
  relevance: number;
  source: string | null;
}

interface SupabaseNegativeKeywordRecord {
  id: string;
  keyword: string;
  match_type: string | null;
  reason?: string | null;
  source?: string | null;
}

interface SupabaseAdGroupKeywordRecord {
  keyword: {
    keyword: string;
  };
}

interface SupabaseAdGroupRecord {
  id: string;
  name: string;
  ad_group_keywords?: SupabaseAdGroupKeywordRecord[];
  negative_keywords?: SupabaseNegativeKeywordRecord[];
}

interface SupabaseCampaignRecord {
  id: string;
  name: string;
  total_budget: number | null;
  projections: Campaign['projections'] | null;
  ad_groups?: SupabaseAdGroupRecord[];
  negative_keywords?: SupabaseNegativeKeywordRecord[];
}

type NegativeSource = NonNullable<PlannerNegativeKeyword['source']>;

const parseKeywordType = (value: string | null): KeywordType => {
  if (value === 'Broad' || value === 'Phrase' || value === 'Exact' || value === 'Long-tail') {
    return value;
  }
  return 'Broad';
};

const parseKeywordCategory = (value: string | null): KeywordCategory => {
  if (
    value === 'Core' ||
    value === 'Opportunity' ||
    value === 'Branded' ||
    value === 'Low-hanging Fruit' ||
    value === 'Complementary'
  ) {
    return value;
  }
  return 'Core';
};

const parseCompetitionLevel = (value: string | null): CompetitionLevel => {
  if (value === 'Low' || value === 'Medium' || value === 'High') {
    return value;
  }
  return 'Medium';
};

const parseKeywordSource = (value: string | null): KeywordSource => {
  if (value === 'AI' || value === 'Web') {
    return value;
  }
  return 'AI';
};

const parseNegativeMatchType = (value: string | null): NegativeMatchType => {
  if (value === 'Negative Exact' || value === 'Negative Phrase') {
    return value;
  }
  return 'Negative Phrase';
};

const parseNegativeSource = (value: string | null): PlannerNegativeKeyword['source'] => {
  if (value === 'manual' || value === 'imported' || value === 'synced') {
    return value as NegativeSource;
  }
  return undefined;
};

const mapSupabaseNegativeKeywords = (
  records: SupabaseNegativeKeywordRecord[] | undefined
): PlannerNegativeKeyword[] =>
  (records ?? []).map((record) => ({
    id: record.id,
    keyword: record.keyword,
    matchType: parseNegativeMatchType(record.match_type),
    note: record.reason ?? undefined,
    source: parseNegativeSource(record.source) ?? 'synced',
  }));

const ensureCampaignNegativeDefaults = (campaign: Campaign): Campaign => ({
  ...campaign,
  negativeKeywords: campaign.negativeKeywords ?? [],
  adGroups: campaign.adGroups.map((adGroup) => ({
    ...adGroup,
    negativeKeywords: adGroup.negativeKeywords ?? [],
  })),
});

const normalizeBrandState = (state: BrandState): BrandState => ({
  ...state,
  campaigns: state.campaigns ? state.campaigns.map(ensureCampaignNegativeDefaults) : [],
  negativeKeywordLists: state.negativeKeywordLists ?? [],
});

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
          const keywords = (await api.keywords.list(brand.id)) as SupabaseKeywordRecord[];
          // Fetch campaigns for this brand
          const campaigns = (await api.campaigns.list(brand.id)) as SupabaseCampaignRecord[];

          brandStates[brand.name] = {
            keywordResults: keywords.map((k) => ({
              keyword: k.keyword,
              type: parseKeywordType(k.type),
              category: parseKeywordCategory(k.category),
              searchVolume: k.search_volume,
              competition: parseCompetitionLevel(k.competition),
              relevance: k.relevance,
              source: parseKeywordSource(k.source),
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
                c.ad_groups?.map((adGroup) => ({
                  id: adGroup.id,
                  name: adGroup.name,
                  keywords:
                    adGroup.ad_group_keywords?.map((keyword) => keyword.keyword.keyword) || [],
                  negativeKeywords: mapSupabaseNegativeKeywords(adGroup.negative_keywords),
                })) || [],
              totalBudget: c.total_budget ? Number(c.total_budget) : undefined,
              projections: c.projections ?? null,
              negativeKeywords: mapSupabaseNegativeKeywords(c.negative_keywords),
            })),
            negativeKeywordLists: [],
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
    const fallbackStates = loadFromLocalStorage<Record<string, BrandState>>(
      'ppcGeniusBrandStates',
      {}
    );
    return Object.fromEntries(
      Object.entries(fallbackStates).map(([name, state]) => [name, normalizeBrandState(state)])
    );
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
    const currentState = brandStates[brandName]
      ? normalizeBrandState(brandStates[brandName])
      : normalizeBrandState({
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
          negativeKeywordLists: [],
        } as BrandState);

    const nextCampaigns = updates.campaigns
      ? updates.campaigns.map(ensureCampaignNegativeDefaults)
      : currentState.campaigns;

    brandStates[brandName] = normalizeBrandState({
      ...currentState,
      ...updates,
      campaigns: nextCampaigns,
      negativeKeywordLists: updates.negativeKeywordLists ?? currentState.negativeKeywordLists ?? [],
    });
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
    console.warn('Failed to determine Supabase connection status, assuming offline mode:', error);
    return {
      isConnected: false,
      isAuthenticated: false,
      usingDatabase: false,
      usingLocalStorage: true,
    };
  }
}
