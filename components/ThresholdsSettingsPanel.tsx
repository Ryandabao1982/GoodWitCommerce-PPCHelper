/**
 * Thresholds Settings Panel Component
 * Allows users to configure brand-specific threshold settings for the rules engine
 */

import React, { useState, useEffect } from 'react';
import type { SettingsThresholds } from '../types';

interface ThresholdsSettingsPanelProps {
  brandId: string;
  brandName: string;
  initialThresholds?: Partial<SettingsThresholds>;
  onSave: (thresholds: SettingsThresholds) => void;
}

const DEFAULT_THRESHOLDS: Omit<SettingsThresholds, 'brandId'> = {
  clicksPromoteStandard: 20,
  clicksNegateStandard: 15,
  clicksPromoteCompetitive: 30,
  clicksNegateCompetitive: 30,
  cvrGraduationFactor: 0.8,
  ctrPauseThreshold: 0.002,
  wastedSpendRed: 500,
};

export const ThresholdsSettingsPanel: React.FC<ThresholdsSettingsPanelProps> = ({
  brandId,
  brandName,
  initialThresholds,
  onSave,
}) => {
  const [thresholds, setThresholds] = useState<Omit<SettingsThresholds, 'brandId'>>({
    ...DEFAULT_THRESHOLDS,
    ...initialThresholds,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setThresholds({
      ...DEFAULT_THRESHOLDS,
      ...initialThresholds,
    });
    setHasChanges(false);
  }, [initialThresholds]);

  const handleChange = (field: keyof Omit<SettingsThresholds, 'brandId'>, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({
      brandId,
      ...thresholds,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Lifecycle Rules Thresholds
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure decision thresholds for <strong>{brandName}</strong>
        </p>
      </div>

      <div className="space-y-6">
        {/* Promotion Thresholds */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Promotion Criteria
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Minimum clicks required before promoting a keyword to Performance or SKAG
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Categories
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholds.clicksPromoteStandard}
                  onChange={(e) => handleChange('clicksPromoteStandard', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">clicks</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For Generic, ProductCore categories
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Competitive Categories
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholds.clicksPromoteCompetitive}
                  onChange={(e) => handleChange('clicksPromoteCompetitive', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">clicks</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For Competitor category keywords
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CVR Graduation Factor
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={thresholds.cvrGraduationFactor}
                onChange={(e) => handleChange('cvrGraduationFactor', parseFloat(e.target.value))}
                min="0.1"
                max="2.0"
                step="0.1"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">× median CVR</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Promote if CVR ≥ {thresholds.cvrGraduationFactor}× median (e.g., 0.8 = 80% of median)
            </p>
          </div>
        </div>

        {/* Negation Thresholds */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ❌ Negation Criteria
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Minimum clicks with zero sales before negating a keyword
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Categories
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholds.clicksNegateStandard}
                  onChange={(e) => handleChange('clicksNegateStandard', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">clicks, 0 sales</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Competitive Categories
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholds.clicksNegateCompetitive}
                  onChange={(e) => handleChange('clicksNegateCompetitive', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">clicks, 0 sales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Alerts */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚨 Alert Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CTR Pause Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholds.ctrPauseThreshold * 100}
                  onChange={(e) => handleChange('ctrPauseThreshold', parseFloat(e.target.value) / 100)}
                  min="0.01"
                  max="5.0"
                  step="0.01"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pause keyword if CTR &lt; {(thresholds.ctrPauseThreshold * 100).toFixed(2)}% after 200 impressions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wasted Spend Alert (RED)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={thresholds.wastedSpendRed}
                  onChange={(e) => handleChange('wastedSpendRed', parseFloat(e.target.value))}
                  min="0"
                  max="10000"
                  step="50"
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Trigger RED alert if spend &gt; ${thresholds.wastedSpendRed} with no sales
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            📋 Current Rules Summary
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ Promote after {thresholds.clicksPromoteStandard} clicks (standard) or {thresholds.clicksPromoteCompetitive} clicks (competitive)</li>
            <li>✓ Negate after {thresholds.clicksNegateStandard} clicks (standard) or {thresholds.clicksNegateCompetitive} clicks (competitive) with 0 sales</li>
            <li>✓ Promote if CVR ≥ {(thresholds.cvrGraduationFactor * 100).toFixed(0)}% of median CVR</li>
            <li>✓ Pause if CTR &lt; {(thresholds.ctrPauseThreshold * 100).toFixed(2)}%</li>
            <li>✓ RED alert if wasted spend &gt; ${thresholds.wastedSpendRed}</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
        >
          💾 Save Changes
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          🔄 Reset to Defaults
        </button>
      </div>

      {hasChanges && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
          ⚠️ You have unsaved changes
        </p>
      )}
    </div>
  );
};
