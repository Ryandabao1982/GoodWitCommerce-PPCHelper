import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandAPI, KeywordAPI, CampaignAPI, AdGroupAPI, SearchHistoryAPI, KeywordClusterAPI } from '../../services/databaseService';

// Mock the supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

import { supabase } from '../../services/supabaseClient';

describe('DatabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BrandAPI', () => {
    describe('list', () => {
      it('should fetch all active brands', async () => {
        const mockBrands = [
          { id: '1', name: 'Brand A', is_active: true },
          { id: '2', name: 'Brand B', is_active: true },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockBrands, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await BrandAPI.list();

        expect(supabase.from).toHaveBeenCalledWith('brands');
        expect(result).toEqual(mockBrands);
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Database error');
        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        await expect(BrandAPI.list()).rejects.toThrow('Database error');
      });
    });

    describe('get', () => {
      it('should fetch a specific brand by ID', async () => {
        const mockBrand = { id: '1', name: 'Brand A' };
        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockBrand, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await BrandAPI.get('1');

        expect(result).toEqual(mockBrand);
      });
    });

    describe('create', () => {
      it('should create a new brand', async () => {
        const mockUser = { id: 'user-1' };
        const mockBrand = { id: '1', name: 'New Brand', user_id: 'user-1' };

        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: mockUser },
          error: null,
        } as any);

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockBrand, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await BrandAPI.create('New Brand', 'Description');

        expect(supabase.auth.getUser).toHaveBeenCalled();
        expect(result).toEqual(mockBrand);
      });

      it('should throw error when user is not authenticated', async () => {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: { user: null },
          error: null,
        } as any);

        await expect(BrandAPI.create('New Brand')).rejects.toThrow('User not authenticated');
      });
    });

    describe('update', () => {
      it('should update an existing brand', async () => {
        const mockBrand = { id: '1', name: 'Updated Brand' };
        const mockUpdate = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockBrand, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

        const result = await BrandAPI.update('1', { name: 'Updated Brand' });

        expect(result).toEqual(mockBrand);
      });
    });

    describe('delete', () => {
      it('should soft delete a brand', async () => {
        const mockUpdate = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

        await BrandAPI.delete('1');

        expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
      });
    });

    describe('hardDelete', () => {
      it('should permanently delete a brand', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await BrandAPI.hardDelete('1');

        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('KeywordAPI', () => {
    describe('list', () => {
      it('should fetch all keywords for a brand', async () => {
        const mockKeywords = [
          { id: '1', keyword: 'test keyword', brand_id: 'brand-1' },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockKeywords, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await KeywordAPI.list('brand-1');

        expect(result).toEqual(mockKeywords);
      });
    });

    describe('create', () => {
      it('should create a single keyword', async () => {
        const mockKeyword = {
          keyword: 'test keyword',
          type: 'Broad' as const,
          category: 'Core' as const,
          searchVolume: '1000',
          competition: 'Low' as const,
          relevance: 8,
          source: 'AI' as const,
        };

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: '1', ...mockKeyword }, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await KeywordAPI.create('brand-1', mockKeyword);

        expect(result).toHaveProperty('id');
      });
    });

    describe('createBulk', () => {
      it('should create multiple keywords', async () => {
        const mockKeywords = [
          {
            keyword: 'keyword 1',
            type: 'Broad' as const,
            category: 'Core' as const,
            searchVolume: '1000',
            competition: 'Low' as const,
            relevance: 8,
            source: 'AI' as const,
          },
          {
            keyword: 'keyword 2',
            type: 'Phrase' as const,
            category: 'Opportunity' as const,
            searchVolume: '2000',
            competition: 'Medium' as const,
            relevance: 7,
            source: 'Web' as const,
          },
        ];

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockKeywords, error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await KeywordAPI.createBulk('brand-1', mockKeywords);

        expect(result).toHaveLength(2);
      });
    });

    describe('update', () => {
      it('should update a keyword', async () => {
        const mockUpdate = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: '1', keyword: 'updated' }, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

        const result = await KeywordAPI.update('1', { keyword: 'updated' });

        expect(result).toHaveProperty('keyword', 'updated');
      });
    });

    describe('delete', () => {
      it('should delete a keyword', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await KeywordAPI.delete('1');

        expect(mockDelete).toHaveBeenCalled();
      });
    });

    describe('deleteBulk', () => {
      it('should delete multiple keywords', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await KeywordAPI.deleteBulk(['1', '2', '3']);

        expect(mockDelete).toHaveBeenCalled();
      });
    });

    describe('search', () => {
      it('should search keywords by text', async () => {
        const mockKeywords = [{ id: '1', keyword: 'wireless headphones' }];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            ilike: vi.fn().mockResolvedValue({ data: mockKeywords, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await KeywordAPI.search('brand-1', 'wireless');

        expect(result).toEqual(mockKeywords);
      });
    });
  });

  describe('CampaignAPI', () => {
    describe('list', () => {
      it('should fetch all campaigns for a brand with nested data', async () => {
        const mockCampaigns = [
          {
            id: '1',
            name: 'Campaign 1',
            brand_id: 'brand-1',
            ad_groups: [],
          },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await CampaignAPI.list('brand-1');

        expect(result).toEqual(mockCampaigns);
      });
    });

    describe('create', () => {
      it('should create a new campaign', async () => {
        const mockCampaign = {
          name: 'New Campaign',
          totalBudget: 1000,
        };

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: '1', ...mockCampaign }, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await CampaignAPI.create('brand-1', mockCampaign as any);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name', 'New Campaign');
      });
    });

    describe('update', () => {
      it('should update a campaign', async () => {
        const mockUpdate = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Updated' }, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

        const result = await CampaignAPI.update('1', { name: 'Updated' });

        expect(result).toHaveProperty('name', 'Updated');
      });
    });

    describe('delete', () => {
      it('should soft delete a campaign', async () => {
        const mockUpdate = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

        await CampaignAPI.delete('1');

        expect(mockUpdate).toHaveBeenCalledWith({ status: 'archived' });
      });
    });
  });

  describe('AdGroupAPI', () => {
    describe('list', () => {
      it('should fetch all ad groups for a campaign', async () => {
        const mockAdGroups = [
          { id: '1', name: 'Ad Group 1', campaign_id: 'campaign-1' },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockAdGroups, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await AdGroupAPI.list('campaign-1');

        expect(result).toEqual(mockAdGroups);
      });
    });

    describe('create', () => {
      it('should create a new ad group', async () => {
        const mockAdGroup = { name: 'New Ad Group' };

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: '1', ...mockAdGroup }, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await AdGroupAPI.create('campaign-1', mockAdGroup as any);

        expect(result).toHaveProperty('name', 'New Ad Group');
      });
    });

    describe('assignKeywords', () => {
      it('should assign keywords to an ad group', async () => {
        const mockAssignments = [
          { ad_group_id: 'ag-1', keyword_id: 'kw-1' },
          { ad_group_id: 'ag-1', keyword_id: 'kw-2' },
        ];

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await AdGroupAPI.assignKeywords('ag-1', ['kw-1', 'kw-2']);

        expect(result).toHaveLength(2);
      });
    });

    describe('removeKeywords', () => {
      it('should remove keywords from an ad group', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await AdGroupAPI.removeKeywords('ag-1', ['kw-1', 'kw-2']);

        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('SearchHistoryAPI', () => {
    describe('list', () => {
      it('should fetch search history for a brand', async () => {
        const mockHistory = [
          { id: '1', search_terms: ['test'], brand_id: 'brand-1' },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockHistory, error: null }),
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await SearchHistoryAPI.list('brand-1', 50);

        expect(result).toEqual(mockHistory);
      });
    });

    describe('create', () => {
      it('should log a search', async () => {
        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '1', search_terms: ['test'] },
              error: null,
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await SearchHistoryAPI.create('brand-1', ['test'], 'simple', {}, 10);

        expect(result).toHaveProperty('id');
      });
    });

    describe('clear', () => {
      it('should clear all search history for a brand', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await SearchHistoryAPI.clear('brand-1');

        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('KeywordClusterAPI', () => {
    describe('list', () => {
      it('should fetch all keyword clusters for a brand', async () => {
        const mockClusters = [
          { id: '1', cluster_name: 'Cluster 1', brand_id: 'brand-1' },
        ];

        const mockSelect = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockClusters, error: null }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

        const result = await KeywordClusterAPI.list('brand-1');

        expect(result).toEqual(mockClusters);
      });
    });

    describe('create', () => {
      it('should save a keyword cluster', async () => {
        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '1', cluster_name: 'New Cluster' },
              error: null,
            }),
          }),
        });

        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        const result = await KeywordClusterAPI.create('brand-1', 'New Cluster', ['kw-1', 'kw-2'], 'intent');

        expect(result).toHaveProperty('cluster_name', 'New Cluster');
      });
    });

    describe('delete', () => {
      it('should delete a keyword cluster', async () => {
        const mockDelete = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });

        vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any);

        await KeywordClusterAPI.delete('1');

        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });
});