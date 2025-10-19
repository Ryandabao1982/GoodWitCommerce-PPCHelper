import React, { useState } from 'react';
import { ASIN, Campaign, ASINToCampaignMap, KeywordData } from '../types';
import { Tooltip, InfoTooltip } from './Tooltip';
import { EmptyStateCard } from './EmptyState';

interface ASINManagerProps {
  asins: ASIN[];
  campaigns: Campaign[];
  asinToCampaignMaps: ASINToCampaignMap[];
  onAddASIN: (asin: ASIN) => void;
  onDeleteASIN: (asinId: string) => void;
  onUpdateASIN: (asinId: string, updates: Partial<ASIN>) => void;
  onLinkASINToCampaign: (asinId: string, campaignId: string) => void;
  onUnlinkASINFromCampaign: (asinId: string, campaignId: string) => void;
  onViewASINDetail?: (asinId: string) => void;
}

export const ASINManager: React.FC<ASINManagerProps> = ({
  asins,
  campaigns,
  asinToCampaignMaps,
  onAddASIN,
  onDeleteASIN,
  onUpdateASIN,
  onLinkASINToCampaign,
  onUnlinkASINFromCampaign,
  onViewASINDetail,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newASIN, setNewASIN] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSKU, setNewSKU] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [expandedASINId, setExpandedASINId] = useState<string | null>(null);

  const handleAddASIN = () => {
    if (!newASIN.trim() || !newTitle.trim()) {
      alert('ASIN and Title are required');
      return;
    }

    const asin: ASIN = {
      id: `asin-${Date.now()}`,
      asin: newASIN.trim(),
      title: newTitle.trim(),
      sku: newSKU.trim() || undefined,
      price: newPrice ? parseFloat(newPrice) : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      keywordResults: [],
      searchedKeywords: [],
      campaigns: [],
      advancedSearchSettings: {
        advancedKeywords: '',
        minVolume: '',
        maxVolume: '',
        isWebAnalysisEnabled: false,
        brandName: newTitle.trim(),
      },
    };

    onAddASIN(asin);
    setNewASIN('');
    setNewTitle('');
    setNewSKU('');
    setNewPrice('');
    setShowAddModal(false);
  };

  const getLinkedCampaigns = (asinId: string): string[] => {
    const map = asinToCampaignMaps.find(m => m.asinId === asinId);
    return map?.campaignIds || [];
  };

  const handleToggleCampaignLink = (asinId: string, campaignId: string) => {
    const linkedCampaigns = getLinkedCampaigns(asinId);
    if (linkedCampaigns.includes(campaignId)) {
      onUnlinkASINFromCampaign(asinId, campaignId);
    } else {
      onLinkASINToCampaign(asinId, campaignId);
    }
  };

  if (asins.length === 0 && !showAddModal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ASIN Management</h3>
            <InfoTooltip content="Add your product ASINs to link them with campaigns and track performance" />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Add ASIN
          </button>
        </div>
        <EmptyStateCard
          icon="📦"
          title="No ASINs Added"
          description="Start by adding your product ASINs to organize them with your campaigns and track performance metrics."
          actionText="Add Your First ASIN"
          onAction={() => setShowAddModal(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ASIN Management</h3>
          <InfoTooltip content="Manage your product ASINs and link them to campaigns for better organization" />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          + Add ASIN
        </button>
      </div>

      {/* ASIN List */}
      <div className="space-y-3">
        {asins.map((asin) => {
          const linkedCampaigns = getLinkedCampaigns(asin.id);
          const isExpanded = expandedASINId === asin.id;

          return (
            <div
              key={asin.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* ASIN Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {asin.title}
                    </h4>
                    {!asin.isActive && (
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-mono">ASIN: {asin.asin}</span>
                    {asin.sku && <span>SKU: {asin.sku}</span>}
                    {asin.price && <span>Price: ${asin.price.toFixed(2)}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">
                      🔑 {asin.keywordResults?.length || 0} keywords
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      📊 {asin.campaigns?.length || 0} campaigns
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      🔗 {linkedCampaigns.length} linked
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {onViewASINDetail && (
                    <Tooltip content="Manage Keywords & Campaigns">
                      <button
                        onClick={() => onViewASINDetail(asin.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        📝
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Link/Unlink Campaigns">
                    <button
                      onClick={() => setExpandedASINId(isExpanded ? null : asin.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        🔗
                      </span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Toggle Active Status">
                    <button
                      onClick={() => onUpdateASIN(asin.id, { isActive: !asin.isActive })}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {asin.isActive ? '✓' : '○'}
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete ASIN">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ASIN ${asin.asin}?`)) {
                          onDeleteASIN(asin.id);
                        }
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      🗑️
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Campaign Links */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Link to Campaigns
                    </h5>
                    <InfoTooltip content="Select which campaigns this ASIN should be associated with" />
                  </div>
                  {campaigns.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      No campaigns available. Create a campaign first.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {campaigns.map((campaign) => {
                        const isLinked = linkedCampaigns.includes(campaign.id);
                        return (
                          <label
                            key={campaign.id}
                            className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors ${
                              isLinked
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={() => handleToggleCampaignLink(asin.id, campaign.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {campaign.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add ASIN Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New ASIN
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ASIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newASIN}
                  onChange={(e) => setNewASIN(e.target.value)}
                  placeholder="B08N5WRWNW"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Premium Wireless Headphones"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={newSKU}
                  onChange={(e) => setNewSKU(e.target.value)}
                  placeholder="SKU-12345"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="29.99"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddASIN}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Add ASIN
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewASIN('');
                  setNewTitle('');
                  setNewSKU('');
                  setNewPrice('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
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
