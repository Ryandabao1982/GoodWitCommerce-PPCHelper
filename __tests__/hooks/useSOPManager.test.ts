import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSOPManager } from '../../src/hooks/useSOPManager';
import type { SOP } from '../../types';

const sampleSop: SOP = {
  id: 's1',
  title: 'Test SOP',
  content: 'Content',
  category: 'General',
  tags: ['tag'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockGetSOPsForBrand = vi.fn<[], Promise<SOP[]>>();
const mockAddSOP = vi.fn();
const mockUpdateSOP = vi.fn();
const mockDeleteSOP = vi.fn();
const mockToggleFavorite = vi.fn();
const mockIncrementView = vi.fn();
const mockTrackView = vi.fn();
const mockAiSearch = vi.fn();
const mockAiRecommend = vi.fn();

vi.mock('../../utils/sopStorage', () => ({
  getSOPsForBrand: mockGetSOPsForBrand,
  addSOP: mockAddSOP,
  updateSOP: mockUpdateSOP,
  deleteSOP: mockDeleteSOP,
  toggleSOPFavorite: mockToggleFavorite,
  incrementSOPViewCount: mockIncrementView,
  trackSOPView: mockTrackView,
}));

vi.mock('../../services/sopService', () => ({
  aiSearchSOPs: mockAiSearch,
  getAIRecommendedSOPs: mockAiRecommend,
}));

describe('useSOPManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSOPsForBrand.mockResolvedValue([]);
    mockAddSOP.mockResolvedValue(sampleSop);
    mockUpdateSOP.mockResolvedValue(sampleSop);
    mockDeleteSOP.mockResolvedValue(true);
    mockToggleFavorite.mockResolvedValue(true);
    mockIncrementView.mockResolvedValue();
    mockTrackView.mockResolvedValue();
    mockAiSearch.mockResolvedValue([sampleSop]);
    mockAiRecommend.mockResolvedValue([sampleSop]);
  });

  it('loads SOPs when active brand changes', async () => {
    mockGetSOPsForBrand
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleSop]);

    const { result, rerender } = renderHook(({ brand }) => useSOPManager(brand), {
      initialProps: { brand: null as string | null },
    });

    expect(result.current.sops).toEqual([]);

    rerender({ brand: 'Brand One' });

    await waitFor(() => {
      expect(mockGetSOPsForBrand).toHaveBeenCalledWith('Brand One');
      expect(result.current.sops).toEqual([sampleSop]);
    });
  });

  it('refreshes SOPs after mutations', async () => {
    mockGetSOPsForBrand
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleSop]);

    const { result, rerender } = renderHook(({ brand }) => useSOPManager(brand), {
      initialProps: { brand: null as string | null },
    });

    rerender({ brand: 'Brand One' });
    await waitFor(() => expect(result.current.sops).toEqual([sampleSop]));

    mockGetSOPsForBrand.mockResolvedValueOnce([sampleSop, { ...sampleSop, id: 's2' }]);

    await act(async () => {
      await result.current.addSOP('Brand One', {
        title: 'New',
        content: 'Content',
        category: 'General',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(mockAddSOP).toHaveBeenCalledWith('Brand One', expect.any(Object));
      expect(result.current.sops).toHaveLength(2);
    });
  });
});
