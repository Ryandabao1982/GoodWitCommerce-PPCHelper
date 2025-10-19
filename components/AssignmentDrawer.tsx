/**
 * Assignment Drawer Component
 * 
 * Provides campaign assignment recommendations for keywords.
 */

import React, { useState } from 'react';
import type { CampaignRecommendation } from '../types';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  keywordName: string;
  recommendations: CampaignRecommendation[];
  onAssign?: (campaignId: string, adGroup?: string, matchType?: string, bid?: number) => void;
}

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
  isOpen,
  onClose,
  keywordName,
  recommendations,
  onAssign,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [customBid, setCustomBid] = useState<string>('');

  if (!isOpen) return null;

  const selectedRec = recommendations.find((r) => r.campaignId === selectedCampaign);

  const handleAssign = () => {
    if (!selectedCampaign) return;

    const rec = recommendations.find((r) => r.campaignId === selectedCampaign);
    const bid = customBid ? parseFloat(customBid) : rec?.suggestedBid;

    onAssign && onAssign(
      selectedCampaign,
      rec?.suggestedAdGroup,
      rec?.suggestedMatchType,
      bid
    );

    // Close drawer and reset
    onClose();
    setSelectedCampaign(null);
    setCustomBid('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Campaign Assignment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {keywordName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* No Recommendations */}
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤔</div>
              <div className="text-gray-600 dark:text-gray-400">
                No recommendations available
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Create campaigns first to get assignment recommendations
              </p>
            </div>
          ) : (
            <>
              {/* Recommendations List */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Recommended Campaigns ({recommendations.length})
                </h3>

                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.campaignId}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCampaign === rec.campaignId
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedCampaign(rec.campaignId)}
                    >
                      {/* Campaign Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {rec.campaignName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rec.reason}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {rec.score}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Match Score
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Details */}
                      {selectedCampaign === rec.campaignId && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          {rec.suggestedAdGroup && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 w-32">Ad Group:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {rec.suggestedAdGroup}
                              </span>
                            </div>
                          )}
                          {rec.suggestedMatchType && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 w-32">Match Type:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {rec.suggestedMatchType}
                              </span>
                            </div>
                          )}
                          {rec.suggestedBid && (
                            <div className="flex items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 w-32">Suggested Bid:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                ${rec.suggestedBid.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Bid Input */}
              {selectedRec && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Assignment Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom Bid (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.02"
                          value={customBid}
                          onChange={(e) => setCustomBid(e.target.value)}
                          placeholder={selectedRec.suggestedBid?.toFixed(2) || '0.50'}
                          className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave empty to use suggested bid: ${selectedRec.suggestedBid?.toFixed(2) || '0.50'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  disabled={!selectedCampaign}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCampaign
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Assign to Campaign
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
