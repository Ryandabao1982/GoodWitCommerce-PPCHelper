import React from 'react';
import type { ViewType } from './ViewSwitcher';

interface BottomNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  const navItems: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: 'research', label: 'Dashboard', icon: '📊' },
    { id: 'bank', label: 'Keywords', icon: '🏦' },
    { id: 'planner', label: 'Campaigns', icon: '📋' },
    { id: 'brand', label: 'Brand', icon: '🎯' },
    { id: 'sop', label: 'SOPs', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-2xl mb-0.5" aria-hidden="true">
                {item.icon}
              </span>
              <span className={`text-xs font-medium truncate max-w-full px-1 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
