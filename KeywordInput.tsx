import React, { useState, useEffect, useRef } from 'react';

interface KeywordInputProps {
  seedKeyword: string;
  setSeedKeyword: (value: string) => void;
  onSearch: (keyword?: string) => void;
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
}) => {
  const [internalValue, setInternalValue] = useState(seedKeyword);
  const debounceTimeoutRef = useRef<number | null>(null);
  
  const isDisabled = isLoading || !isBrandActive;
  
  // Sync with external changes from parent (e.g., clicking history)
  useEffect(() => {
    setInternalValue(seedKeyword);
  }, [seedKeyword]);

  // Debounce updates to parent state to reduce re-renders
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      setSeedKeyword(internalValue);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [internalValue, setSeedKeyword]);


  const handleSimpleSearch = () => {
    if (isDisabled) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    // Pass the most current value directly to the search function
    onSearch(internalValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSimpleSearch();
    }
  };
  
  const commonInputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <label htmlFor={isAdvancedSearchOpen ? "advanced-keywords" : "seed-keyword"} className="block text-lg font-medium text-gray-700 dark:text-gray-300">
                {isAdvancedSearchOpen ? 'Advanced Search' : 'Enter a Seed Keyword or Product'}
            </label>
            <button 
                onClick={onToggleAdvancedSearch} 
                className="text-sm font-medium text-brand-primary hover:text-orange-300 transition-colors focus:outline-none"
                aria-label={isAdvancedSearchOpen ? 'Switch to simple search' : 'Switch to advanced search'}
            >
                {isAdvancedSearchOpen ? 'Simple Search' : 'Advanced Search'}
            </button>
        </div>
        
        <div className="mt-4">
            {isAdvancedSearchOpen ? (
                <div className="space-y-4 animate-slide-down">
                    <div>
                        <label htmlFor="advanced-keywords" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Keywords (one per line)
                        </label>
                        <textarea
                            id="advanced-keywords"
                            value={advancedKeywords}
                            onChange={(e) => setAdvancedKeywords(e.target.value)}
                            rows={3}
                            placeholder="e.g., 'wireless earbuds'&#10;'bamboo cutting board'"
                            className={`${commonInputClass} resize-y`}
                            disabled={isDisabled}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="min-volume" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min. Search Volume</label>
                            <input id="min-volume" type="number" value={minVolume} onChange={(e) => setMinVolume(e.target.value)} placeholder="e.g., 1000" min="0" className={commonInputClass} disabled={isDisabled} />
                        </div>
                        <div>
                            <label htmlFor="max-volume" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max. Search Volume</label>
                            <input id="max-volume" type="number" value={maxVolume} onChange={(e) => setMaxVolume(e.target.value)} placeholder="e.g., 50000" min="0" className={commonInputClass} disabled={isDisabled} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label htmlFor="brand-name" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Your Brand Name (Optional)</label>
                        <input id="brand-name" type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., MyBrand" className={commonInputClass} disabled={isDisabled} />
                        <p className="text-xs text-gray-500 mt-1">Providing your brand name helps the AI find relevant competitor and brand-specific terms.</p>
                    </div>

                    <div className="pt-2">
                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="web-analysis"
                            aria-describedby="web-analysis-description"
                            name="web-analysis"
                            type="checkbox"
                            checked={isWebAnalysisEnabled}
                            onChange={(e) => setIsWebAnalysisEnabled(e.target.checked)}
                            disabled={isDisabled}
                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 dark:border-gray-500 dark:bg-gray-700 text-brand-primary focus:ring-brand-primary"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="web-analysis" className="font-medium text-gray-700 dark:text-gray-300">
                            Enable Web Analysis
                          </label>
                          <p id="web-analysis-description" className="text-gray-500">
                            Uses Google Search for deeper insights and competitor data. (Slower)
                          </p>
                        </div>
                      </div>
                    </div>
                     <button
                        onClick={() => onSearch()}
                        disabled={isDisabled}
                        className="w-full flex items-center justify-center px-6 py-3 bg-brand-primary hover:bg-orange-500 text-gray-900 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                        {isLoading ? (
                            <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                            </>
                        ) : (
                            <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            Generate Keywords
                            </>
                        )}
                    </button>
                </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  id="seed-keyword"
                  type="text"
                  value={internalValue}
                  onChange={(e) => setInternalValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'wireless earbuds' or 'bamboo cutting board'"
                  className={`${commonInputClass} flex-grow`}
                  disabled={isDisabled}
                  autoComplete="off"
                />
                 <button
                  onClick={handleSimpleSearch}
                  disabled={isDisabled}
                  className="flex items-center justify-center px-6 py-3 bg-brand-primary hover:bg-orange-500 text-gray-900 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Generate
                </button>
              </div>
            )}
            
            {!isBrandActive && (
                 <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3 text-center">Please select a brand from the top menu to begin.</p>
            )}
        </div>
      </div>
    </div>
  );
};