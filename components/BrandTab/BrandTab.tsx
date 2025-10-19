import React, { useState } from 'react';
import { BrandState, KPIMetrics, RAGBadge, BrandTabSettings, ASIN, ASINToCampaignMap } from '../../types';
import { BrandTabHeader } from './BrandTabHeader';
import { BrandTabLeftRail } from './BrandTabLeftRail';
import { BrandTabOverview } from './BrandTabOverview';
import { BrandTabKeywords } from './BrandTabKeywords';
import { BrandTabCampaigns } from './BrandTabCampaigns';
import { BrandTabSettings as BrandTabSettingsModal } from './BrandTabSettings';
import { ASINManager } from '../ASINManager';
import { ASINDetailView } from '../ASINDetailView';
import { fetchKeywords } from '../../services/geminiService';

export type BrandTabView = 'overview' | 'keywords' | 'campaigns' | 'asins';

interface BrandTabProps {
  brandState: BrandState;
  activeBrand: string;
  onUpdateBrandState: (updates: Partial<BrandState>) => void;
}

export const BrandTab: React.FC<BrandTabProps> = ({ brandState, activeBrand, onUpdateBrandState }) => {
  const [activeTab, setActiveTab] = useState<BrandTabView>('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState<string>('US');
  const [dateRange, setDateRange] = useState<string>('Last 30 days');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedASINId, setSelectedASINId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize default data if not present
  const portfolios = brandState.portfolios || [
    { id: 'launch', name: 'Launch', budget: 1000, campaigns: [] },
    { id: 'optimize', name: 'Optimize', budget: 2000, campaigns: [] },
    { id: 'scale', name: 'Scale', budget: 5000, campaigns: [] },
    { id: 'maintain', name: 'Maintain', budget: 3000, campaigns: [] },
  ];

  const kpiMetrics: KPIMetrics = brandState.kpiMetrics || {
    spend: 0,
    sales: 0,
    acos: 0,
    roas: 0,
    ctr: 0,
    cvr: 0,
    tacos: 0,
  };

  const ragBadge: RAGBadge = brandState.ragBadge || {
    status: 'Green',
    drivers: ['All metrics within target range'],
  };

  const settings: BrandTabSettings = brandState.brandTabSettings || {
    clicksToPromote: 20,
    clicksToNegate: 15,
    ctrPauseThreshold: 0.2,
    cvrFactorMedian: 0.8,
    wastedSpendRedThreshold: 500,
    isCompetitiveCategory: false,
  };

  const handlePortfolioClick = (portfolioId: string) => {
    setSelectedPortfolio(selectedPortfolio === portfolioId ? null : portfolioId);
  };

  const handleSettingsUpdate = (newSettings: BrandTabSettings) => {
    onUpdateBrandState({ brandTabSettings: newSettings });
    setShowSettings(false);
  };

  // ASIN Management handlers
  const asins = brandState.asins || [];
  const asinToCampaignMaps = brandState.asinToCampaignMaps || [];

  const handleAddASIN = (asin: ASIN) => {
    onUpdateBrandState({ asins: [...asins, asin] });
  };

  const handleDeleteASIN = (asinId: string) => {
    onUpdateBrandState({
      asins: asins.filter(a => a.id !== asinId),
      asinToCampaignMaps: asinToCampaignMaps.filter(m => m.asinId !== asinId),
    });
  };

  const handleUpdateASIN = (asinId: string, updates: Partial<ASIN>) => {
    onUpdateBrandState({
      asins: asins.map(a => a.id === asinId ? { ...a, ...updates } : a),
    });
  };

  const handleLinkASINToCampaign = (asinId: string, campaignId: string) => {
    const existingMap = asinToCampaignMaps.find(m => m.asinId === asinId);
    if (existingMap) {
      onUpdateBrandState({
        asinToCampaignMaps: asinToCampaignMaps.map(m =>
          m.asinId === asinId
            ? { ...m, campaignIds: [...m.campaignIds, campaignId] }
            : m
        ),
      });
    } else {
      onUpdateBrandState({
        asinToCampaignMaps: [...asinToCampaignMaps, { asinId, campaignIds: [campaignId] }],
      });
    }
  };

  const handleUnlinkASINFromCampaign = (asinId: string, campaignId: string) => {
    onUpdateBrandState({
      asinToCampaignMaps: asinToCampaignMaps.map(m =>
        m.asinId === asinId
          ? { ...m, campaignIds: m.campaignIds.filter(id => id !== campaignId) }
          : m
      ).filter(m => m.campaignIds.length > 0),
    });
  };

  const handleViewASINDetail = (asinId: string) => {
    setSelectedASINId(asinId);
  };

  const handleSearchForASIN = async (asin: ASIN) => {
    const searchSettings = asin.advancedSearchSettings;
    if (!searchSettings?.advancedKeywords.trim()) {
      alert('Please enter at least one seed keyword.');
      return;
    }

    setIsSearching(true);
    try {
      const [newKeywords, related] = await fetchKeywords(
        searchSettings.advancedKeywords,
        searchSettings.isWebAnalysisEnabled || false,
        searchSettings.brandName || asin.title
      );

      const existingKeywords = asin.keywordResults || [];
      const uniqueNewKeywords = new Map(existingKeywords.map(kw => [kw.keyword.toLowerCase(), kw]));
      newKeywords.forEach(kw => {
        if (!uniqueNewKeywords.has(kw.keyword.toLowerCase())) {
          uniqueNewKeywords.set(kw.keyword.toLowerCase(), kw);
        }
      });

      const newSearchedKeywords = new Set(asin.searchedKeywords || []);
      searchSettings.advancedKeywords.split(/, |\n/).map(k => k.trim()).filter(Boolean).forEach(k => newSearchedKeywords.add(k));

      handleUpdateASIN(asin.id, {
        keywordResults: Array.from(uniqueNewKeywords.values()),
        searchedKeywords: Array.from(newSearchedKeywords).slice(-10),
      });
    } catch (err: any) {
      alert(err.message || 'An error occurred during keyword search.');
    } finally {
      setIsSearching(false);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'a':
          // Add shell campaign
          console.log('Add shell campaign');
          break;
        case 'p':
          // Promote keyword
          console.log('Promote keyword');
          break;
        case 'n':
          // Negate keyword
          console.log('Negate keyword');
          break;
        case 'g':
          // Go to gaps
          setActiveTab('overview');
          break;
        case '/':
          e.preventDefault();
          // Focus search
          document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <BrandTabHeader
        activeBrand={activeBrand}
        marketplace={marketplace}
        dateRange={dateRange}
        kpiMetrics={kpiMetrics}
        ragBadge={ragBadge}
        onMarketplaceChange={setMarketplace}
        onDateRangeChange={setDateRange}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Rail */}
        <BrandTabLeftRail
          portfolios={portfolios}
          selectedPortfolio={selectedPortfolio}
          onPortfolioClick={handlePortfolioClick}
        />

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="flex gap-2 px-6 pt-4">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'keywords', label: 'Keywords', icon: '🔑' },
                { id: 'campaigns', label: 'Campaigns', icon: '📊' },
                { id: 'asins', label: 'ASINs', icon: '📦' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as BrandTabView)}
                  className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <BrandTabOverview
                brandState={brandState}
                selectedPortfolio={selectedPortfolio}
              />
            )}
            {activeTab === 'keywords' && (
              <BrandTabKeywords
                brandState={brandState}
                settings={settings}
              />
            )}
            {activeTab === 'campaigns' && (
              <BrandTabCampaigns
                brandState={brandState}
                portfolios={portfolios}
              />
            )}
            {activeTab === 'asins' && (
              <ASINManager
                asins={asins}
                campaigns={brandState.campaigns}
                asinToCampaignMaps={asinToCampaignMaps}
                onAddASIN={handleAddASIN}
                onDeleteASIN={handleDeleteASIN}
                onUpdateASIN={handleUpdateASIN}
                onLinkASINToCampaign={handleLinkASINToCampaign}
                onUnlinkASINFromCampaign={handleUnlinkASINFromCampaign}
                onViewASINDetail={handleViewASINDetail}
              />
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <BrandTabSettingsModal
          settings={settings}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ASIN Detail View Modal */}
      {selectedASINId && (
        <ASINDetailView
          asin={asins.find(a => a.id === selectedASINId)!}
          onUpdateASIN={(updates) => handleUpdateASIN(selectedASINId, updates)}
          onClose={() => setSelectedASINId(null)}
          onSearch={handleSearchForASIN}
          isSearching={isSearching}
        />
      )}
    </div>
  );
};