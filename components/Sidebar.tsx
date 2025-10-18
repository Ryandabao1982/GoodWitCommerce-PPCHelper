import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  recentSearches: string[];
  onHistoryItemClick: (keyword: string) => void;
  brands: string[];
  onSelectBrand: (brand: string) => void;
  onDeleteBrand: (brand: string) => void;
  onCreateBrandClick: () => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  recentSearches,
  onHistoryItemClick,
  brands,
  onSelectBrand,
  onDeleteBrand,
  onCreateBrandClick,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Brands Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">Brands</h3>
              <button
                onClick={() => {
                  onCreateBrandClick();
                  onClose();
                }}
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                aria-label="Create new brand"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {brands.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No brands yet</p>
            ) : (
              <ul className="space-y-2">
                {brands.map((brand) => (
                  <li key={brand} className="flex items-center justify-between group">
                    <button
                      onClick={() => {
                        onSelectBrand(brand);
                        onClose();
                      }}
                      className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {brand}
                    </button>
                    <button
                      onClick={() => onDeleteBrand(brand)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                      aria-label={`Delete ${brand}`}
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">
                Recent Searches
              </h3>
              <ul className="space-y-2">
                {recentSearches.map((keyword, index) => (
                  <li key={index}>
                    <button
                      onClick={() => {
                        onHistoryItemClick(keyword);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {keyword}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
