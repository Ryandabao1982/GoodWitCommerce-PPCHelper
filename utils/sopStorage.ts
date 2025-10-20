import { SOP, SOPStats } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from './storage';

const GLOBAL_STORAGE_KEY = 'ppcGeniusGlobalSOPs';
const RECENTLY_VIEWED_KEY = 'ppcGeniusGlobalSOPs_recentlyViewed';

/**
 * Generate a unique ID for a SOP
 */
export const generateSOPId = (): string => {
  return `sop_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Get all SOPs (global, not brand-specific)
 */
export const getSOPs = (): SOP[] => {
  return loadFromLocalStorage<SOP[]>(GLOBAL_STORAGE_KEY, []);
};

/**
 * Save SOPs (global)
 */
export const saveSOPs = (sops: SOP[]): void => {
  saveToLocalStorage(GLOBAL_STORAGE_KEY, sops);
};

/**
 * Legacy function for backward compatibility - now returns global SOPs
 * @deprecated Use getSOPs() instead
 */
export const getSOPsForBrand = (brandName?: string): SOP[] => {
  return getSOPs();
};

/**
 * Legacy function for backward compatibility - now saves to global storage
 * @deprecated Use saveSOPs() instead
 */
export const saveSOPsForBrand = (brandName: string, sops: SOP[]): void => {
  saveSOPs(sops);
};

/**
 * Add a new SOP to global library
 */
export const addSOP = (
  sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>
): SOP => {
  const sops = getSOPs();
  const now = new Date().toISOString();
  
  const newSOP: SOP = {
    ...sopData,
    id: generateSOPId(),
    createdAt: now,
    updatedAt: now,
    viewCount: sopData.viewCount || 0,
    isFavorite: sopData.isFavorite || false,
  };

  sops.push(newSOP);
  saveSOPs(sops);
  
  return newSOP;
};

/**
 * Update an existing SOP
 */
export const updateSOP = (
  sopId: string,
  updates: Partial<SOP>
): SOP | null => {
  const sops = getSOPs();
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
  saveSOPs(sops);
  
  return updatedSOP;
};

/**
 * Delete a SOP
 */
export const deleteSOP = (sopId: string): boolean => {
  const sops = getSOPs();
  const filteredSOPs = sops.filter(sop => sop.id !== sopId);
  
  if (filteredSOPs.length === sops.length) {
    return false; // SOP not found
  }

  saveSOPs(filteredSOPs);
  return true;
};

/**
 * Toggle favorite status for a SOP
 */
export const toggleSOPFavorite = (sopId: string): boolean => {
  const sops = getSOPs();
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return false;

  updateSOP(sopId, { isFavorite: !sop.isFavorite });
  return true;
};

/**
 * Increment view count for a SOP
 */
export const incrementSOPViewCount = (sopId: string): void => {
  const sops = getSOPs();
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return;

  updateSOP(sopId, { viewCount: (sop.viewCount || 0) + 1 });
};

/**
 * Get SOP statistics
 */
export const getSOPStats = (): SOPStats => {
  const sops = getSOPs();
  
  const categoryCounts: Record<string, number> = {
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
  const mostViewed = [...sops]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map(sop => sop.id);

  // Get recently viewed from localStorage
  const recentlyViewed = loadFromLocalStorage<string[]>(RECENTLY_VIEWED_KEY, []).slice(0, 5);

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
export const trackSOPView = (sopId: string): void => {
  const recentlyViewed = loadFromLocalStorage<string[]>(RECENTLY_VIEWED_KEY, []);
  
  // Remove if already exists
  const filtered = recentlyViewed.filter(id => id !== sopId);
  
  // Add to front
  filtered.unshift(sopId);
  
  // Keep only last 10
  const updated = filtered.slice(0, 10);
  
  saveToLocalStorage(RECENTLY_VIEWED_KEY, updated);
};

/**
 * Search SOPs by query
 */
export const searchSOPs = (
  query: string,
  category?: string
): SOP[] => {
  const sops = getSOPs();
  const lowerQuery = query.toLowerCase();

  return sops.filter(sop => {
    const matchesQuery = 
      sop.title.toLowerCase().includes(lowerQuery) ||
      sop.content.toLowerCase().includes(lowerQuery) ||
      sop.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

    const matchesCategory = !category || category === 'All' || sop.category === category;

    return matchesQuery && matchesCategory;
  });
};
