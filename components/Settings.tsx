import React, { useState } from 'react';
import { ApiSettings } from '../types';

interface SettingsProps {
  apiSettings: ApiSettings;
  onApiSettingsChange: (settings: Partial<ApiSettings>) => void;
  onSaveSettings: () => void;
  onResetSettings: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  apiSettings,
  onApiSettingsChange,
  onSaveSettings,
  onResetSettings,
}) => {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveSettings();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all API settings to default values? This cannot be undone.')) {
      onResetSettings();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">API Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your API keys for Gemini AI and Supabase. Changes will be saved locally in your browser.
        </p>

        {/* Gemini API Key Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            Google Gemini API Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  id="geminiApiKey"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={apiSettings.geminiApiKey}
                  onChange={(e) => onApiSettingsChange({ geminiApiKey: e.target.value })}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showGeminiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showGeminiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Configuration Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🗄️</span>
            Supabase Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="supabaseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supabase URL
              </label>
              <input
                id="supabaseUrl"
                type="text"
                value={apiSettings.supabaseUrl}
                onChange={(e) => onApiSettingsChange({ supabaseUrl: e.target.value })}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="supabaseAnonKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supabase Anon Key
              </label>
              <div className="relative">
                <input
                  id="supabaseAnonKey"
                  type={showSupabaseKey ? 'text' : 'password'}
                  value={apiSettings.supabaseAnonKey}
                  onChange={(e) => onApiSettingsChange({ supabaseAnonKey: e.target.value })}
                  placeholder="Enter your Supabase anon key"
                  className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showSupabaseKey ? 'Hide API key' : 'Show API key'}
                >
                  {showSupabaseKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Get your credentials from your{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Supabase Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSaved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            🔄 Reset to Default
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>ℹ️ Note:</strong> API keys are stored locally in your browser and never sent to any server except the respective API providers.
            If you leave fields empty, the application will use default environment variables if available.
          </p>
        </div>
      </div>
    </div>
  );
};
