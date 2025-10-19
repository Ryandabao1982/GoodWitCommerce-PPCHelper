import React, { useState } from 'react';
import { KeywordData, Campaign } from '../types';
import { EmptyState } from './EmptyState';
import { ManualKeywordEntry } from './ManualKeywordEntry';

interface KeywordBankProps {
  keywords: KeywordData[];
  searchedKeywords: string[];
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  onDeleteSelected: () => void;
  onUnassignSelected: () => void;
  activeBrandName: string;
  selectedKeywords: Set<string>;
  onToggleSelect: (keyword: string, isSelected: boolean) => void;
  onToggleSelectAll: (isSelected: boolean) => void;
  onDragStart: (e: React.DragEvent, keyword: string) => void;
  onAddManualKeywords?: (keywords: string[]) => void;
  isAnalyzingManualKeywords?: boolean;
  brandContextName?: string;
}

export const KeywordBank: React.FC<KeywordBankProps> = ({
  keywords,
  searchedKeywords,
  campaigns,
  onCampaignsChange,
  onAssignKeywords,
  onDeleteSelected,
  onUnassignSelected,
  activeBrandName,
  selectedKeywords,
  onToggleSelect,
  onToggleSelectAll,
  onDragStart,
  onAddManualKeywords,
  isAnalyzingManualKeywords = false,
  brandContextName = '',
}) => {
  const [filter, setFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedAdGroupId, setSelectedAdGroupId] = useState('');

  const filteredKeywords = keywords.filter(kw =>
    kw.keyword.toLowerCase().includes(filter.toLowerCase())
  );

  const allSelected = filteredKeywords.length > 0 && filteredKeywords.every(kw => selectedKeywords.has(kw.keyword));

  const handleExportCSV = () => {
    const csvContent = [
      ['Keyword', 'Type', 'Category', 'Search Volume', 'Competition', 'Relevance', 'Source'].join(','),
      ...keywords.map(kw =>
        [kw.keyword, kw.type, kw.category, kw.searchVolume, kw.competition, kw.relevance, kw.source].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBrandName}_keywords.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAssignClick = () => {
    if (campaigns.length === 0) {
      alert('Please create a campaign first in the Campaign Planner view.');
      return;
    }
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedCampaignId || !selectedAdGroupId) {
      alert('Please select both a campaign and an ad group.');
      return;
    }
    onAssignKeywords(selectedCampaignId, selectedAdGroupId, Array.from(selectedKeywords));
    setShowAssignModal(false);
    setSelectedCampaignId('');
    setSelectedAdGroupId('');
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Show empty state if no keywords, but still show manual entry option
  if (keywords.length === 0) {
    return (
      <div className="space-y-6">
        {/* Manual Keyword Entry - Available even with no keywords */}
        {onAddManualKeywords && (
          <ManualKeywordEntry
            onAddKeywords={onAddManualKeywords}
            isProcessing={isAnalyzingManualKeywords}
            brandName={brandContextName}
          />
        )}
        
        <EmptyState
          type="no-keywords"
          onPrimaryAction={() => {
            // Scroll to top to show search input
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions & Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Keywords in Bank</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{keywords.length}</div>
            </div>
            <div className="text-3xl">🏦</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-800 dark:text-green-300 font-medium">Selected</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{selectedKeywords.size}</div>
            </div>
            <div className="text-3xl">✓</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Campaigns</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">{campaigns.length}</div>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
      </div>

      {/* Manual Keyword Entry */}
      {onAddManualKeywords && (
        <ManualKeywordEntry
          onAddKeywords={onAddManualKeywords}
          isProcessing={isAnalyzingManualKeywords}
          brandName={brandContextName}
        />
      )}

      {/* Main Keyword Bank */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Keyword Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organize, filter, and assign keywords to campaigns
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

        {/* Filter and Bulk Actions */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Filter keywords..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {selectedKeywords.size > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAssignClick}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                ➕ Assign ({selectedKeywords.size})
              </button>
              <button
                onClick={onUnassignSelected}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                ↩️ Unassign ({selectedKeywords.size})
              </button>
              <button
                onClick={onDeleteSelected}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                🗑️ Delete ({selectedKeywords.size})
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Section */}
        {selectedKeywords.size > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-3">
              ⚡ Bulk Actions ({selectedKeywords.size} selected)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAssignClick}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                ➕ Assign to Campaign
              </button>
              <button
                onClick={onUnassignSelected}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                ↩️ Unassign All
              </button>
              <button
                onClick={onDeleteSelected}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                🗑️ Delete Selected
              </button>
            </div>
          </div>
        )}
        
        {/* Efficiency Tips */}
        {!selectedKeywords.size && keywords.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Keyword Bank Tips</h3>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Select keywords using checkboxes and use bulk actions to manage them efficiently</li>
              <li>• Drag keywords directly onto ad groups in the Campaign Planner view</li>
              <li>• Use the filter to quickly find specific keywords</li>
              <li>• Export to CSV to work with keywords in Excel or other tools</li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredKeywords.length > 0 && (
          <div className="mb-3 flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onToggleSelectAll(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
          </div>
        )}
        {filteredKeywords.map((kw, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-colors ${
              selectedKeywords.has(kw.keyword)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                checked={selectedKeywords.has(kw.keyword)}
                onChange={(e) => onToggleSelect(kw.keyword, e.target.checked)}
                className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white break-words">{kw.keyword}</div>
              </div>
            </div>
            <div className="ml-8 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Type:</span>
                <div className="mt-0.5">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{kw.type}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Volume:</span>
                <div className="text-gray-700 dark:text-gray-300 mt-0.5">{kw.searchVolume}</div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Competition:</span>
                <div className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    kw.competition === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    kw.competition === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {kw.competition}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Relevance:</span>
                <div className="text-gray-700 dark:text-gray-300 mt-0.5">{kw.relevance}/10</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Keyword</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Volume</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Competition</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Relevance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredKeywords.map((kw, index) => (
              <tr
                key={index}
                draggable
                onDragStart={(e) => onDragStart(e, kw.keyword)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move ${
                  selectedKeywords.has(kw.keyword) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(kw.keyword)}
                    onChange={(e) => onToggleSelect(kw.keyword, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{kw.keyword}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{kw.type}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{kw.searchVolume}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    kw.competition === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    kw.competition === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {kw.competition}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{kw.relevance}/10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredKeywords.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {filter ? 'No keywords match your filter' : 'No keywords in bank yet'}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assign Keywords</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                    setSelectedAdGroupId('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select campaign...</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedCampaignId && selectedCampaign && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Group</label>
                  <select
                    value={selectedAdGroupId}
                    onChange={(e) => setSelectedAdGroupId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select ad group...</option>
                    {selectedCampaign.adGroups.map(ag => (
                      <option key={ag.id} value={ag.id}>{ag.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedCampaignId || !selectedAdGroupId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
