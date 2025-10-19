import React, { useState } from 'react';
import { BrandTabSettings as BrandTabSettingsType } from '../../types';

interface BrandTabSettingsProps {
  settings: BrandTabSettingsType;
  onSave: (settings: BrandTabSettingsType) => void;
  onClose: () => void;
}

export const BrandTabSettings: React.FC<BrandTabSettingsProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (field: keyof BrandTabSettingsType, value: number | boolean) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Tab Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Brand Thresholds */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Thresholds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clicks to Promote
                </label>
                <input
                  type="number"
                  value={localSettings.clicksToPromote}
                  onChange={(e) => handleChange('clicksToPromote', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum clicks required (with at least 1 sale) to promote keyword to Exact match
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clicks to Negate
                </label>
                <input
                  type="number"
                  value={localSettings.clicksToNegate}
                  onChange={(e) => handleChange('clicksToNegate', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum clicks required (with 0 sales) to negate keyword
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CTR Pause Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.ctrPauseThreshold}
                  onChange={(e) => handleChange('ctrPauseThreshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pause keywords with CTR below this threshold
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVR Factor (× Median)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localSettings.cvrFactorMedian}
                  onChange={(e) => handleChange('cvrFactorMedian', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  CVR must be at least this factor times the median (e.g., 0.8 = 80% of median)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wasted Spend Red Threshold ($)
                </label>
                <input
                  type="number"
                  value={localSettings.wastedSpendRedThreshold}
                  onChange={(e) => handleChange('wastedSpendRedThreshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mark spend above this amount as red flag if performance is poor
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="competitiveCategory"
                  checked={localSettings.isCompetitiveCategory}
                  onChange={(e) => handleChange('isCompetitiveCategory', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="competitiveCategory" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Competitive Category
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable for competitive categories that require 30-40 clicks for promotion decisions
              </p>
            </div>
          </div>

          {/* Portfolio Budget Targets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Budget Targets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Budget targets and phase timelines can be configured per portfolio in the main interface.
            </p>
          </div>

          {/* Guardrails Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              <span className="inline-block align-middle mr-1" aria-hidden="true" focusable="false">
                {/* Lightbulb SVG icon */}
                <svg width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" className="inline" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 0 0-3.5 10.92V15a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-2.08A6 6 0 0 0 10 2zm2.5 11.5V15h-5v-1.5a1 1 0 0 1 .5-.87A4 4 0 1 1 14 10a1 1 0 0 1 .5.87z" />
                </svg>
              </span>
              CPC Max Guardrail
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-300">
              CPC_max is automatically computed as: Price × Target ACOS × CVR
              <br />
              The system will warn you if any bid exceeds this calculated maximum.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
