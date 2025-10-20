/**
 * Hybrid SOP Storage Service
 * Provides unified storage interface for SOPs that uses database when available,
 * with localStorage as a fallback/cache layer.
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
 * Check if database is available for SOP operations
 */
async function isDatabaseAvailable(): Promise<boolean> {
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
 */
export const sopHybridStorage = {
  /**
   * Get all SOPs for a brand
   */
  async list(brandName: string): Promise<SOP[]> {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      try {
        // Get brand ID from database
        const brands = await api.brands.list();
        const brand = brands.find(b => b.name === brandName);
        
        if (brand) {
          const dbSOPs = await api.sops.list(brand.id);
          const sops = dbSOPs.map(dbSOPToAppSOP);
          
          // Cache in localStorage
          const key = `${STORAGE_KEY_PREFIX}${brandName}`;
          saveToLocalStorage(key, sops);
          
          return sops;
        }
      } catch (error) {
        console.warn('Failed to fetch SOPs from database, using localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    return loadFromLocalStorage<SOP[]>(key, []);
  },

  /**
   * Get a specific SOP by ID
   */
  async get(brandName: string, sopId: string): Promise<SOP | null> {
    const sops = await this.list(brandName);
    return sops.find(sop => sop.id === sopId) || null;
  },

  /**
   * Create a new SOP
   */
  async create(brandName: string, sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>): Promise<SOP> {
    const dbAvailable = await isDatabaseAvailable();
    const now = new Date().toISOString();
    
    // Create SOP object for localStorage
    const localSOP: SOP = {
      ...sopData,
      id: generateSOPId(),
      createdAt: now,
      updatedAt: now,
      viewCount: sopData.viewCount || 0,
      isFavorite: sopData.isFavorite || false,
    };

    // Always update localStorage first (optimistic update)
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    sops.push(localSOP);
    saveToLocalStorage(key, sops);
    
    // Try to sync to database
    if (dbAvailable) {
      try {
        const brands = await api.brands.list();
        const brand = brands.find(b => b.name === brandName);
        
        if (brand) {
          const dbSOP = await api.sops.create(brand.id, sopData);
          const createdSOP = dbSOPToAppSOP(dbSOP);
          
          // Update localStorage with database ID
          const index = sops.findIndex(s => s.id === localSOP.id);
          if (index !== -1) {
            sops[index] = createdSOP;
            saveToLocalStorage(key, sops);
          }
          
          return createdSOP;
        }
      } catch (error) {
        console.warn('Failed to create SOP in database, saved to localStorage only:', error);
      }
    }
    
    return localSOP;
  },

  /**
   * Update an existing SOP
   */
  async update(brandName: string, sopId: string, updates: Partial<SOP>): Promise<SOP | null> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage first (optimistic update)
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
    
    // Try to sync to database
    if (dbAvailable) {
      try {
        const dbSOP = await api.sops.update(sopId, updates);
        const syncedSOP = dbSOPToAppSOP(dbSOP);
        
        // Update localStorage with synced data
        sops[index] = syncedSOP;
        saveToLocalStorage(key, sops);
        
        return syncedSOP;
      } catch (error) {
        console.warn('Failed to update SOP in database, updated localStorage only:', error);
      }
    }
    
    return updatedSOP;
  },

  /**
   * Delete a SOP
   */
  async delete(brandName: string, sopId: string): Promise<boolean> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage first
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    const filteredSOPs = sops.filter(sop => sop.id !== sopId);
    
    if (filteredSOPs.length === sops.length) {
      return false; // SOP not found
    }

    saveToLocalStorage(key, filteredSOPs);
    
    // Try to delete from database
    if (dbAvailable) {
      try {
        await api.sops.delete(sopId);
      } catch (error) {
        console.warn('Failed to delete SOP from database:', error);
      }
    }
    
    return true;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(brandName: string, sopId: string): Promise<boolean> {
    const sops = loadFromLocalStorage<SOP[]>(`${STORAGE_KEY_PREFIX}${brandName}`, []);
    const index = sops.findIndex(sop => sop.id === sopId);
    
    if (index === -1) return false;

    const newFavoriteStatus = !sops[index].isFavorite;
    
    // Update using the update method which handles both storage layers
    await this.update(brandName, sopId, { isFavorite: newFavoriteStatus });
    
    return true;
  },

  /**
   * Increment view count
   */
  async incrementViewCount(brandName: string, sopId: string): Promise<void> {
    const dbAvailable = await isDatabaseAvailable();
    
    // Update localStorage
    const key = `${STORAGE_KEY_PREFIX}${brandName}`;
    const sops = loadFromLocalStorage<SOP[]>(key, []);
    const index = sops.findIndex(sop => sop.id === sopId);
    
    if (index !== -1) {
      sops[index].viewCount = (sops[index].viewCount || 0) + 1;
      saveToLocalStorage(key, sops);
    }
    
    // Record view in database (this will auto-increment via trigger)
    if (dbAvailable) {
      try {
        await api.sops.recordView(sopId);
      } catch (error) {
        console.warn('Failed to record SOP view in database:', error);
      }
    }
  },

  /**
   * Search SOPs
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
   */
  async getByCategory(brandName: string, category: SOPCategory): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs.filter(sop => sop.category === category);
  },

  /**
   * Get favorite SOPs
   */
  async getFavorites(brandName: string): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs.filter(sop => sop.isFavorite);
  },

  /**
   * Get most viewed SOPs
   */
  async getMostViewed(brandName: string, limit: number = 10): Promise<SOP[]> {
    const allSOPs = await this.list(brandName);
    return allSOPs
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  },
};

export default sopHybridStorage;
