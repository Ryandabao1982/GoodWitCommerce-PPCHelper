/**
 * Hybrid SOP Storage Service
 * Provides unified storage interface with Supabase as the default storage
 * and localStorage as fallback only.
 * 
 * Pattern: Supabase-first (default) with localStorage fallback
 * - Default: Always use Supabase database when configured and authenticated
 * - Fallback: localStorage used only when:
 *   1. Supabase is not configured
 *   2. User is not authenticated
 *   3. Database operation fails
 */

import { api } from '../services/databaseService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { loadFromLocalStorage, saveToLocalStorage } from './storage';
import type { SOP, SOPCategory } from '../types';

const STORAGE_KEY_PREFIX = 'ppcGeniusSOP_';

/**
 * Generate a unique ID for a SOP (used for localStorage only)
 */
const generateSOPId = (): string => {
  return `sop_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Check if Supabase database is available for SOP operations
 * This determines whether to use Supabase (default) or localStorage (fallback)
 */
async function isDatabaseAvailable(): Promise<boolean> {
  // Fallback to localStorage if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return false;
  }
  
  try {
    // Use Supabase as default when user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    return user !== null;
  } catch (error) {
    // Fallback to localStorage on error
    console.error('Error checking database availability, falling back to localStorage:', error);
    return false;
  }
}

/**
 * Convert database SOP to app SOP format
 */
function dbSOPToAppSOP(dbSOP: any): SOP {
  return {
    id: dbSOP.id,
    title: dbSOP.title,
    content: dbSOP.content,
    category: dbSOP.category as SOPCategory,
    tags: dbSOP.tags || [],
    isFavorite: dbSOP.is_favorite || false,
    viewCount: dbSOP.view_count || 0,
    createdAt: dbSOP.created_at,
    updatedAt: dbSOP.updated_at,
    createdBy: dbSOP.created_by,
  };
}

/**
 * SOP Hybrid Storage Operations
 * Uses Supabase as default storage, localStorage as fallback
 */
export const sopHybridStorage = {
  /**
   * Get all SOPs for a brand
   * Uses Supabase as default storage, localStorage as fallback
   */
  async list(brandName: string): Promise<SOP[]> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Default: Use Supabase when available
    if (dbAvailable) {
      try {
        // Get brand ID from Supabase database
        const brands = await api.brands.list();
        const brand = brands.find(b => b.name === brandName);
        
        if (brand) {
          const dbSOPs = await api.sops.list(brand.id);
          const sops = dbSOPs.map(dbSOPToAppSOP);
          
          // Cache in localStorage for performance
          const key = `${STORAGE_KEY_PREFIX}${brandName}`;
          saveToLocalStorage(key, sops);
          
          return sops;
        }
      } catch (error) {
        console.warn('Supabase unavailable, falling back to localStorage:', error);
      }
    }
    
    // Fallback: localStorage when Supabase not available
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    return loadFromLocalStorage<SOP[]>(key, []);
  },

  /**
   * Get a specific SOP by ID
   * Uses Supabase as default storage, localStorage as fallback
   */
  async get(brandName: string, sopId: string): Promise<SOP | null> {
    const sops = await this.list(brandName);
    return sops.find(sop => sop.id === sopId) || null;
  },

  /**
   * Create a new SOP
   * Saves to Supabase (default) with localStorage as fallback/cache
   */
  async create(brandName: string, sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>): Promise<SOP> {
    const dbAvailable = await isDatabaseAvailable();
    const now = new Date().toISOString();
    
    // Create SOP object for localStorage (fallback/cache)
    const localSOP: SOP = {
      ...sopData,
      id: generateSOPId(),
      createdAt: now,
      updatedAt: now,
      viewCount: sopData.viewCount || 0,
      isFavorite: sopData.isFavorite || false,
    };

    // Optimistic update to localStorage (cache/fallback)
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    sops.push(localSOP);
    saveToLocalStorage(key, sops);
    
    // Default: Save to Supabase when available
    if (dbAvailable) {
      try {
        const brands = await api.brands.list();
        const brand = brands.find(b => b.name === brandName);
        
        if (brand) {
          const dbSOP = await api.sops.create(brand.id, sopData);
          const createdSOP = dbSOPToAppSOP(dbSOP);
          
          // Update localStorage cache with Supabase ID
          const index = sops.findIndex(s => s.id === localSOP.id);
          if (index !== -1) {
            sops[index] = createdSOP;
            saveToLocalStorage(key, sops);
          }
          
          return createdSOP;
        }
      } catch (error) {
        console.warn('Failed to save SOP to Supabase, using localStorage fallback:', error);
      }
    }
    
    return localSOP;
  },

  /**
   * Update an existing SOP
   * Updates in Supabase (default) with localStorage as fallback/cache
   */
  async update(brandName: string, sopId: string, updates: Partial<SOP>): Promise<SOP | null> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Optimistic update to localStorage (cache/fallback)
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    const index = sops.findIndex(sop => sop.id === sopId);
    
    if (index === -1) return null;

    const updatedSOP: SOP = {
      ...sops[index],
      ...updates,
      id: sops[index].id, // Preserve ID
      createdAt: sops[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    sops[index] = updatedSOP;
    saveToLocalStorage(key, sops);
    
    // Default: Update in Supabase when available
    if (dbAvailable) {
      try {
        const dbSOP = await api.sops.update(sopId, updates);
        const syncedSOP = dbSOPToAppSOP(dbSOP);
        
        // Update localStorage cache with synced data from Supabase
        sops[index] = syncedSOP;
        saveToLocalStorage(key, sops);
        
        return syncedSOP;
      } catch (error) {
        console.warn('Failed to update SOP in Supabase, using localStorage fallback:', error);
      }
    }
    
    return updatedSOP;
  },

  /**
   * Delete a SOP
   * Deletes from Supabase (default) with localStorage as fallback
   */
  async delete(brandName: string, sopId: string): Promise<boolean> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage (cache/fallback)
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    const filteredSOPs = sops.filter(sop => sop.id !== sopId);
    
    if (filteredSOPs.length === sops.length) {
      return false; // SOP not found
    }

    saveToLocalStorage(key, filteredSOPs);
    
    // Default: Delete from Supabase when available
    if (dbAvailable) {
      try {
        await api.sops.delete(sopId);
      } catch (error) {
        console.warn('Failed to delete SOP from Supabase:', error);
      }
    }
    
    return true;
  },

  /**
   * Toggle favorite status
   * Updates in Supabase (default) with localStorage as fallback
   */
  async toggleFavorite(brandName: string, sopId: string): Promise<boolean> {
    const sop = await this.get(brandName, sopId);
    if (!sop) return false;

    const newFavoriteStatus = !sop.isFavorite;

    // Update using the update method which handles both storage layers
    await this.update(brandName, sopId, { isFavorite: newFavoriteStatus });
    return true;
  },

  /**
   * Increment view count
   * Records view in Supabase (default) with localStorage as fallback/cache
   */
  async incrementViewCount(brandName: string, sopId: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage (cache/fallback)
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    const index = sops.findIndex(sop => sop.id === sopId);
    
    if (index !== -1) {
      sops[index].viewCount = (sops[index].viewCount || 0) + 1;
      saveToLocalStorage(key, sops);
    }
    
    // Default: Record view in Supabase (this will auto-increment via trigger)
    if (dbAvailable) {
      try {
        await api.sops.recordView(sopId);
      } catch (error) {
        console.warn('Failed to record SOP view in Supabase:', error);
      }
    }
  },

  /**
   * Search SOPs
   * Uses Supabase as default storage, localStorage as fallback
   */
  async search(brandName: string, searchText: string): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    
    // Simple local search (case-insensitive)
    const lowerSearch = searchText.toLowerCase();
    return allSOPs.filter(sop => 
      sop.title.toLowerCase().includes(lowerSearch) ||
      sop.content.toLowerCase().includes(lowerSearch) ||
      sop.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
    );
  },

  /**
   * Get SOPs by category
   * Uses Supabase as default storage, localStorage as fallback
   */
  async getByCategory(brandName: string, category: SOPCategory): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs.filter(sop => sop.category === category);
  },

  /**
   * Get favorite SOPs
   * Uses Supabase as default storage, localStorage as fallback
   */
  async getFavorites(brandName: string): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs.filter(sop => sop.isFavorite);
  },

  /**
   * Get most viewed SOPs
   * Uses Supabase as default storage, localStorage as fallback
   */
  async getMostViewed(brandName: string, limit: number = 10): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  },
};

export default sopHybridStorage;
