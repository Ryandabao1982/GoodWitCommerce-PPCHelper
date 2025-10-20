import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BrandState } from '../../types';
import { brandStateStorage, brandStorage } from '../../utils/hybridStorage';
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/storage';

const DEFAULT_ADVANCED_SETTINGS = {
  advancedKeywords: '',
  minVolume: '',
  maxVolume: '',
  isWebAnalysisEnabled: false,
  brandName: '',
  asin: '',
};

const createDefaultBrandState = (): BrandState => ({
  keywordResults: [],
  searchedKeywords: [],
  advancedSearchSettings: { ...DEFAULT_ADVANCED_SETTINGS },
  keywordClusters: null,
  campaigns: [],
});

export interface UseBrandManagerResult {
  brands: string[];
  activeBrand: string | null;
  lastActiveBrand: string | null;
  brandStates: Record<string, BrandState>;
  activeBrandState: BrandState | null;
  hasHydrated: boolean;
  createBrand: (brandName: string, options?: { budget?: number; asins?: string[] }) => Promise<boolean>;
  selectBrand: (brandName: string | null) => void;
  deleteBrand: (brandName: string) => Promise<void>;
  updateBrandState: (brandName: string, updates: Partial<BrandState>) => void;
  reloadFromStorage: () => Promise<void>;
}

export const useBrandManager = (): UseBrandManagerResult => {
  const [brands, setBrands] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [brandStates, setBrandStates] = useState<Record<string, BrandState>>({});
  const [lastActiveBrand, setLastActiveBrand] = useState<string | null>(() =>
    loadFromLocalStorage<string | null>('ppcGeniusLastActiveBrand', null)
  );
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedBrands, loadedActiveBrand, loadedBrandStates] = await Promise.all([
          brandStorage.list(),
          brandStorage.getActive(),
          brandStateStorage.getAll(),
        ]);

        setBrands(loadedBrands);
        setActiveBrand(loadedActiveBrand);
        setBrandStates(loadedBrandStates);
        setLastActiveBrand(loadedActiveBrand ?? lastActiveBrand ?? null);
      } catch (error) {
        console.error('Error loading brand data:', error);
        setBrands(loadFromLocalStorage<string[]>('ppcGeniusBrands', []));
        const storedActive = loadFromLocalStorage<string | null>('ppcGeniusActiveBrand', null);
        setActiveBrand(storedActive);
        setBrandStates(loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {}));
        setLastActiveBrand(storedActive ?? lastActiveBrand ?? null);
      } finally {
        hasHydratedRef.current = true;
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const persist = async () => {
      try {
        saveToLocalStorage('ppcGeniusBrands', brands);
        saveToLocalStorage('ppcGeniusBrandStates', brandStates);
        await brandStorage.setActive(activeBrand);

        if (activeBrand) {
          setLastActiveBrand(activeBrand);
          saveToLocalStorage('ppcGeniusActiveBrand', activeBrand);
          saveToLocalStorage('ppcGeniusLastActiveBrand', activeBrand);
        }
      } catch (error) {
        console.error('Error saving brand data:', error);
      }
    };

    void persist();
  }, [brands, activeBrand, brandStates]);

  const activeBrandState = useMemo(() => {
    if (!activeBrand) {
      return null;
    }
    return brandStates[activeBrand] ?? null;
  }, [activeBrand, brandStates]);

  const createBrand = useCallback(
    async (brandName: string, options?: { budget?: number; asins?: string[] }) => {
      if (!brandName) {
        return false;
      }

      try {
        await brandStorage.create(brandName);
        setBrands(prev => [...prev, brandName]);
        setBrandStates(prev => ({
          ...prev,
          [brandName]: {
            ...createDefaultBrandState(),
            metadata: options,
          },
        }));
        setActiveBrand(brandName);
        return true;
      } catch (error) {
        console.error('Error creating brand:', error);
        return false;
      }
    },
    []
  );

  const selectBrand = useCallback((brandName: string | null) => {
    setActiveBrand(brandName);
  }, []);

  const deleteBrand = useCallback(async (brandName: string) => {
    try {
      await brandStorage.delete(brandName);
      setBrands(prev => {
        const updated = prev.filter(b => b !== brandName);
        setActiveBrand(current => (current === brandName ? updated[0] ?? null : current));
        return updated;
      });
      setBrandStates(prev => {
        const { [brandName]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }, []);

  const updateBrandState = useCallback((brandName: string, updates: Partial<BrandState>) => {
    setBrandStates(prev => {
      const current = prev[brandName] ?? createDefaultBrandState();
      const nextState: BrandState = {
        ...current,
        ...updates,
        advancedSearchSettings: {
          ...current.advancedSearchSettings,
          ...updates.advancedSearchSettings,
        },
      };

      const newStates = {
        ...prev,
        [brandName]: nextState,
      };

      void brandStateStorage.update(brandName, nextState).catch(error => {
        console.error('Error syncing brand state to storage:', error);
      });

      return newStates;
    });
  }, []);

  const reloadFromStorage = useCallback(async () => {
    try {
      const [loadedBrands, loadedActiveBrand, loadedBrandStates] = await Promise.all([
        brandStorage.list(),
        brandStorage.getActive(),
        brandStateStorage.getAll(),
      ]);

      setBrands(loadedBrands);
      setActiveBrand(loadedActiveBrand);
      setBrandStates(loadedBrandStates);
      setLastActiveBrand(loadedActiveBrand ?? loadedBrands[0] ?? null);
    } catch (error) {
      console.error('Error reloading brand data:', error);
    }
  }, []);

  return {
    brands,
    activeBrand,
    lastActiveBrand,
    brandStates,
    activeBrandState,
    hasHydrated: hasHydratedRef.current,
    createBrand,
    selectBrand,
    deleteBrand,
    updateBrandState,
    reloadFromStorage,
  };
};
