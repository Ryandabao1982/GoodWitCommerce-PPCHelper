import { SOP, SOPStats, SOPCategory } from '../types';
import { sopHybridStorage } from './sopHybridStorage';

/**
 * Legacy SOP Storage Functions
 * These functions now use sopHybridStorage under the hood
 * Maintained for backward compatibility with existing code
 */

/**
 * Generate a unique ID for a SOP (legacy - only used for localStorage fallback)
 */
export const generateSOPId = (): string => {
  return `sop_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Get all SOPs for a brand
 */
export const getSOPsForBrand = async (brandName: string): Promise<SOP[]> => {
  return sopHybridStorage.list(brandName);
};

/**
 * Save SOPs for a brand (deprecated - use individual operations instead)
 */
export const saveSOPsForBrand = async (brandName: string, sops: SOP[]): Promise<void> => {
  // This function is kept for compatibility but shouldn't be used
  // Individual create/update/delete operations are preferred
  console.warn('saveSOPsForBrand is deprecated. Use create/update/delete operations instead.');
};

/**
 * Add a new SOP for a brand
 */
export const addSOP = async (
  brandName: string,
  sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SOP> => {
  return sopHybridStorage.create(brandName, sopData);
};

/**
 * Update an existing SOP
 */
export const updateSOP = async (
  brandName: string,
  sopId: string,
  updates: Partial<SOP>
): Promise<SOP | null> => {
  return sopHybridStorage.update(brandName, sopId, updates);
};

/**
 * Delete a SOP
 */
export const deleteSOP = async (brandName: string, sopId: string): Promise<boolean> => {
  return sopHybridStorage.delete(brandName, sopId);
};

/**
 * Toggle favorite status for a SOP
 */
export const toggleSOPFavorite = async (brandName: string, sopId: string): Promise<boolean> => {
  return sopHybridStorage.toggleFavorite(brandName, sopId);
};

/**
 * Increment view count for a SOP
 */
export const incrementSOPViewCount = async (brandName: string, sopId: string): Promise<void> => {
  await sopHybridStorage.incrementViewCount(brandName, sopId);
};

/**
 * Get SOP statistics
 */
export const getSOPStats = async (brandName: string): Promise<SOPStats> => {
  const sops = await sopHybridStorage.list(brandName);
  
  const categoryCounts: Record<SOPCategory, number> = {
    'Campaign Management': 0,
    'Keyword Research': 0,
    'Brand Setup': 0,
    'Performance Analysis': 0,
    'Optimization': 0,
    'Reporting': 0,
    'General': 0,
  };

  sops.forEach(sop => {
    categoryCounts[sop.category] = (categoryCounts[sop.category] || 0) + 1;
  });

  // Get most viewed SOPs
  const mostViewedSOPs = await sopHybridStorage.getMostViewed(brandName, 5);
  const mostViewed = mostViewedSOPs.map(sop => sop.id);

  // Get recently viewed from localStorage (session-specific)
  const { loadFromLocalStorage } = await import('./storage');
  const recentlyViewedKey = `ppcGeniusSOP_${brandName}_recentlyViewed`;
  const recentlyViewed = loadFromLocalStorage<string[]>(recentlyViewedKey, []).slice(0, 5);

  return {
    totalSOPs: sops.length,
    categoryCounts: categoryCounts as any,
    recentlyViewed,
    mostViewed,
  };
};

/**
 * Track a SOP view for recently viewed list
 */
export const trackSOPView = async (brandName: string, sopId: string): Promise<void> => {
  // Track in localStorage for session-specific recently viewed
  const { loadFromLocalStorage, saveToLocalStorage } = await import('./storage');
  const recentlyViewedKey = `ppcGeniusSOP_${brandName}_recentlyViewed`;
  const recentlyViewed = loadFromLocalStorage<string[]>(recentlyViewedKey, []);
  
  // Remove if already exists
  const filtered = recentlyViewed.filter(id => id !== sopId);
  
  // Add to front
  filtered.unshift(sopId);
  
  // Keep only last 10
  const updated = filtered.slice(0, 10);
  
  saveToLocalStorage(recentlyViewedKey, updated);
  
  // Also increment view count (which syncs to database if available)
  await sopHybridStorage.incrementViewCount(brandName, sopId);
};

/**
 * Search SOPs by query
 */
export const searchSOPs = async (
  brandName: string,
  query: string,
  category?: SOPCategory
): Promise<SOP[]> => {
  const sops = await sopHybridStorage.list(brandName);
  const lowerQuery = query.toLowerCase();

  return sops.filter(sop => {
    const matchesQuery = 
      sop.title.toLowerCase().includes(lowerQuery) ||
      sop.content.toLowerCase().includes(lowerQuery) ||
      sop.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

    const matchesCategory = !category || category === 'All' as any || sop.category === category;

    return matchesQuery && matchesCategory;
  });
};
