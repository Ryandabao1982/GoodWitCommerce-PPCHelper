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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Settings Overview */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">⚙️ Application Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your API integrations and application preferences
        </p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-lg p-4 border-2 ${apiSettings.geminiApiKey ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini AI Status</div>
              <div className={`text-lg font-bold mt-1 ${apiSettings.geminiApiKey ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {apiSettings.geminiApiKey ? '✓ Configured' : '⚠ Not Set'}
              </div>
            </div>
            <div className="text-3xl">{apiSettings.geminiApiKey ? '🤖' : '⚙️'}</div>
          </div>
        </div>
        
        <div className={`rounded-lg p-4 border-2 ${apiSettings.supabaseUrl && apiSettings.supabaseAnonKey ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Supabase Status</div>
              <div className={`text-lg font-bold mt-1 ${apiSettings.supabaseUrl && apiSettings.supabaseAnonKey ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {apiSettings.supabaseUrl && apiSettings.supabaseAnonKey ? '✓ Configured' : '⚠ Not Set'}
              </div>
            </div>
            <div className="text-3xl">{apiSettings.supabaseUrl && apiSettings.supabaseAnonKey ? '🗄️' : '⚙️'}</div>
          </div>
        </div>
      </div>

      {/* API Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">🔧 API Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your API keys for AI-powered features and data persistence
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
            <strong>ℹ️ Privacy & Security:</strong> API keys are stored locally in your browser and never sent to any server except the respective API providers.
            If you leave fields empty, the application will use default environment variables if available.
          </p>
        </div>
      </div>

      {/* Settings Tips Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">💡 Settings Tips</h3>
        <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
          <li>• <strong>Gemini API:</strong> Required for AI-powered keyword research and clustering</li>
          <li>• <strong>Supabase:</strong> Optional - enables cloud storage for your keywords and campaigns</li>
          <li>• Click "Reset to Default" to restore environment variable values</li>
          <li>• All settings are stored locally and sync across tabs in the same browser</li>
        </ul>
      </div>
    </div>
  );
};
