import { SOP, SOPStats } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from './storage';

const STORAGE_KEY_PREFIX = 'ppcGeniusSOP_';

/**
 * Generate a unique ID for a SOP
 */
export const generateSOPId = (): string => {
  return `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all SOPs for a brand
 */
export const getSOPsForBrand = (brandName: string): SOP[] => {
  const key = `${STORAGE_KEY_PREFIX}${brandName}`;
  return loadFromLocalStorage<SOP[]>(key, []);
};

/**
 * Save SOPs for a brand
 */
export const saveSOPsForBrand = (brandName: string, sops: SOP[]): void => {
  const key = `${STORAGE_KEY_PREFIX}${brandName}`;
  saveToLocalStorage(key, sops);
};

/**
 * Add a new SOP for a brand
 */
export const addSOP = (
  brandName: string,
  sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>
): SOP => {
  const sops = getSOPsForBrand(brandName);
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
  saveSOPsForBrand(brandName, sops);
  
  return newSOP;
};

/**
 * Update an existing SOP
 */
export const updateSOP = (
  brandName: string,
  sopId: string,
  updates: Partial<SOP>
): SOP | null => {
  const sops = getSOPsForBrand(brandName);
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
  saveSOPsForBrand(brandName, sops);
  
  return updatedSOP;
};

/**
 * Delete a SOP
 */
export const deleteSOP = (brandName: string, sopId: string): boolean => {
  const sops = getSOPsForBrand(brandName);
  const filteredSOPs = sops.filter(sop => sop.id !== sopId);
  
  if (filteredSOPs.length === sops.length) {
    return false; // SOP not found
  }

  saveSOPsForBrand(brandName, filteredSOPs);
  return true;
};

/**
 * Toggle favorite status for a SOP
 */
export const toggleSOPFavorite = (brandName: string, sopId: string): boolean => {
  const sops = getSOPsForBrand(brandName);
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return false;

  updateSOP(brandName, sopId, { isFavorite: !sop.isFavorite });
  return true;
};

/**
 * Increment view count for a SOP
 */
export const incrementSOPViewCount = (brandName: string, sopId: string): void => {
  const sops = getSOPsForBrand(brandName);
  const sop = sops.find(s => s.id === sopId);
  
  if (!sop) return;

  updateSOP(brandName, sopId, { viewCount: (sop.viewCount || 0) + 1 });
};

/**
 * Get SOP statistics
 */
export const getSOPStats = (brandName: string): SOPStats => {
  const sops = getSOPsForBrand(brandName);
  
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
  const recentlyViewedKey = `${STORAGE_KEY_PREFIX}${brandName}_recentlyViewed`;
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
export const trackSOPView = (brandName: string, sopId: string): void => {
  const recentlyViewedKey = `${STORAGE_KEY_PREFIX}${brandName}_recentlyViewed`;
  const recentlyViewed = loadFromLocalStorage<string[]>(recentlyViewedKey, []);
  
  // Remove if already exists
  const filtered = recentlyViewed.filter(id => id !== sopId);
  
  // Add to front
  filtered.unshift(sopId);
  
  // Keep only last 10
  const updated = filtered.slice(0, 10);
  
  saveToLocalStorage(recentlyViewedKey, updated);
};

/**
 * Search SOPs by query
 */
export const searchSOPs = (
  brandName: string,
  query: string,
  category?: string
): SOP[] => {
  const sops = getSOPsForBrand(brandName);
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
