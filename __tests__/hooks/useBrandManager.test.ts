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

// Hoisted mock functions
const mockBrandStorageList = vi.fn();
const mockBrandStorageGetActive = vi.fn();
const mockBrandStorageSetActive = vi.fn();
const mockBrandStorageCreate = vi.fn();
const mockBrandStorageDelete = vi.fn();
const mockBrandStateStorageGetAll = vi.fn();
const mockBrandStateStorageUpdate = vi.fn();
const mockLoad = vi.fn();
const mockSave = vi.fn();

vi.mock('../../utils/hybridStorage', () => ({
  brandStorage: {
    list: mockBrandStorageList,
    getActive: mockBrandStorageGetActive,
    setActive: mockBrandStorageSetActive,
    create: mockBrandStorageCreate,
    delete: mockBrandStorageDelete,
  },
  brandStateStorage: {
    getAll: mockBrandStateStorageGetAll,
    update: mockBrandStateStorageUpdate,
  },
}));

vi.mock('../../utils/storage', () => ({
  loadFromLocalStorage: mockLoad,
  saveToLocalStorage: mockSave,
}));

describe('useBrandManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrandStorageList.mockResolvedValue(['Brand One', 'Brand Two']);
    mockBrandStorageGetActive.mockResolvedValue('Brand One');
    mockBrandStorageSetActive.mockResolvedValue();
    mockBrandStorageCreate.mockResolvedValue();
    mockBrandStorageDelete.mockResolvedValue();
    mockBrandStateStorageGetAll.mockResolvedValue({
      'Brand One': baseBrandState,
      'Brand Two': baseBrandState,
    });
    mockBrandStateStorageUpdate.mockResolvedValue();
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

    mockBrandStorageSetActive.mockClear();

    act(() => {
      result.current.selectBrand('Brand Two');
    });

    await waitFor(() => {
      expect(mockBrandStorageSetActive).toHaveBeenCalledWith('Brand Two');
    });
  });

  it('persists brand state updates', async () => {
    const { result } = renderHook(() => useBrandManager());
    await waitFor(() => expect(result.current.activeBrandState).not.toBeNull());

    await act(async () => {
      result.current.updateBrandState('Brand One', { keywordResults: [] });
    });

    await waitFor(() => {
      expect(mockBrandStateStorageUpdate).toHaveBeenCalledWith(
        'Brand One',
        expect.objectContaining({ keywordResults: [] })
      );
    });
  });
});
