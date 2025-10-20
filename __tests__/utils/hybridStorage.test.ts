/**
 * Tests for Hybrid Storage Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brandStorage, settingsStorage, getConnectionStatus } from '../../utils/hybridStorage';
import * as supabaseClient from '../../services/supabaseClient';
import * as databaseService from '../../services/databaseService';
import * as storage from '../../utils/storage';

// Mock modules
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('../../services/databaseService', () => ({
  api: {
    brands: {
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    keywords: {
      list: vi.fn(),
      createBulk: vi.fn(),
    },
    campaigns: {
      list: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../../utils/storage', () => ({
  loadFromLocalStorage: vi.fn(),
  saveToLocalStorage: vi.fn(),
}));

describe('hybridStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConnectionStatus', () => {
    it('should return offline status when Supabase is not configured', async () => {
      vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(false);

      const status = await getConnectionStatus();

      expect(status).toEqual({
        isConnected: false,
        isAuthenticated: false,
        usingDatabase: false,
        usingLocalStorage: true,
      });
    });

    it('should return online status when authenticated', async () => {
      vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
      vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } as any },
        error: null,
      } as any);

      const status = await getConnectionStatus();

      expect(status).toEqual({
        isConnected: true,
        isAuthenticated: true,
        usingDatabase: true,
        usingLocalStorage: true,
      });
    });

    it('should handle authentication errors', async () => {
      vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
      vi.mocked(supabaseClient.supabase.auth.getUser).mockRejectedValue(new Error('Auth error'));

      const status = await getConnectionStatus();

      expect(status).toEqual({
        isConnected: false,
        isAuthenticated: false,
        usingDatabase: false,
        usingLocalStorage: true,
      });
    });
  });

  describe('brandStorage', () => {
    describe('list', () => {
      it('should return brands from database when authenticated', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123' } as any },
          error: null,
        } as any);
        vi.mocked(databaseService.api.brands.list).mockResolvedValue([
          { id: '1', name: 'Brand A', user_id: 'user-123' } as any,
          { id: '2', name: 'Brand B', user_id: 'user-123' } as any,
        ]);

        const brands = await brandStorage.list();

        expect(brands).toEqual(['Brand A', 'Brand B']);
        expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusBrands', [
          'Brand A',
          'Brand B',
        ]);
      });

      it('should fall back to localStorage when database fails', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123' } as any },
          error: null,
        } as any);
        vi.mocked(databaseService.api.brands.list).mockRejectedValue(new Error('DB error'));
        vi.mocked(storage.loadFromLocalStorage).mockReturnValue(['Local Brand']);

        const brands = await brandStorage.list();

        expect(brands).toEqual(['Local Brand']);
      });

      it('should use localStorage when not authenticated', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(false);
        vi.mocked(storage.loadFromLocalStorage).mockReturnValue(['Local Brand']);

        const brands = await brandStorage.list();

        expect(brands).toEqual(['Local Brand']);
        expect(databaseService.api.brands.list).not.toHaveBeenCalled();
      });
    });

    describe('create', () => {
      it('should create brand in database and localStorage', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123' } as any },
          error: null,
        } as any);
        vi.mocked(storage.loadFromLocalStorage).mockReturnValue(['Existing Brand']);
        vi.mocked(databaseService.api.brands.create).mockResolvedValue({
          id: 'new-id',
          name: 'New Brand',
        } as any);

        await brandStorage.create('New Brand');

        expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusBrands', [
          'Existing Brand',
          'New Brand',
        ]);
        expect(databaseService.api.brands.create).toHaveBeenCalledWith('New Brand');
      });

      it('should save to localStorage even if database fails', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123' } as any },
          error: null,
        } as any);
        vi.mocked(storage.loadFromLocalStorage).mockReturnValue([]);
        vi.mocked(databaseService.api.brands.create).mockRejectedValue(new Error('DB error'));

        await brandStorage.create('New Brand');

        expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusBrands', ['New Brand']);
      });
    });

    describe('delete', () => {
      it('should delete brand from database and localStorage', async () => {
        vi.mocked(supabaseClient.isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(supabaseClient.supabase.auth.getUser).mockResolvedValue({
          data: { user: { id: 'user-123' } as any },
          error: null,
        } as any);
        vi.mocked(storage.loadFromLocalStorage)
          .mockReturnValueOnce(['Brand A', 'Brand B'])
          .mockReturnValueOnce({ 'Brand A': {}, 'Brand B': {} } as any);
        vi.mocked(databaseService.api.brands.list).mockResolvedValue([
          { id: '1', name: 'Brand A' } as any,
        ]);

        await brandStorage.delete('Brand A');

        expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusBrands', ['Brand B']);
        expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusBrandStates', {
          'Brand B': {},
        });
        expect(databaseService.api.brands.delete).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('settingsStorage', () => {
    it('should get dark mode setting', () => {
      vi.mocked(storage.loadFromLocalStorage).mockReturnValue(true);

      const isDarkMode = settingsStorage.getDarkMode();

      expect(isDarkMode).toBe(true);
      expect(storage.loadFromLocalStorage).toHaveBeenCalledWith('ppcGeniusDarkMode', false);
    });

    it('should set dark mode setting', () => {
      settingsStorage.setDarkMode(true);

      expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusDarkMode', true);
    });

    it('should get quick start seen status', () => {
      vi.mocked(storage.loadFromLocalStorage).mockReturnValue(true);

      const hasSeenQuickStart = settingsStorage.getQuickStartSeen();

      expect(hasSeenQuickStart).toBe(true);
      expect(storage.loadFromLocalStorage).toHaveBeenCalledWith(
        'ppcGeniusHasSeenQuickStart',
        false
      );
    });

    it('should set quick start seen status', () => {
      settingsStorage.setQuickStartSeen(true);

      expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusHasSeenQuickStart', true);
    });

    it('should get last view from storage', () => {
      vi.mocked(storage.loadFromLocalStorage).mockReturnValue('planner');

      const lastView = settingsStorage.getLastView();

      expect(lastView).toBe('planner');
      expect(storage.loadFromLocalStorage).toHaveBeenCalledWith('ppcGeniusLastView', 'research');
    });

    it('should fall back to default view when stored value is invalid', () => {
      vi.mocked(storage.loadFromLocalStorage).mockReturnValue('invalid-view');

      const lastView = settingsStorage.getLastView();

      expect(lastView).toBe('research');
    });

    it('should set last view', () => {
      settingsStorage.setLastView('sop');

      expect(storage.saveToLocalStorage).toHaveBeenCalledWith('ppcGeniusLastView', 'sop');
    });
  });
});
