/**
 * Naming Generator Component
 *
 * Interactive UI for generating and validating campaign names according to the
 * standardized naming convention: [BRAND]_[COUNTRY]_[STAGE]_[TYPE]_[MATCH]_[THEME]_[YYYYMM]
 */

import React, { useState, useEffect } from 'react';
import type {
  CampaignNamingComponents,
  CampaignNamingValidation,
  LifecycleStageCode,
  CampaignType,
  CampaignMatchType,
  CampaignTheme,
} from '../types';
import {
  validateCampaignName,
  generateCampaignName,
  parseCampaignName,
  getCurrentDateCode,
  formatBrandName,
  NAMING_OPTIONS,
  generateExamples,
} from '../utils/namingConvention';

interface NamingGeneratorProps {
  brandName?: string;
  countryCode?: string;
  onNameGenerated?: (name: string, components: CampaignNamingComponents) => void;
  initialName?: string;
}

export default function NamingGenerator({
  brandName = '',
  countryCode = 'US',
  onNameGenerated,
  initialName = '',
}: NamingGeneratorProps) {
  // Form state
  const [components, setComponents] = useState<CampaignNamingComponents>({
    brand: formatBrandName(brandName),
    country: countryCode,
    stage: 'L',
    type: 'SP',
    match: 'AUTO',
    theme: 'RESEARCH',
    dateCode: getCurrentDateCode(),
  });

  // Validation state
  const [validation, setValidation] = useState<CampaignNamingValidation | null>(null);
  const [generatedName, setGeneratedName] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);

  // Initialize from initial name if provided
  useEffect(() => {
    if (initialName) {
      const parsed = parseCampaignName(initialName);
      if (parsed) {
        setComponents(parsed);
      }
    }
  }, [initialName]);

  // Update brand name when prop changes
  useEffect(() => {
    if (brandName) {
      setComponents((prev) => ({ ...prev, brand: formatBrandName(brandName) }));
    }
  }, [brandName]);

  // Update country code when prop changes
  useEffect(() => {
    if (countryCode) {
      setComponents((prev) => ({ ...prev, country: countryCode }));
    }
  }, [countryCode]);

  // Generate and validate name whenever components change
  useEffect(() => {
    const name = generateCampaignName(components);
    setGeneratedName(name);

    const result = validateCampaignName(name);
    setValidation(result);

    if (result.isValid && onNameGenerated) {
      onNameGenerated(name, components);
    }
  }, [components, onNameGenerated]);

  // Handle component changes
  const updateComponent = <K extends keyof CampaignNamingComponents>(
    key: K,
    value: CampaignNamingComponents[K]
  ) => {
    setComponents((prev) => ({ ...prev, [key]: value }));
  };

  // Get filtered options based on selections
  const getFilteredMatchTypes = () => {
    return NAMING_OPTIONS.matchTypes.filter((mt) => mt.types.includes(components.type));
  };

  const getFilteredThemes = () => {
    return NAMING_OPTIONS.themes.filter((th) => th.stages.includes(components.stage));
  };

  // Auto-adjust theme when stage changes
  useEffect(() => {
    const validThemes = getFilteredThemes();
    if (!validThemes.some((t) => t.value === components.theme)) {
      // Current theme is not valid for selected stage, pick first valid one
      if (validThemes.length > 0) {
        updateComponent('theme', validThemes[0].value);
      }
    }
  }, [components.stage]);

  // Auto-adjust match type when campaign type changes
  useEffect(() => {
    const validMatches = getFilteredMatchTypes();
    if (!validMatches.some((m) => m.value === components.match)) {
      // Current match type is not valid for selected type, pick first valid one
      if (validMatches.length > 0) {
        updateComponent('match', validMatches[0].value);
      }
    }
  }, [components.type]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Campaign Name Generator
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Build compliant campaign names using the standardized naming convention
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={components.brand}
            onChange={(e) => updateComponent('brand', formatBrandName(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="BRAND"
            maxLength={20}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Uppercase, alphanumeric only
          </p>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={components.country}
            onChange={(e) => updateComponent('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {NAMING_OPTIONS.countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label} ({country.value})
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lifecycle Stage <span className="text-red-500">*</span>
          </label>
          <select
            value={components.stage}
            onChange={(e) => updateComponent('stage', e.target.value as LifecycleStageCode)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {NAMING_OPTIONS.stages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label} ({stage.value})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {NAMING_OPTIONS.stages.find((s) => s.value === components.stage)?.description}
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Campaign Type <span className="text-red-500">*</span>
          </label>
          <select
            value={components.type}
            onChange={(e) => updateComponent('type', e.target.value as CampaignType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {NAMING_OPTIONS.types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} ({type.value})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {NAMING_OPTIONS.types.find((t) => t.value === components.type)?.description}
          </p>
        </div>

        {/* Match Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Match Type <span className="text-red-500">*</span>
          </label>
          <select
            value={components.match}
            onChange={(e) => updateComponent('match', e.target.value as CampaignMatchType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {getFilteredMatchTypes().map((match) => (
              <option key={match.value} value={match.value}>
                {match.label} ({match.value})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {getFilteredMatchTypes().find((m) => m.value === components.match)?.description}
          </p>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Campaign Theme <span className="text-red-500">*</span>
          </label>
          <select
            value={components.theme}
            onChange={(e) => updateComponent('theme', e.target.value as CampaignTheme)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {getFilteredThemes().map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label} ({theme.value})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {getFilteredThemes().find((t) => t.value === components.theme)?.description}
          </p>
        </div>

        {/* Date Code */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Code (YYYYMM) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={components.dateCode}
              onChange={(e) => updateComponent('dateCode', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="YYYYMM"
              maxLength={6}
              pattern="[0-9]{6}"
            />
            <button
              onClick={() => updateComponent('dateCode', getCurrentDateCode())}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Use Current
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: YYYYMM (e.g., 202510 for October 2025)
          </p>
        </div>
      </div>

      {/* Generated Name Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Generated Campaign Name
        </h4>

        <div
          className={`p-4 rounded-lg font-mono text-lg ${
            validation?.isValid
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={
                validation?.isValid
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }
            >
              {generatedName}
            </span>
            {validation?.isValid ? (
              <span className="text-2xl">✅</span>
            ) : (
              <span className="text-2xl">❌</span>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {validation && (
          <div className="mt-4 space-y-2">
            {validation.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  ❌ Errors
                </h5>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Warnings
                </h5>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.isValid && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-900 dark:text-green-100">
                  ✅ Campaign name is valid and follows all naming conventions!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {showExamples ? '▼' : '▶'} Example Campaign Names
        </button>

        {showExamples && (
          <div className="mt-3 space-y-2">
            {generateExamples().map((example, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm text-gray-700 dark:text-gray-300"
              >
                {example}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📖 Naming Convention Reference
        </h4>
        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <p>
            <strong>Format:</strong> [BRAND]_[COUNTRY]_[STAGE]_[TYPE]_[MATCH]_[THEME]_[YYYYMM]
          </p>
          <p>
            <strong>Stages:</strong> L (Launch), O (Optimize), S (Scale), M (Maintain)
          </p>
          <p>
            <strong>Types:</strong> SP (Sponsored Products), SB (Sponsored Brands), SD (Sponsored
            Display)
          </p>
          <p>
            <strong>Match Types:</strong> AUTO, BROAD, PHRASE, EXACT, PT (Product Targeting), VIDEO
          </p>
          <p>
            <strong>Stage-Theme Rules:</strong>
          </p>
          <ul className="ml-4 space-y-1">
            <li>• Launch (L) → RESEARCH, CATEGORY</li>
            <li>• Optimize (O) → PERFORMANCE, COMP, CATEGORY</li>
            <li>• Scale (S) → CROSSSELL, AWARENESS, CATEGORY</li>
            <li>• Maintain (M) → REMARKETING, BRANDED</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
