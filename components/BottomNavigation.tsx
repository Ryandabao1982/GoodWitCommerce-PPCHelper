import React from 'react';
import type { ViewType } from '../types';
import { NAVIGATION_ITEMS, getNavigationTooltip, isViewAccessible } from '../utils/navigation';

interface BottomNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  hasActiveBrand: boolean;
  hasKeywords: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentView,
  onViewChange,
  hasActiveBrand,
  hasKeywords,
}) => {
  const navigationContext = { hasActiveBrand, hasKeywords };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {NAVIGATION_ITEMS.map((item) => {
          const label = item.mobileLabel ?? item.label;
          const isActive = currentView === item.id;
          const isEnabled = isViewAccessible(item.id, navigationContext);
          const tooltip = getNavigationTooltip(item, navigationContext);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isEnabled) return;
                onViewChange(item.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-colors ${
                isEnabled
                  ? isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  : 'text-gray-400 dark:text-gray-500 opacity-60 cursor-not-allowed'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={!isEnabled}
              disabled={!isEnabled}
              title={tooltip}
            >
              <span className="text-2xl mb-0.5" aria-hidden="true">
                {item.icon}
              </span>
              <span
                className={`text-xs font-medium truncate max-w-full px-1 ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
