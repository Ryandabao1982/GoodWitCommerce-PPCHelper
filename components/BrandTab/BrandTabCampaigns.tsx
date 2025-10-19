import React, { useState } from 'react';
import { BrandState, Portfolio } from '../../types';

interface BrandTabCampaignsProps {
  brandState: BrandState;
  portfolios: Portfolio[];
}

export const BrandTabCampaigns: React.FC<BrandTabCampaignsProps> = ({ brandState, portfolios }) => {

  const handleCreateShell = (type: string) => {
    console.log(`Creating shell campaign: ${type}`);
  };

  const handleBulkExport = (type: 'promote' | 'negatives') => {
    console.log(`Exporting ${type} CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Speed Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⚡ Speed Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => handleCreateShell('SP_EXACT_PERF')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            + SP_EXACT_PERF
          </button>
          <button
            onClick={() => handleCreateShell('SP_EXACT_SKAG')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            + SP_EXACT_SKAG
          </button>
          <button
            onClick={() => handleCreateShell('SP_PT_AUTO')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            + SP_PT_AUTO
          </button>
          <button
            onClick={() => handleCreateShell('SP_BROAD')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            + SP_BROAD
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleBulkExport('promote')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            📥 Export Promote-to-Exact.csv
          </button>
          <button
            onClick={() => handleBulkExport('negatives')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            📥 Export Negatives.csv
          </button>
        </div>
      </div>

      {/* Portfolio Boards */}
      {portfolios.map(portfolio => {
        const portfolioCampaigns = brandState.campaigns.filter(c => 
          portfolio.campaigns.includes(c.id)
        );

        if (portfolioCampaigns.length === 0) return null;

        return (
          <div key={portfolio.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {portfolio.name} Portfolio
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Budget: ${portfolio.budget.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioCampaigns.map(campaign => (
                <div key={campaign.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{campaign.name}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {campaign.adGroups.length} ad groups
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
