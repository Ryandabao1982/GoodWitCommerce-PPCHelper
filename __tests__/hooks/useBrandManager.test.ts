import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBrandManager } from '../../src/hooks/useBrandManager';
import type { BrandState } from '../../types';

const baseBrandState: BrandState = {
  keywordResults: [],
  searchedKeywords: [],
  advancedSearchSettings: {
    advancedKeywords: '',
    minVolume: '',
    maxVolume: '',
    isWebAnalysisEnabled: false,
    brandName: '',
    asin: '',
  },
  keywordClusters: null,
  campaigns: [],
};

const mockBrandStorage = {
  list: vi.fn<[], Promise<string[]>>(),
  getActive: vi.fn<[], Promise<string | null>>(),
  setActive: vi.fn<(brand: string | null) => Promise<void>>(),
  create: vi.fn<(brand: string) => Promise<void>>(),
  delete: vi.fn<(brand: string) => Promise<void>>(),
};

const mockBrandStateStorage = {
  getAll: vi.fn<[], Promise<Record<string, BrandState>>>(),
  update: vi.fn<(brand: string, state: BrandState) => Promise<void>>(),
};

const mockLoad = vi.fn((_: string, defaultValue: any) => defaultValue);
const mockSave = vi.fn();

vi.mock('../../utils/hybridStorage', () => ({
  brandStorage: mockBrandStorage,
  brandStateStorage: mockBrandStateStorage,
}));

vi.mock('../../utils/storage', () => ({
  loadFromLocalStorage: mockLoad,
  saveToLocalStorage: mockSave,
}));

describe('useBrandManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrandStorage.list.mockResolvedValue(['Brand One', 'Brand Two']);
    mockBrandStorage.getActive.mockResolvedValue('Brand One');
    mockBrandStorage.setActive.mockResolvedValue();
    mockBrandStorage.create.mockResolvedValue();
    mockBrandStorage.delete.mockResolvedValue();
    mockBrandStateStorage.getAll.mockResolvedValue({
      'Brand One': baseBrandState,
      'Brand Two': baseBrandState,
    });
    mockBrandStateStorage.update.mockResolvedValue();
  });

  it('loads brand data from storage on mount', async () => {
    const { result } = renderHook(() => useBrandManager());

    await waitFor(() => {
      expect(result.current.brands).toEqual(['Brand One', 'Brand Two']);
      expect(result.current.activeBrand).toBe('Brand One');
      expect(result.current.activeBrandState).toEqual(baseBrandState);
    });
  });

  it('syncs active brand changes to storage', async () => {
    const { result } = renderHook(() => useBrandManager());
    await waitFor(() => expect(result.current.activeBrand).toBe('Brand One'));

    mockBrandStorage.setActive.mockClear();

    act(() => {
      result.current.selectBrand('Brand Two');
    });

    await waitFor(() => {
      expect(mockBrandStorage.setActive).toHaveBeenCalledWith('Brand Two');
    });
  });

  it('persists brand state updates', async () => {
    const { result } = renderHook(() => useBrandManager());
    await waitFor(() => expect(result.current.activeBrandState).not.toBeNull());

    await act(async () => {
      result.current.updateBrandState('Brand One', { keywordResults: [] });
    });

    await waitFor(() => {
      expect(mockBrandStateStorage.update).toHaveBeenCalledWith(
        'Brand One',
        expect.objectContaining({ keywordResults: [] })
      );
    });
  });
});
