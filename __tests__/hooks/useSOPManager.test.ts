import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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

// Mock the modules
vi.mock('../../utils/sopStorage');
vi.mock('../../services/sopService');

// Import after mocking
import { useSOPManager } from '../../src/hooks/useSOPManager';
import * as sopStorage from '../../utils/sopStorage';
import * as sopService from '../../services/sopService';

describe('useSOPManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sopStorage.getSOPsForBrand).mockResolvedValue([]);
    vi.mocked(sopStorage.addSOP).mockResolvedValue(sampleSop);
    vi.mocked(sopStorage.updateSOP).mockResolvedValue(sampleSop);
    vi.mocked(sopStorage.deleteSOP).mockResolvedValue(true);
    vi.mocked(sopStorage.toggleSOPFavorite).mockResolvedValue(true);
    vi.mocked(sopStorage.incrementSOPViewCount).mockResolvedValue(undefined);
    vi.mocked(sopStorage.trackSOPView).mockResolvedValue(undefined);
    vi.mocked(sopService.aiSearchSOPs).mockResolvedValue([sampleSop]);
    vi.mocked(sopService.getAIRecommendedSOPs).mockResolvedValue([sampleSop]);
  });

  it('loads SOPs when active brand changes', async () => {
    vi.mocked(sopStorage.getSOPsForBrand)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleSop]);

    const { result, rerender } = renderHook(({ brand }) => useSOPManager(brand), {
      initialProps: { brand: null as string | null },
    });

    expect(result.current.sops).toEqual([]);

    rerender({ brand: 'Brand One' });

    await waitFor(() => {
      expect(sopStorage.getSOPsForBrand).toHaveBeenCalledWith('Brand One');
      expect(result.current.sops).toEqual([sampleSop]);
    });
  });

  it('refreshes SOPs after mutations', async () => {
    vi.mocked(sopStorage.getSOPsForBrand)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleSop])
      .mockResolvedValueOnce([sampleSop, { ...sampleSop, id: 's2' }]);

    const { result, rerender } = renderHook(({ brand }) => useSOPManager(brand), {
      initialProps: { brand: null as string | null },
    });

    rerender({ brand: 'Brand One' });
    await waitFor(() => expect(result.current.sops).toEqual([sampleSop]));

    await act(async () => {
      await result.current.addSOP('Brand One', {
        title: 'New',
        content: 'Content',
        category: 'General',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(sopStorage.addSOP).toHaveBeenCalledWith('Brand One', expect.any(Object));
      expect(result.current.sops).toHaveLength(2);
    });
  });
});
