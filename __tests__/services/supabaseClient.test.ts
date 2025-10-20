import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set up environment variables before any imports
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test-project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-supabase-anon-key',
  },
}));

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    // Re-set import.meta.env for each test
    import.meta.env.VITE_SUPABASE_URL = 'https://test-project.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-supabase-anon-key';
  });

  it('reports configured when env variables are present', async () => {
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn() }), { virtual: true });

    const mod = await import('../../services/supabaseClient');
    // Since env variables are mocked with values, this should return true
    expect(mod.isSupabaseConfigured()).toBe(true);
  });

  it('uses saved settings from localStorage to initialize client', async () => {
    const clientAuth = { signInWithPassword: vi.fn(), getUser: vi.fn() };
    const createClient = vi.fn(() => ({ auth: clientAuth }));

    vi.doMock('@supabase/supabase-js', () => ({ createClient }), { virtual: true });

    // Save settings via localStorage (values expected by loadFromLocalStorage)
    localStorage.setItem(
      'ppcGeniusApiSettings.supabaseUrl',
      JSON.stringify('https://example.supabase.co')
    );
    localStorage.setItem('ppcGeniusApiSettings.supabaseAnonKey', JSON.stringify('anon-key'));

    const mod = await import('../../services/supabaseClient');
    expect(mod.isSupabaseConfigured()).toBe(true);

    // Reinitialize to pick up saved values
    mod.reinitializeSupabaseClient();

    // First property access triggers lazy init
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth = (mod.supabase as any).auth;
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({ auth: expect.any(Object) })
    );
    expect(auth).toBe(clientAuth);
  });

  it('uses env variables for configuration', async () => {
    const clientAuth = { signInWithPassword: vi.fn() };
    const createClient = vi.fn(() => ({ auth: clientAuth }));
    vi.doMock('@supabase/supabase-js', () => ({ createClient }), { virtual: true });

    const mod = await import('../../services/supabaseClient');
    expect(mod.isSupabaseConfigured()).toBe(true);

    // Trigger init via access
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-explicit-any
    (mod.supabase as any).auth;

    // Should have been called with some URL and key from env
    expect(createClient).toHaveBeenCalled();
    expect(createClient.mock.calls[0][0]).toMatch(/supabase\.co$/); // URL should end with supabase.co
    expect(createClient.mock.calls[0][1]).toBeTruthy(); // Key should be present
  });
});
