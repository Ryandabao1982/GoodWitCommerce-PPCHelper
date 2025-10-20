import { useCallback, useEffect, useState } from 'react';
import type { SOP } from '../../types';
import {
  addSOP,
  deleteSOP,
  getSOPsForBrand,
  incrementSOPViewCount,
  toggleSOPFavorite,
  trackSOPView,
  updateSOP,
} from '../../utils/sopStorage';
import { aiSearchSOPs, getAIRecommendedSOPs } from '../../services/sopService';

interface RecommendationContext {
  recentSearches?: string[];
  currentView?: string;
  activeBrand?: string | null;
}

type SOPInput = Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>;

export interface UseSOPManagerResult {
  sops: SOP[];
  refresh: () => Promise<void>;
  addSOP: (brand: string, sop: SOPInput) => Promise<void>;
  updateSOP: (brand: string, id: string, updates: Partial<SOP>) => Promise<void>;
  deleteSOP: (brand: string, id: string) => Promise<void>;
  toggleFavorite: (brand: string, id: string) => Promise<void>;
  recordView: (brand: string, id: string) => Promise<void>;
  recordViewAnalytics: (brand: string, id: string) => Promise<void>;
  aiSearch: (query: string, availableSops: SOP[]) => Promise<SOP[]>;
  aiRecommend: (availableSops: SOP[], context: RecommendationContext) => Promise<SOP[]>;
}

export const useSOPManager = (activeBrand: string | null): UseSOPManagerResult => {
  const [sops, setSops] = useState<SOP[]>([]);

  const refresh = useCallback(async () => {
    if (!activeBrand) {
      setSops([]);
      return;
    }

    try {
      const loaded = await getSOPsForBrand(activeBrand);
      setSops(loaded);
    } catch (error) {
      console.error('Error loading SOPs:', error);
      setSops([]);
    }
  }, [activeBrand]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addSOPForBrand = useCallback(
    async (brand: string, sop: SOPInput) => {
      await addSOP(brand, sop);
      await refresh();
    },
    [refresh]
  );

  const updateSOPForBrand = useCallback(
    async (brand: string, id: string, updates: Partial<SOP>) => {
      await updateSOP(brand, id, updates);
      await refresh();
    },
    [refresh]
  );

  const deleteSOPForBrand = useCallback(
    async (brand: string, id: string) => {
      await deleteSOP(brand, id);
      await refresh();
    },
    [refresh]
  );

  const toggleFavoriteForBrand = useCallback(
    async (brand: string, id: string) => {
      await toggleSOPFavorite(brand, id);
      await refresh();
    },
    [refresh]
  );

  const recordViewForBrand = useCallback(async (brand: string, id: string) => {
    await incrementSOPViewCount(brand, id);
  }, []);

  const recordViewAnalyticsForBrand = useCallback(async (brand: string, id: string) => {
    await trackSOPView(brand, id);
  }, []);

  const aiSearchHandler = useCallback(async (query: string, availableSops: SOP[]) => {
    return aiSearchSOPs(query, availableSops);
  }, []);

  const aiRecommendHandler = useCallback(
    async (availableSops: SOP[], context: RecommendationContext) => {
      return getAIRecommendedSOPs(availableSops, context);
    },
    []
  );

  return {
    sops,
    refresh,
    addSOP: addSOPForBrand,
    updateSOP: updateSOPForBrand,
    deleteSOP: deleteSOPForBrand,
    toggleFavorite: toggleFavoriteForBrand,
    recordView: recordViewForBrand,
    recordViewAnalytics: recordViewAnalyticsForBrand,
    aiSearch: aiSearchHandler,
    aiRecommend: aiRecommendHandler,
  };
};
