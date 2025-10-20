/**
 * Keyword Import Component
 *
 * Handles bulk keyword import with:
 * - CSV/text drag-drop or paste
 * - Normalization and deduplication
 * - Conflict detection
 * - Decision UI for duplicates
 */

import React, { useState, useRef } from 'react';
import type {
  KeywordDataExtended,
  DuplicateKeyword,
  DeduplicationAction,
  DeduplicationDecision,
} from '../types';
import {
  parseKeywordInput,
  validateKeywordInput,
  cleanKeywords,
  normalizeKeyword,
  findDuplicates,
} from '../utils/keywordNormalizer';

interface KeywordImportProps {
  existingKeywords: KeywordDataExtended[];
  onImport: (keywords: KeywordDataExtended[], decisions: DeduplicationDecision[]) => void;
  onCancel: () => void;
}

export default function KeywordImport({
  existingKeywords,
  onImport,
  onCancel,
}: KeywordImportProps) {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'input' | 'review' | 'duplicates'>('input');
  const [parsedKeywords, setParsedKeywords] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateKeyword[]>([]);
  const [decisions, setDecisions] = useState<DeduplicationDecision[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new (window as any).FileReader();
      reader.onload = (event: any) => {
        const text = event.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new (window as any).FileReader();
      reader.onload = (event: any) => {
        const text = event.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  };

  // Parse and validate input
  const handleParse = () => {
    try {
      const keywords = parseKeywordInput(input);
      const cleaned = cleanKeywords(keywords);
      const validationErrors = validateKeywordInput(cleaned);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setParsedKeywords(cleaned);
      setErrors([]);
      setStep('review');
    } catch (error) {
      setErrors([
        `Failed to parse input: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  // Check for duplicates
  const handleCheckDuplicates = () => {
    // Create temporary keyword objects for duplicate detection
    const newKeywords: KeywordDataExtended[] = parsedKeywords.map((kw, index) => ({
      id: `temp-${index}`,
      keyword: kw,
      normalized: normalizeKeyword(kw),
      type: 'Broad',
      category: 'Core',
      searchVolume: 'Unknown',
      competition: 'Medium',
      relevance: 5,
      source: 'AI',
    }));

    // Find duplicates against existing keywords
    const allKeywords = [...existingKeywords, ...newKeywords];
    const foundDuplicates = findDuplicates(allKeywords, 0.9);

    // Filter to only show duplicates for new keywords
    const newKeywordIds = new Set(newKeywords.map((k) => k.id));
    const relevantDuplicates = foundDuplicates.filter((d) => newKeywordIds.has(d.id));

    if (relevantDuplicates.length > 0) {
      setDuplicates(relevantDuplicates);
      // Initialize decisions with 'keep' as default
      setDecisions(
        relevantDuplicates.map((dup) => ({
          keyword: dup,
          action: 'keep' as DeduplicationAction,
        }))
      );
      setStep('duplicates');
    } else {
      // No duplicates, proceed with import
      handleFinalImport([]);
    }
  };

  // Update deduplication decision
  const updateDecision = (duplicateId: string, action: DeduplicationAction) => {
    setDecisions((prev) => prev.map((d) => (d.keyword.id === duplicateId ? { ...d, action } : d)));
  };

  // Final import
  const handleFinalImport = (deduplicationDecisions: DeduplicationDecision[]) => {
    const newKeywords: KeywordDataExtended[] = parsedKeywords
      .filter((kw) => {
        // Check if this keyword was marked for skip
        const decision = deduplicationDecisions.find(
          (d) => normalizeKeyword(d.keyword.keyword) === normalizeKeyword(kw)
        );
        return !decision || decision.action !== 'merge';
      })
      .map((kw) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        keyword: kw,
        normalized: normalizeKeyword(kw),
        type: 'Broad',
        category: 'Core',
        searchVolume: 'Unknown',
        competition: 'Medium',
        relevance: 5,
        source: 'AI' as const,
      }));

    onImport(newKeywords, deduplicationDecisions);
  };

  // Render step 1: Input
  if (step === 'input') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Keywords</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Paste keywords (one per line) or upload a CSV file
          </p>
        </div>

        {/* Drag and drop area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Drop CSV file here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                CSV, TSV, or plain text format
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Text area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or paste keywords here
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="wireless headphones&#10;bluetooth speaker&#10;noise canceling earbuds"
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supports: One keyword per line, CSV, or TSV format
          </p>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">❌ Errors</h5>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Parse & Review
          </button>
        </div>
      </div>
    );
  }

  // Render step 2: Review parsed keywords
  if (step === 'review') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Keywords</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {parsedKeywords.length} keywords parsed and ready for import
          </p>
        </div>

        {/* Keywords list */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  Keyword
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  Normalized
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {parsedKeywords.map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">
                    {keyword}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {normalizeKeyword(keyword)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setStep('input')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckDuplicates}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Check Duplicates & Import
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render step 3: Handle duplicates
  if (step === 'duplicates') {
    const keepCount = decisions.filter((d) => d.action === 'keep').length;
    const mergeCount = decisions.filter((d) => d.action === 'merge').length;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Duplicate Keywords Found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {duplicates.length} potential duplicates detected. Choose how to handle each.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">
              Total Duplicates
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {duplicates.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="text-xs text-green-800 dark:text-green-300 font-medium">Will Keep</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {keepCount}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Will Skip</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {mergeCount}
            </div>
          </div>
        </div>

        {/* Duplicates list */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {duplicates.map((duplicate) => {
              const decision = decisions.find((d) => d.keyword.id === duplicate.id);

              return (
                <div key={duplicate.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                          {duplicate.keyword}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            duplicate.matchType === 'exact'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              : duplicate.matchType === 'variant'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {duplicate.matchType === 'exact'
                            ? 'Exact Duplicate'
                            : duplicate.matchType === 'variant'
                              ? `${Math.round(duplicate.similarity * 100)}% Similar`
                              : 'Cross-Campaign'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Similar to existing: {duplicate.existingKeyword?.keyword}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateDecision(duplicate.id, 'keep' as DeduplicationAction)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          decision?.action === 'keep'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Keep Both
                      </button>
                      <button
                        onClick={() => updateDecision(duplicate.id, 'merge' as DeduplicationAction)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          decision?.action === 'merge'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Skip New
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setStep('review')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFinalImport(decisions)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Import {parsedKeywords.length - mergeCount} Keywords
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
