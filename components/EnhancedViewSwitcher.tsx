import React from 'react';
import type { ViewType } from './ViewSwitcher';

interface EnhancedViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const EnhancedViewSwitcher: React.FC<EnhancedViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  const views: Array<{
    id: ViewType;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      id: 'research',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics',
    },
    {
      id: 'bank',
      label: 'Keyword Bank',
      icon: '🏦',
      description: 'Manage Keywords',
    },
    {
      id: 'planner',
      label: 'Campaign Planner',
      icon: '📋',
      description: 'Organize Campaigns',
    },
    {
      id: 'brand',
      label: 'Brand Analytics',
      icon: '🎯',
      description: 'Performance Insights',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'App Configuration',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
      <div className="flex gap-1">
        {views.map((view) => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex-1 group relative px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{view.icon}</span>
                <span className="text-sm font-semibold">{view.label}</span>
                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {view.description}
                </span>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white dark:bg-blue-300 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
