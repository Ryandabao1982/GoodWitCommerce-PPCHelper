import React from 'react';

interface SidebarProps {
  recentSearches: string[];
  onHistoryItemClick: (keyword: string) => void;
  brands: string[];
  onSelectBrand: (name: string) => void;
  onDeleteBrand: (name: string) => void;
  onCreateBrandClick: () => void;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  recentSearches, 
  onHistoryItemClick,
  brands,
  onSelectBrand,
  onDeleteBrand,
  onCreateBrandClick,
  isLoading, 
  isOpen, 
  onClose 
}) => {

  return (
    <aside 
      className={`
        fixed top-0 left-0 h-full w-72 flex-shrink-0 bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out z-30
        lg:static lg:transform-none lg:transition-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      aria-hidden={!isOpen}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Research Menu</h2>
        <button 
          onClick={onClose} 
          className="lg:hidden p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Your Brands
          </h3>
          {brands.length > 0 ? (
            <ul className="space-y-2 mb-4">
              {brands.map((brandName) => (
                <li key={brandName} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-white truncate" title={brandName}>{brandName}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <button 
                            onClick={() => onSelectBrand(brandName)}
                            disabled={isLoading}
                            className="flex-1 text-center px-2 py-1 text-xs bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-brand-secondary disabled:opacity-50"
                        >
                            Select
                        </button>
                        <button 
                            onClick={() => onDeleteBrand(brandName)}
                            disabled={isLoading}
                            className="p-2 text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-red-500 transition-colors disabled:opacity-50"
                            title={`Delete "${brandName}"`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-gray-500 mb-4 px-1">You haven't created any brands yet. Use the button below to start.</p>
          )}

          <button
              onClick={onCreateBrandClick}
              className="w-full flex items-center justify-center px-4 py-2 bg-brand-primary hover:bg-orange-500 text-gray-900 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-brand-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Brand
            </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

         <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Search History
          </h3>
          {recentSearches.length > 0 ? (
            <ul>
              {recentSearches.map((keyword) => (
                <li key={keyword} className="mb-2">
                  <button
                    onClick={() => onHistoryItemClick(keyword)}
                    disabled={isLoading}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Search for "${keyword}"`}
                  >
                    <span className="truncate block">{keyword}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 px-3">Your recent searches will appear here.</p>
          )}
        </div>

      </div>
    </aside>
  );
};