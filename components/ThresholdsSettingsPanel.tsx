/**
 * Thresholds Settings Panel Component
 * 
 * Allows users to configure lifecycle management thresholds and automation settings.
 */

import React, { useState, useEffect } from 'react';
import type { BrandSettings } from '../types';

interface ThresholdsSettingsPanelProps {
  settings: BrandSettings;
  onSave: (settings: Partial<BrandSettings>) => void;
  onCancel?: () => void;
}

export const ThresholdsSettingsPanel: React.FC<ThresholdsSettingsPanelProps> = ({
  settings,
  onSave,
  onCancel,
}) => {
  // Local state for form
  const [formData, setFormData] = useState<Partial<BrandSettings>>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof BrandSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Lifecycle Management Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure thresholds for automated keyword lifecycle management
        </p>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Lifecycle Thresholds Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Lifecycle Thresholds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clicks to Promote
              </label>
              <input
                type="number"
                min="1"
                value={formData.clicksToPromote}
                onChange={(e) => handleChange('clicksToPromote', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Number of clicks needed before promoting to next stage
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clicks to Negate
              </label>
              <input
                type="number"
                min="1"
                value={formData.clicksToNegate}
                onChange={(e) => handleChange('clicksToNegate', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Number of clicks before considering negation for poor performers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CTR Pause Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.ctrPauseThreshold}
                onChange={(e) => handleChange('ctrPauseThreshold', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Keywords below this CTR may be paused
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVR Factor Median
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.cvrFactorMedian}
                onChange={(e) => handleChange('cvrFactorMedian', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Multiplier for median CVR comparison
              </p>
            </div>
          </div>
        </div>

        {/* Financial Settings Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Financial Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wasted Spend Red Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.wastedSpendRedThreshold}
                onChange={(e) => handleChange('wastedSpendRedThreshold', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Threshold for triggering red RAG status
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target ACoS (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.targetAcos}
                onChange={(e) => handleChange('targetAcos', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target Advertising Cost of Sales
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.productPrice || ''}
                onChange={(e) => handleChange('productPrice', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for CPC max calculations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target ROAS
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.targetRoas}
                onChange={(e) => handleChange('targetRoas', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target Return on Ad Spend
              </p>
            </div>
          </div>
        </div>

        {/* Performance Targets Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Performance Targets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target CTR (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.targetCtr}
                onChange={(e) => handleChange('targetCtr', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target CVR (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.targetCvr}
                onChange={(e) => handleChange('targetCvr', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCompetitiveCategory || false}
                  onChange={(e) => handleChange('isCompetitiveCategory', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Competitive Category
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Automation Settings Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Automation Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoPromotion || false}
                onChange={(e) => handleChange('enableAutoPromotion', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Enable Auto-Promotion
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Automatically promote keywords when they meet performance thresholds
                </span>
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoNegation || false}
                onChange={(e) => handleChange('enableAutoNegation', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Enable Auto-Negation
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Automatically negate poor-performing keywords
                </span>
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoPause || false}
                onChange={(e) => handleChange('enableAutoPause', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Enable Auto-Pause
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Automatically pause keywords with very low CTR
                </span>
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableCannibalizationDetection !== false}
                onChange={(e) => handleChange('enableCannibalizationDetection', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Enable Cannibalization Detection
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Detect and alert on keyword cannibalization issues
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Save Settings
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            hasChanges
              ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              : 'border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          Reset
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
