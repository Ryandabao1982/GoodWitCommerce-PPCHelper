import React, { useState } from 'react';
import { splitSeedKeywords } from '../utils/keywordParsing';

interface ManualKeywordEntryProps {
  onAddKeywords: (keywords: string[]) => void;
  isProcessing: boolean;
  brandName: string;
}

export const ManualKeywordEntry: React.FC<ManualKeywordEntryProps> = ({
  onAddKeywords,
  isProcessing,
  brandName,
}) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywordInput.trim()) {
      return;
    }

    // Parse keywords - split by newline or comma
    const keywords = splitSeedKeywords(keywordInput)
      .filter(k => k.length <= 200);

    if (keywords.length === 0) {
      alert('Please enter at least one valid keyword (max 200 characters each)');
      return;
    }

    if (keywords.length > 50) {
      alert('Maximum 50 keywords can be added at once');
      return;
    }

    onAddKeywords(keywords);
    setKeywordInput('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isProcessing}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">➕</span>
          <div className="text-left">
            <div className="font-semibold text-indigo-900 dark:text-indigo-100">
              Add Your Own Keywords
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">
              Manually add keywords for AI analysis
            </div>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-indigo-200 dark:border-indigo-800">
          <div className="space-y-3">
            <div>
              <label htmlFor="manual-keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter keywords (one per line or comma-separated)
              </label>
              <textarea
                id="manual-keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="wireless earbuds&#10;bluetooth headphones&#10;noise cancelling headphones"
                disabled={isProcessing}
                rows={5}
                maxLength={10000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maximum 50 keywords at once • Each keyword max 200 characters
              </div>
            </div>

            {brandName && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Brand context:</strong> "{brandName}" will be used for AI analysis
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isProcessing || !keywordInput.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  '🤖 Analyze with AI'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setKeywordInput('');
                  setIsExpanded(false);
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
