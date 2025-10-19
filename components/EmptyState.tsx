import React from 'react';

export type EmptyStateType = 
  | 'no-brand'
  | 'no-keywords'
  | 'no-campaigns'
  | 'no-search-yet'
  | 'brand-tab-preview';

interface EmptyStateProps {
  type: EmptyStateType;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  customMessage?: string;
}

const emptyStateConfigs = {
  'no-brand': {
    icon: '🏢',
    title: 'No Brand Selected',
    description: 'Create your first brand workspace to start organizing your keyword research and campaigns.',
    primaryActionText: 'Create Your First Brand',
    secondaryActionText: null,
  },
  'no-keywords': {
    icon: '🔍',
    title: 'No Keywords Yet',
    description: 'Enter a seed keyword in the search box to start building your keyword bank with AI-powered suggestions.',
    primaryActionText: 'Go to Dashboard',
    secondaryActionText: 'View Search Tips',
  },
  'no-campaigns': {
    icon: '📋',
    title: 'No Campaigns Yet',
    description: 'Create structured campaigns to organize your keywords and optimize your PPC strategy for maximum ROI.',
    primaryActionText: 'Create Your First Campaign',
    secondaryActionText: 'Browse Campaign Templates',
  },
  'no-search-yet': {
    icon: '🎯',
    title: 'Ready to Start Researching?',
    description: 'Enter a product keyword above to generate comprehensive keyword suggestions with detailed metrics and insights.',
    primaryActionText: 'View Example Searches',
    secondaryActionText: null,
  },
  'brand-tab-preview': {
    icon: '🎓',
    title: 'Preview Mode - Demo Data',
    description: 'This view will populate with real data once you have active campaigns and performance metrics. The information shown below is for demonstration purposes.',
    primaryActionText: 'Create First Campaign',
    secondaryActionText: 'Hide Preview',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onPrimaryAction,
  onSecondaryAction,
  customMessage,
}) => {
  const config = emptyStateConfigs[type];

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="text-6xl mb-4">
          {config.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {config.title}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
          {customMessage || config.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {config.primaryActionText && onPrimaryAction && (
            <button
              onClick={onPrimaryAction}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {config.primaryActionText}
            </button>
          )}
          
          {config.secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              {config.secondaryActionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateCardProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Smaller inline empty state card for use within larger layouts
 */
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
