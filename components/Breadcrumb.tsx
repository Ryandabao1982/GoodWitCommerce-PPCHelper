import React from 'react';
import type { ViewType } from './ViewSwitcher';

interface BreadcrumbProps {
  currentView: ViewType;
  activeBrand: string | null;
  onViewChange: (view: ViewType) => void;
  onBrandClick?: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentView,
  activeBrand,
  onViewChange,
  onBrandClick,
}) => {
  const viewLabels: Record<ViewType, string> = {
    research: 'Dashboard',
    bank: 'Keyword Bank',
    planner: 'Campaign Planner',
    brand: 'Brand Analytics',
    settings: 'Settings',
  };

  const breadcrumbItems: Array<{ label: string; onClick?: () => void }> = [
    { label: 'Home', onClick: () => onViewChange('research') },
  ];

  if (activeBrand) {
    breadcrumbItems.push({
      label: activeBrand,
      onClick: onBrandClick,
    });
  }

  breadcrumbItems.push({
    label: viewLabels[currentView],
  });

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4"
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              data-tour={index === 1 && activeBrand ? 'brand-selector' : undefined}
            >
              {item.label}
            </button>
          ) : (
            <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
