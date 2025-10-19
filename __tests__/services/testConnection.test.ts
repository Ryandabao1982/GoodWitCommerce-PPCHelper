import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('testConnection utility', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns false early when Supabase is not configured', async () => {
    vi.doMock('../../services/supabaseClient', () => ({
      isSupabaseConfigured: () => false,
      supabase: {
        from: vi.fn(),
        auth: { getUser: vi.fn() },
      },
    }));

    const { testConnection } = await import('../../services/testConnection');
    const res = await testConnection();
    expect(res).toBe(false);
  });

  it('returns true on successful checks and exposes logs', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [{ count: 0 }], error: null }),
      }),
    });
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { email: 'user@example.com' } }, error: null });

    vi.doMock('../../services/supabaseClient', () => ({
      isSupabaseConfigured: () => true,
      supabase: {
        from: mockFrom,
        auth: { getUser: mockGetUser },
      },
      api: { brands: {}, keywords: {}, campaigns: {}, adGroups: {} },
    }));

    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { testConnection } = await import('../../services/testConnection');
    const res = await testConnection();

    expect(res).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('brands');
    expect(mockGetUser).toHaveBeenCalled();

    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it('returns false when database query errors', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
      }),
    });

    vi.doMock('../../services/supabaseClient', () => ({
      isSupabaseConfigured: () => true,
      supabase: {
        from: mockFrom,
        auth: { getUser: vi.fn() },
      },
      api: {},
    }));

    const { testConnection } = await import('../../services/testConnection');
    const res = await testConnection();
    expect(res).toBe(false);
  });
});