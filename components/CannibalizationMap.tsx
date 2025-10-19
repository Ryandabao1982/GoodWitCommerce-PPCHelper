/**
 * Cannibalization Map Component
 * Shows keywords that are active in multiple campaigns and highlights overlaps
 */

import React, { useState, useMemo } from 'react';

interface CannibalizationIssue {
  keywordId: string;
  keyword: string;
  normalized: string;
  campaigns: {
    id: string;
    name: string;
    targeting: string;
    matchType: string;
  }[];
}

interface CannibalizationMapProps {
  issues: CannibalizationIssue[];
  onApplyNegative: (keywordId: string, campaignIds: string[]) => void;
  onApplyAllNegatives: () => void;
}

export const CannibalizationMap: React.FC<CannibalizationMapProps> = ({
  issues,
  onApplyNegative,
  onApplyAllNegatives,
}) => {
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  const toggleExpand = (keywordId: string) => {
    setExpandedKeyword(expandedKeyword === keywordId ? null : keywordId);
  };

  const toggleSelect = (keywordId: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(keywordId)) {
      newSelected.delete(keywordId);
    } else {
      newSelected.add(keywordId);
    }
    setSelectedIssues(newSelected);
  };

  const handleApplySelected = () => {
    if (selectedIssues.size === 0) {
      alert('Please select keywords first');
      return;
    }

    selectedIssues.forEach(keywordId => {
      const issue = issues.find(i => i.keywordId === keywordId);
      if (issue) {
        // Apply negatives to all campaigns except exact match
        const campaignsToNegate = issue.campaigns
          .filter(c => c.matchType !== 'EXACT')
          .map(c => c.id);
        onApplyNegative(keywordId, campaignsToNegate);
      }
    });

    setSelectedIssues(new Set());
  };

  const totalIssues = issues.length;
  const totalCampaignsAffected = useMemo(() => {
    const campaigns = new Set<string>();
    issues.forEach(issue => {
      issue.campaigns.forEach(c => campaigns.add(c.id));
    });
    return campaigns.size;
  }, [issues]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cannibalization Map
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keywords active in multiple campaigns without proper negative targeting
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="text-xs text-red-600 dark:text-red-400">Issues Found</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{totalIssues}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Campaigns Affected</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{totalCampaignsAffected}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg col-span-2 md:col-span-1">
          <div className="text-xs text-blue-600 dark:text-blue-400">Estimated Waste</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ${(totalIssues * 50).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {totalIssues > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <button
            onClick={onApplyAllNegatives}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            🔧 Fix All Issues
          </button>
          {selectedIssues.size > 0 && (
            <button
              onClick={handleApplySelected}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              ✓ Fix Selected ({selectedIssues.size})
            </button>
          )}
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.keywordId}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Issue Header */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => toggleExpand(issue.keywordId)}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedIssues.has(issue.keywordId)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(issue.keywordId);
                  }}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {issue.keyword}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active in {issue.campaigns.length} campaigns
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                  ⚠️ Overlap
                </span>
                <span className="text-gray-400">
                  {expandedKeyword === issue.keywordId ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedKeyword === issue.keywordId && (
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Campaign Assignments:
                </h4>
                <div className="space-y-2">
                  {issue.campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {campaign.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {campaign.targeting} • {campaign.matchType}
                        </div>
                      </div>
                      {campaign.matchType === 'EXACT' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                          ✓ Keep
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
                          → Add Negative
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Recommendation:</strong> Add negative exact match for "{issue.keyword}" 
                    to all broad/phrase campaigns to prevent cannibalization with exact match campaign.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Cannibalization Issues
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All keywords are properly managed with negatives
          </p>
        </div>
      )}
    </div>
  );
};
