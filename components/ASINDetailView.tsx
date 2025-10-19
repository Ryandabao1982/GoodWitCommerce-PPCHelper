import React, { useState } from 'react';
import { ASIN, KeywordData, Campaign } from '../types';
import { KeywordBank } from './KeywordBank';
import { CampaignManager } from './CampaignManager';
import { KeywordInput } from './KeywordInput';
import { InfoTooltip } from './Tooltip';

interface ASINDetailViewProps {
  asin: ASIN;
  onUpdateASIN: (updates: Partial<ASIN>) => void;
  onClose: () => void;
  onSearch: (asin: ASIN) => Promise<void>;
  isSearching: boolean;
}

type TabView = 'keywords' | 'campaigns';

export const ASINDetailView: React.FC<ASINDetailViewProps> = ({
  asin,
  onUpdateASIN,
  onClose,
  onSearch,
  isSearching,
}) => {
  const [activeTab, setActiveTab] = useState<TabView>('keywords');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  const keywords = asin.keywordResults || [];
  const campaigns = asin.campaigns || [];
  const searchedKeywords = asin.searchedKeywords || [];
  const advancedSearchSettings = asin.advancedSearchSettings || {
    advancedKeywords: '',
    minVolume: '',
    maxVolume: '',
    isWebAnalysisEnabled: false,
    brandName: asin.title,
  };

  const handleAdvancedSettingsChange = (updates: any) => {
    onUpdateASIN({
      advancedSearchSettings: { ...advancedSearchSettings, ...updates },
    });
  };

  const handleSearch = async () => {
    await onSearch(asin);
  };

  const handleCampaignsChange = (newCampaigns: Campaign[]) => {
    onUpdateASIN({ campaigns: newCampaigns });
  };

  const handleAssignKeywords = (campaignId: string, adGroupId: string, keywordsToAssign: string[]) => {
    const keywordsToAssignLowerCase = new Set(keywordsToAssign.map(k => k.toLowerCase()));

    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id !== campaignId) {
        // Leave other campaigns unchanged
        return campaign;
      }
      // Only process the target campaign
      const newAdGroups = campaign.adGroups.map(adGroup => {
        if (adGroup.id === adGroupId) {
          // For the target ad group, add keywords if not already present
          const existingKeywords = new Set(adGroup.keywords.map((k: string) => k.toLowerCase()));
          const updatedKeywords = [...adGroup.keywords];
          keywordsToAssign.forEach((kw: string) => {
            if (!existingKeywords.has(kw.toLowerCase())) {
              updatedKeywords.push(kw);
            }
          });
          return { ...adGroup, keywords: updatedKeywords };
        } else {
          // For other ad groups in the target campaign, remove the keywords to assign
          const updatedKeywords = adGroup.keywords.filter(kw => !keywordsToAssignLowerCase.has(kw.toLowerCase()));
          return { ...adGroup, keywords: updatedKeywords };
        }
      });
      return { ...campaign, adGroups: newAdGroups };
    });

    onUpdateASIN({ campaigns: newCampaigns });
    setSelectedKeywords(new Set());
  };

  const handleDeleteSelected = () => {
    const keywordsToDelete = Array.from(selectedKeywords);
    const lowerCaseToDelete = new Set(keywordsToDelete.map(k => k.toLowerCase()));

    const newKeywords = keywords.filter(kw => !lowerCaseToDelete.has(kw.keyword.toLowerCase()));
    const newCampaigns = campaigns.map(c => ({
      ...c,
      adGroups: c.adGroups.map(ag => ({
        ...ag,
        keywords: ag.keywords.filter(kw => !lowerCaseToDelete.has(kw.toLowerCase()))
      }))
    }));

    onUpdateASIN({
      keywordResults: newKeywords,
      campaigns: newCampaigns,
    });
    setSelectedKeywords(new Set());
  };

  const handleUnassignSelected = () => {
    const lowerCaseToUnassign = new Set(Array.from(selectedKeywords).map(k => k.toLowerCase()));
    const newCampaigns = campaigns.map(c => ({
      ...c,
      adGroups: c.adGroups.map(ag => ({
        ...ag,
        keywords: ag.keywords.filter(kw => !lowerCaseToUnassign.has(kw.toLowerCase()))
      }))
    }));
    onUpdateASIN({ campaigns: newCampaigns });
    setSelectedKeywords(new Set());
  };

  const handleToggleSelect = (keyword: string, isSelected: boolean) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(keyword);
      } else {
        newSet.delete(keyword);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedKeywords(new Set(keywords.map(kw => kw.keyword)));
    } else {
      setSelectedKeywords(new Set());
    }
  };

  const handleDragStart = (e: React.DragEvent, draggedKeyword: string) => {
    let keywordsToDrag: string[];
    if (selectedKeywords.has(draggedKeyword)) {
      keywordsToDrag = Array.from(selectedKeywords);
    } else {
      keywordsToDrag = [draggedKeyword];
      setSelectedKeywords(new Set([draggedKeyword]));
    }
    e.dataTransfer.setData('application/json', JSON.stringify(keywordsToDrag));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {asin.title}
                </h2>
                <InfoTooltip content="Manage keywords and campaigns specifically for this ASIN" />
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-mono">ASIN: {asin.asin}</span>
                {asin.sku && <span>SKU: {asin.sku}</span>}
                {asin.price && <span>Price: ${asin.price.toFixed(2)}</span>}
              </div>
              <div className="flex gap-4 mt-3">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  🔑 {keywords.length} keywords
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  📊 {campaigns.length} campaigns
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'keywords'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              🔑 Keywords
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              📊 Campaigns
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <KeywordInput
                seedKeyword={advancedSearchSettings.advancedKeywords}
                setSeedKeyword={(value) => handleAdvancedSettingsChange({ advancedKeywords: value })}
                onSearch={handleSearch}
                isLoading={isSearching}
                isBrandActive={true}
                isAdvancedSearchOpen={advancedSearchSettings.isWebAnalysisEnabled}
                onToggleAdvancedSearch={() => handleAdvancedSettingsChange({ isWebAnalysisEnabled: !advancedSearchSettings.isWebAnalysisEnabled })}
                advancedKeywords={advancedSearchSettings.advancedKeywords}
                setAdvancedKeywords={(value) => handleAdvancedSettingsChange({ advancedKeywords: value })}
                minVolume={advancedSearchSettings.minVolume}
                setMinVolume={(value) => handleAdvancedSettingsChange({ minVolume: value })}
                maxVolume={advancedSearchSettings.maxVolume}
                setMaxVolume={(value) => handleAdvancedSettingsChange({ maxVolume: value })}
                isWebAnalysisEnabled={advancedSearchSettings.isWebAnalysisEnabled}
                setIsWebAnalysisEnabled={(value) => handleAdvancedSettingsChange({ isWebAnalysisEnabled: value })}
                brandName={advancedSearchSettings.brandName}
                setBrandName={(value) => handleAdvancedSettingsChange({ brandName: value })}
              />

              <KeywordBank
                keywords={keywords}
                searchedKeywords={searchedKeywords}
                campaigns={campaigns}
                onCampaignsChange={handleCampaignsChange}
                onAssignKeywords={handleAssignKeywords}
                onDeleteSelected={handleDeleteSelected}
                onUnassignSelected={handleUnassignSelected}
                activeBrandName={asin.title}
                selectedKeywords={selectedKeywords}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onDragStart={handleDragStart}
              />
            </div>
          )}

          {activeTab === 'campaigns' && (
            <CampaignManager
              campaigns={campaigns}
              onCampaignsChange={handleCampaignsChange}
              onAssignKeywords={handleAssignKeywords}
              allKeywords={keywords}
              activeBrandName={asin.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};
