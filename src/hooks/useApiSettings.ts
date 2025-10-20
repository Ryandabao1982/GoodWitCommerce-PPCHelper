import { useCallback, useMemo, useState } from 'react';
import type { ApiSettings } from '../../types';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/storage';
import { reinitializeGeminiService } from '../../services/geminiService';
import { reinitializeSupabaseClient } from '../../services/supabaseClient';
import { reinitializeSOPService } from '../../services/sopService';

export interface UseApiSettingsResult {
  apiSettings: ApiSettings;
  hasApiKey: boolean;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  saveApiSettings: (override?: Partial<ApiSettings>) => void;
  resetApiSettings: () => void;
}

const readEnvSetting = (key: string): string => {
  const env = (import.meta as any)?.env ?? {};
  return env[key] ?? '';
};

const getInitialSettings = (): ApiSettings => ({
  geminiApiKey: loadFromLocalStorage<string>('ppcGeniusApiSettings.geminiApiKey', '') || readEnvSetting('VITE_GEMINI_API_KEY'),
  supabaseUrl: loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseUrl', '') || readEnvSetting('VITE_SUPABASE_URL'),
  supabaseAnonKey:
    loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseAnonKey', '') || readEnvSetting('VITE_SUPABASE_ANON_KEY'),
});

const getDefaultSettings = (): ApiSettings => ({
  geminiApiKey: readEnvSetting('VITE_GEMINI_API_KEY'),
  supabaseUrl: readEnvSetting('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnvSetting('VITE_SUPABASE_ANON_KEY'),
});

const persistSettings = (settings: ApiSettings) => {
  saveToLocalStorage('ppcGeniusApiSettings.geminiApiKey', settings.geminiApiKey);
  saveToLocalStorage('ppcGeniusApiSettings.supabaseUrl', settings.supabaseUrl);
  saveToLocalStorage('ppcGeniusApiSettings.supabaseAnonKey', settings.supabaseAnonKey);
  reinitializeGeminiService();
  reinitializeSOPService();
  reinitializeSupabaseClient();
};

export const useApiSettings = (): UseApiSettingsResult => {
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => getInitialSettings());

  const updateApiSettings = useCallback((settings: Partial<ApiSettings>) => {
    setApiSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const saveApiSettings = useCallback((override?: Partial<ApiSettings>) => {
    setApiSettings(prev => {
      const next = { ...prev, ...override };
      persistSettings(next);
      return next;
    });
  }, []);

  const resetApiSettings = useCallback(() => {
    const defaults = getDefaultSettings();
    setApiSettings(defaults);
    persistSettings(defaults);
  }, []);

  const hasApiKey = useMemo(() => Boolean(apiSettings.geminiApiKey), [apiSettings.geminiApiKey]);

  return {
    apiSettings,
    hasApiKey,
    updateApiSettings,
    saveApiSettings,
    resetApiSettings,
  };
};
