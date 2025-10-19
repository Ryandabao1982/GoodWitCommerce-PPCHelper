import React, { useState } from 'react';
import type { ViewType } from './ViewSwitcher';

interface DesktopSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  brands: string[];
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
  onCreateBrandClick: () => void;
  recentSearches: string[];
  onHistoryItemClick: (keyword: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentView,
  onViewChange,
  brands,
  activeBrand,
  onSelectBrand,
  onCreateBrandClick,
  recentSearches,
  onHistoryItemClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'research' as ViewType, label: 'Dashboard', icon: '📊', shortcut: '⌘1' },
    { id: 'bank' as ViewType, label: 'Keyword Bank', icon: '🏦', shortcut: '⌘2' },
    { id: 'planner' as ViewType, label: 'Campaign Planner', icon: '📋', shortcut: '⌘3' },
    { id: 'brand' as ViewType, label: 'Brand Analytics', icon: '🎯', shortcut: '⌘4' },
    { id: 'settings' as ViewType, label: 'Settings', icon: '⚙️', shortcut: '⌘5' },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
            Navigation
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {item.shortcut}
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Brands Section */}
      {!isCollapsed && brands.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Brands
            </h3>
            <button
              onClick={onCreateBrandClick}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Create new brand"
              title="Create new brand"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {brands.slice(0, 5).map((brand) => (
              <button
                key={brand}
                onClick={() => onSelectBrand(brand)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                  brand === activeBrand
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!isCollapsed && recentSearches.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
            Recent Searches
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentSearches.slice(0, 3).map((keyword, index) => (
              <button
                key={index}
                onClick={() => onHistoryItemClick(keyword)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 truncate"
                title={keyword}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
