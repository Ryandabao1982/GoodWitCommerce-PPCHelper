import React, { useState } from 'react';
import { BrandState, Portfolio, Campaign } from '../../types';

interface BrandTabCampaignsProps {
  brandState: BrandState;
  portfolios: Portfolio[];
}

export const BrandTabCampaigns: React.FC<BrandTabCampaignsProps> = ({ brandState, portfolios }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showAssignmentDrawer, setShowAssignmentDrawer] = useState(false);

  // Mock ACOS trends and multiplier data
  const campaignData = brandState.campaigns.map(campaign => ({
    ...campaign,
    acosTrend: [25, 23, 22, 24, 21, 20, 19],
    pacing: 75 + Math.random() * 25, // Budget pacing %
    topOfSearchMultiplier: 1.5,
    productPageMultiplier: 1.2,
    suggestedTopOfSearch: [1.2, 1.8],
    suggestedProductPage: [1.0, 1.5],
  }));

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleShowAssignment = () => {
    if (selectedKeywords.length > 0) {
      setShowAssignmentDrawer(true);
    }
  };

  const handleCreateShell = (type: string) => {
    console.log(`Creating shell campaign: ${type}`);
    // This would create a new campaign shell
  };

  const handleBulkExport = (type: 'promote' | 'negatives') => {
    console.log(`Exporting ${type} CSV`);
    // This would generate and download CSV
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
        const portfolioCampaigns = campaignData.filter(c => 
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
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Assignment Drawer */}
      {showAssignmentDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Keyword Assignment Recommendations
              </h3>
              <button
                onClick={() => setShowAssignmentDrawer(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedKeywords.map((keyword, idx) => {
                // Mock recommendation
                const recommendation = {
                  campaign: 'SP_EXACT_PERF',
                  matchType: 'Exact',
                  bid: 1.25 + Math.random() * 0.5,
                  placement: 'Top of Search',
                  phase: 'Phase 3',
                  justification: 'High CVR and within ACOS target',
                };

                return (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white mb-2">{keyword}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Campaign:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{recommendation.campaign}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Match Type:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{recommendation.matchType}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Suggested Bid:</span>
                        <div className="font-medium text-gray-900 dark:text-white">${recommendation.bid.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Placement:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{recommendation.placement}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Rollout Phase:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{recommendation.phase}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Justification:</span>
                        <div className="text-gray-700 dark:text-gray-300">{recommendation.justification}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  console.log('Applying assignments');
                  setShowAssignmentDrawer(false);
                  setSelectedKeywords([]);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Apply Assignments
              </button>
              <button
                onClick={() => setShowAssignmentDrawer(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CampaignData {
  name: string;
  acosTrend: number[];
  multiplier: number;
  // Add other properties as needed
}

const CampaignCard: React.FC<{ campaign: CampaignData }> = ({ campaign }) => {
  const currentACOS = campaign.acosTrend[campaign.acosTrend.length - 1];
  const isOnTarget = currentACOS <= 25;

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{campaign.name}</h4>
      
      {/* ACOS Trend */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">ACOS Trend</span>
          <span className={`text-sm font-bold ${isOnTarget ? 'text-green-600' : 'text-red-600'}`}>
            {currentACOS.toFixed(1)}%
          </span>
        </div>
        <div className="flex gap-1 h-8 items-end">
          {campaign.acosTrend.map((acos: number, idx: number) => {
            const height = (acos / 30) * 100;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-t ${acos <= 25 ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ height: `${height}%` }}
                title={`${acos.toFixed(1)}%`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Pacing */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Budget Pacing</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {campaign.pacing.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-full rounded-full ${
              campaign.pacing > 100 ? 'bg-red-500' :
              campaign.pacing > 90 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(campaign.pacing, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Multipliers */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Top of Search:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {campaign.topOfSearchMultiplier.toFixed(1)}x
            <span className="text-gray-500 ml-1">
              (Rec: {campaign.suggestedTopOfSearch[0].toFixed(1)}-{campaign.suggestedTopOfSearch[1].toFixed(1)}x)
            </span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Product Page:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {campaign.productPageMultiplier.toFixed(1)}x
            <span className="text-gray-500 ml-1">
              (Rec: {campaign.suggestedProductPage[0].toFixed(1)}-{campaign.suggestedProductPage[1].toFixed(1)}x)
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
