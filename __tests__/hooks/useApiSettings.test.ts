import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiSettings } from '../../src/hooks/useApiSettings';

const mockLoad = vi.fn((_: string, defaultValue: any) => defaultValue);
const mockSave = vi.fn();
const mockReinitGemini = vi.fn();
const mockReinitSop = vi.fn();
const mockReinitSupabase = vi.fn();

vi.mock('../../utils/storage', () => ({
  loadFromLocalStorage: mockLoad,
  saveToLocalStorage: mockSave,
}));

vi.mock('../../services/geminiService', () => ({
  reinitializeGeminiService: mockReinitGemini,
}));

vi.mock('../../services/sopService', () => ({
  reinitializeSOPService: mockReinitSop,
}));

vi.mock('../../services/supabaseClient', () => ({
  reinitializeSupabaseClient: mockReinitSupabase,
}));

describe('useApiSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockImplementation((_: string, defaultValue: any) => defaultValue);
    const env = import.meta.env as any;
    env.VITE_GEMINI_API_KEY = 'env-gemini';
    env.VITE_SUPABASE_URL = 'env-url';
    env.VITE_SUPABASE_ANON_KEY = 'env-anon';
  });

  it('initializes from stored values when available', () => {
    mockLoad.mockImplementation((key: string, defaultValue: any) => {
      if (key === 'ppcGeniusApiSettings.geminiApiKey') return 'stored-gemini';
      if (key === 'ppcGeniusApiSettings.supabaseUrl') return 'stored-url';
      if (key === 'ppcGeniusApiSettings.supabaseAnonKey') return 'stored-anon';
      return defaultValue;
    });

    const { result } = renderHook(() => useApiSettings());

    expect(result.current.apiSettings).toEqual({
      geminiApiKey: 'stored-gemini',
      supabaseUrl: 'stored-url',
      supabaseAnonKey: 'stored-anon',
    });
  });

  it('persists updated settings and reinitializes services', async () => {
    const { result } = renderHook(() => useApiSettings());

    act(() => {
      result.current.updateApiSettings({ geminiApiKey: 'new-key' });
    });

    await act(async () => {
      result.current.saveApiSettings();
    });

    expect(mockSave).toHaveBeenCalledWith('ppcGeniusApiSettings.geminiApiKey', 'new-key');
    expect(mockReinitGemini).toHaveBeenCalled();
    expect(mockReinitSop).toHaveBeenCalled();
    expect(mockReinitSupabase).toHaveBeenCalled();
  });

  it('resets to environment defaults when requested', async () => {
    mockLoad.mockImplementation(() => '');
    const env = import.meta.env as any;
    env.VITE_GEMINI_API_KEY = 'reset-gemini';
    env.VITE_SUPABASE_URL = 'reset-url';
    env.VITE_SUPABASE_ANON_KEY = 'reset-anon';

    const { result } = renderHook(() => useApiSettings());

    await act(async () => {
      result.current.resetApiSettings();
    });

    await waitFor(() => {
      expect(result.current.apiSettings).toEqual({
        geminiApiKey: 'reset-gemini',
        supabaseUrl: 'reset-url',
        supabaseAnonKey: 'reset-anon',
      });
    });
  });
});
