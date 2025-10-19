import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  brands: string[];
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
  onOpenCreateBrandModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  brands,
  activeBrand,
  onSelectBrand,
  onOpenCreateBrandModal,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Menu and Title */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Amazon PPC Keyword Genius
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                AI-Powered Keyword Research & Campaign Planning
              </p>
            </div>
          </div>

          {/* Right: Brand Selector and Dark Mode Toggle */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {brands.length > 0 && (
              <div className="flex items-center gap-1 md:gap-2">
                <select
                  value={activeBrand || ''}
                  onChange={(e) => e.target.value && onSelectBrand(e.target.value)}
                  className="px-2 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white max-w-[100px] sm:max-w-[150px] md:max-w-none truncate"
                  title="Select brand"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onOpenCreateBrandModal}
                  className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                  aria-label="Create new brand"
                  title="Create new brand"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
