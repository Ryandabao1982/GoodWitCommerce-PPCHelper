import React from 'react';

interface WelcomeMessageProps {
  activeBrand: string | null;
  onCreateBrandClick: () => void;
  hasKeywords?: boolean;
  currentView?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  activeBrand,
  onCreateBrandClick,
  hasKeywords = false,
  currentView = 'research',
}) => {
  // Don't show welcome message if user has keywords (experienced user)
  if (hasKeywords && currentView !== 'research') {
    return null;
  }

  // Show only on Dashboard if user has completed first search
  if (hasKeywords && currentView === 'research') {
    return null;
  }

  // No brand - show Quick Start Guide only (handled elsewhere)
  if (!activeBrand) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 md:p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Welcome to Amazon PPC Keyword Genius! 🚀
          </h2>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-4 md:mb-6">
            Get started by creating your first brand workspace. Each brand maintains its own keyword bank, search history, and campaign structures.
          </p>
          <button
            onClick={onCreateBrandClick}
            className="inline-flex items-center px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Brand
          </button>
        </div>
      </div>
    );
  }

  // Brand exists but no keywords yet - show compact welcome for Dashboard only
  if (currentView === 'research') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 md:p-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
            Welcome to {activeBrand}! 🎉
          </h2>
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
            Start your keyword research by entering a seed keyword below. Our AI will generate comprehensive keyword suggestions with detailed metrics.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
