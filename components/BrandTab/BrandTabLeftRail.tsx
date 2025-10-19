import React from 'react';
import { Portfolio } from '../../types';

interface BrandTabLeftRailProps {
  portfolios: Portfolio[];
  selectedPortfolio: string | null;
  onPortfolioClick: (portfolioId: string) => void;
}

export const BrandTabLeftRail: React.FC<BrandTabLeftRailProps> = ({
  portfolios,
  selectedPortfolio,
  onPortfolioClick,
}) => {
  const getPortfolioColor = (name: string) => {
    switch (name) {
      case 'Launch':
        return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700';
      case 'Optimize':
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
      case 'Scale':
        return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'Maintain':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
        Portfolios
      </h3>
      <div className="space-y-2">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => onPortfolioClick(portfolio.id)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedPortfolio === portfolio.id
                ? 'ring-2 ring-blue-500 shadow-md'
                : ''
            } ${getPortfolioColor(portfolio.name)}`}
          >
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {portfolio.name}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Budget: ${portfolio.budget.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {portfolio.campaigns.length} campaign{portfolio.campaigns.length !== 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>

      {/* Filter Info */}
      {selectedPortfolio && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Filtered by:
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {portfolios.find(p => p.id === selectedPortfolio)?.name}
          </div>
          <button
            onClick={() => onPortfolioClick(selectedPortfolio)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};
