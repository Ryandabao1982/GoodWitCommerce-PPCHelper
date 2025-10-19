import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('reports not configured when no env or saved settings', async () => {
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn() }), { virtual: true });

    const mod = await import('../../services/supabaseClient');
    expect(mod.isSupabaseConfigured()).toBe(false);

    // Accessing supabase properties should not throw and returns undefined
    expect((mod.supabase as any).auth).toBeUndefined();
  });

  it('uses saved settings from localStorage to initialize client', async () => {
    const clientAuth = { signInWithPassword: vi.fn(), getUser: vi.fn() };
    const createClient = vi.fn(() => ({ auth: clientAuth }));

    vi.doMock('@supabase/supabase-js', () => ({ createClient }), { virtual: true });

    // Save settings via localStorage (values expected by loadFromLocalStorage)
    localStorage.setItem('ppcGeniusApiSettings.supabaseUrl', JSON.stringify('https://example.supabase.co'));
    localStorage.setItem('ppcGeniusApiSettings.supabaseAnonKey', JSON.stringify('anon-key'));

    const mod = await import('../../services/supabaseClient');
    expect(mod.isSupabaseConfigured()).toBe(true);

    // Reinitialize to pick up saved values
    mod.reinitializeSupabaseClient();

    // First property access triggers lazy init
    const auth = (mod.supabase as any).auth;
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({ auth: expect.any(Object) })
    );
    expect(auth).toBe(clientAuth);
  });

  it('falls back to env variables when present', async () => {
    const clientAuth = { signInWithPassword: vi.fn() };
    const createClient = vi.fn(() => ({ auth: clientAuth }));
    vi.doMock('@supabase/supabase-js', () => ({ createClient }), { virtual: true });

    // Set env via global import.meta stub provided in setup
    // Note: setup.ts stubs import.meta.env; we override here
    // Ensure global.import.meta.env exists and assign values with type assertion
    if (!global.import) {
      (global as any).import = {};
    }
    if (!global.import.meta) {
      (global.import as any).meta = {};
    }
    if (!global.import.meta.env) {
      (global.import.meta as any).env = {};
    }
    (global.import.meta.env as Record<string, string>)['VITE_SUPABASE_URL'] = 'https://env.supabase.co';
    (global.import.meta.env as Record<string, string>)['VITE_SUPABASE_ANON_KEY'] = 'env-anon';

    const mod = await import('../../services/supabaseClient');
    expect(mod.isSupabaseConfigured()).toBe(true);

    // Trigger init via access
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (mod.supabase as any).auth;

    expect(createClient).toHaveBeenCalledWith(
      'https://env.supabase.co',
      'env-anon',
      expect.any(Object)
    );
  });
});