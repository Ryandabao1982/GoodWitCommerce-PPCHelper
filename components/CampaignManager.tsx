import React, { useState } from 'react';
import { Campaign, AdGroup, KeywordData } from '../types';

interface CampaignManagerProps {
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  allKeywords: KeywordData[];
  activeBrandName: string;
}

const CAMPAIGN_TEMPLATES = [
  { name: 'SP - Auto Targeting', description: 'Sponsored Products with automatic targeting' },
  { name: 'SP - Manual Broad', description: 'Sponsored Products with broad match keywords' },
  { name: 'SP - Manual Phrase', description: 'Sponsored Products with phrase match keywords' },
  { name: 'SP - Manual Exact', description: 'Sponsored Products with exact match keywords' },
  { name: 'SP - Branded Defense', description: 'Protect your brand terms' },
  { name: 'SB - Video Awareness', description: 'Sponsored Brands video campaigns' },
  { name: 'SB - Headline Search', description: 'Sponsored Brands headline ads' },
  { name: 'SD - Remarketing', description: 'Sponsored Display remarketing' },
  { name: 'SD - Audience Targeting', description: 'Sponsored Display audience campaigns' },
];

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  onCampaignsChange,
  onAssignKeywords,
  allKeywords,
  activeBrandName,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: newCampaignName.trim(),
      adGroups: [
        {
          id: `adgroup-${Date.now()}`,
          name: 'Ad Group 1',
          keywords: [],
        },
      ],
    };

    onCampaignsChange([...campaigns, newCampaign]);
    setNewCampaignName('');
    setSelectedTemplate('');
    setShowCreateModal(false);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      onCampaignsChange(campaigns.filter(c => c.id !== campaignId));
    }
  };

  const handleAddAdGroup = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newAdGroup: AdGroup = {
      id: `adgroup-${Date.now()}`,
      name: `Ad Group ${campaign.adGroups.length + 1}`,
      keywords: [],
    };

    const updatedCampaigns = campaigns.map(c =>
      c.id === campaignId
        ? { ...c, adGroups: [...c.adGroups, newAdGroup] }
        : c
    );

    onCampaignsChange(updatedCampaigns);
  };

  const handleDeleteAdGroup = (campaignId: string, adGroupId: string) => {
    if (window.confirm('Are you sure you want to delete this ad group?')) {
      const updatedCampaigns = campaigns.map(c =>
        c.id === campaignId
          ? { ...c, adGroups: c.adGroups.filter(ag => ag.id !== adGroupId) }
          : c
      );
      onCampaignsChange(updatedCampaigns);
    }
  };

  const handleDrop = (e: React.DragEvent, campaignId: string, adGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const keywordsData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (Array.isArray(keywordsData) && keywordsData.length > 0) {
        onAssignKeywords(campaignId, adGroupId, keywordsData);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const toggleCampaign = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const handleExportCampaign = () => {
    const csvContent = [
      ['Campaign Name', 'Ad Group Name', 'Keyword Text', 'Match Type', 'Status', 'Bid'].join(','),
      ...campaigns.flatMap(campaign =>
        campaign.adGroups.flatMap(adGroup =>
          adGroup.keywords.map(keyword =>
            [campaign.name, adGroup.name, keyword, 'Broad', 'Enabled', ''].join(',')
          )
        )
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBrandName}_campaign_plan.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Manager</h2>
        <div className="flex gap-2">
          {campaigns.length > 0 && (
            <button
              onClick={handleExportCampaign}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              📥 Export Plan
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ➕ New Campaign
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-4">No campaigns yet. Create your first campaign to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center">
                <button
                  onClick={() => toggleCampaign(campaign.id)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedCampaigns.has(campaign.id) ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-white">{campaign.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({campaign.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0)} keywords)
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddAdGroup(campaign.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Add ad group"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete campaign"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {expandedCampaigns.has(campaign.id) && (
                <div className="p-4 space-y-3">
                  {campaign.adGroups.map(adGroup => (
                    <div
                      key={adGroup.id}
                      onDrop={(e) => handleDrop(e, campaign.id, adGroup.id)}
                      onDragOver={handleDragOver}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {adGroup.name} ({adGroup.keywords.length})
                        </span>
                        <button
                          onClick={() => handleDeleteAdGroup(campaign.id, adGroup.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete ad group"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {adGroup.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {adGroup.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Drag keywords here or use the assign button
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template (optional)</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    if (e.target.value) {
                      setNewCampaignName(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Custom campaign...</option>
                  {CAMPAIGN_TEMPLATES.map((template, idx) => (
                    <option key={idx} value={template.name}>{template.name} - {template.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Enter campaign name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
