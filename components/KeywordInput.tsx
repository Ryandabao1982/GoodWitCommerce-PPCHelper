import React from 'react';

interface KeywordInputProps {
  seedKeyword: string;
  setSeedKeyword: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  isBrandActive: boolean;
  isAdvancedSearchOpen: boolean;
  onToggleAdvancedSearch: () => void;
  advancedKeywords: string;
  setAdvancedKeywords: (value: string) => void;
  minVolume: string;
  setMinVolume: (value: string) => void;
  maxVolume: string;
  setMaxVolume: (value: string) => void;
  isWebAnalysisEnabled: boolean;
  setIsWebAnalysisEnabled: (value: boolean) => void;
  brandName: string;
  setBrandName: (value: string) => void;
  asin?: string;
  setAsin?: (value: string) => void;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({
  seedKeyword,
  setSeedKeyword,
  onSearch,
  isLoading,
  isBrandActive,
  isAdvancedSearchOpen,
  onToggleAdvancedSearch,
  advancedKeywords,
  setAdvancedKeywords,
  minVolume,
  setMinVolume,
  maxVolume,
  setMaxVolume,
  isWebAnalysisEnabled,
  setIsWebAnalysisEnabled,
  brandName,
  setBrandName,
  asin,
  setAsin,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && isBrandActive) {
      onSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="keyword-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seed Keyword
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="keyword-input"
                type="text"
                value={advancedKeywords}
                onChange={(e) => setAdvancedKeywords(e.target.value)}
                placeholder={isBrandActive ? "Enter keyword (e.g., wireless headphones)" : "Create a brand first..."}
                disabled={!isBrandActive || isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={!isBrandActive || isLoading || !advancedKeywords.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={onToggleAdvancedSearch}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg className={`w-4 h-4 transition-transform ${isAdvancedSearchOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Options
          </button>

          {/* Advanced Options Panel */}
          {isAdvancedSearchOpen && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <div>
                <label htmlFor="asin-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ASIN (Amazon Product ID)
                </label>
                <input
                  id="asin-input"
                  type="text"
                  value={asin || ''}
                  onChange={(e) => setAsin && setAsin(e.target.value)}
                  placeholder="e.g., B08N5WRWNW (optional)"
                  disabled={!isBrandActive}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Research keywords specifically for this product
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="web-analysis"
                  checked={isWebAnalysisEnabled}
                  onChange={(e) => setIsWebAnalysisEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="web-analysis" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable Web Analysis (more keywords, slower)
                </label>
              </div>

              <div>
                <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Context (optional)
                </label>
                <input
                  id="brand-name"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your brand name for branded keywords..."
                  disabled={!isBrandActive}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min-volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Volume (optional)
                  </label>
                  <input
                    id="min-volume"
                    type="text"
                    value={minVolume}
                    onChange={(e) => setMinVolume(e.target.value)}
                    placeholder="e.g., 1000"
                    disabled={!isBrandActive}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="max-volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Volume (optional)
                  </label>
                  <input
                    id="max-volume"
                    type="text"
                    value={maxVolume}
                    onChange={(e) => setMaxVolume(e.target.value)}
                    placeholder="e.g., 10000"
                    disabled={!isBrandActive}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
