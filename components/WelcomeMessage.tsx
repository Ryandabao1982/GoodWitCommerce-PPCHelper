import React from 'react';

interface WelcomeMessageProps {
  activeBrand: string | null;
  onCreateBrandClick: () => void;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  activeBrand,
  onCreateBrandClick,
}) => {
  if (activeBrand) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 md:p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Welcome to {activeBrand}! 🎉
          </h2>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-4 md:mb-6">
            Start your keyword research by entering a seed keyword above. Our AI will generate comprehensive keyword suggestions with detailed metrics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. Research</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enter keywords and get AI-powered suggestions</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🏦</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Organize</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Build your keyword bank and analyze results</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Plan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create campaigns and export to Amazon</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
};
