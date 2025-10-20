import React from 'react';

export type ViewType = 'research' | 'bank' | 'planner' | 'brand' | 'sop' | 'settings';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const views: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: 'research', label: 'Dashboard', icon: '📊' },
    { id: 'bank', label: 'Keyword Bank', icon: '🏦' },
    { id: 'planner', label: 'Campaign Planner', icon: '📋' },
    { id: 'brand', label: 'Brand Tab', icon: '🎯' },
    { id: 'sop', label: 'SOP Library', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div
      className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4"
      data-tour="view-switcher"
    >
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex-1 min-w-[100px] px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
            currentView === view.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span className="mr-1 md:mr-2">{view.icon}</span>
          <span className="hidden sm:inline">{view.label}</span>
          <span className="sm:hidden">{view.label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
};
