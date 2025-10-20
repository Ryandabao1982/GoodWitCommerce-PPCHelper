import React, { useState } from 'react';
import { BrandState, KPIMetrics, RAGBadge, BrandTabSettings } from '../../types';
import { BrandTabHeader } from './BrandTabHeader';
import { BrandTabLeftRail } from './BrandTabLeftRail';
import { BrandTabOverview } from './BrandTabOverview';
import { BrandTabKeywords } from './BrandTabKeywords';
import { BrandTabCampaigns } from './BrandTabCampaigns';
import { BrandTabSettings as BrandTabSettingsModal } from './BrandTabSettings';

export type BrandTabView = 'overview' | 'keywords' | 'campaigns';

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

  // Initialize default data if not present
  const portfolios = brandState.portfolios || [];

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
    drivers: ['No data available yet'],
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
        {/* Left Rail - Hidden on mobile */}
        <div className="hidden md:block">
          <BrandTabLeftRail
            portfolios={portfolios}
            selectedPortfolio={selectedPortfolio}
            onPortfolioClick={handlePortfolioClick}
          />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Portfolio Selector */}
          <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Portfolio Filter
            </label>
            <select
              value={selectedPortfolio || ''}
              onChange={(e) => handlePortfolioClick(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Portfolios</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name} (${portfolio.budget.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="flex gap-1 md:gap-2 px-2 md:px-6 pt-2 md:pt-4">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'keywords', label: 'Keywords', icon: '🔑' },
                { id: 'campaigns', label: 'Campaigns', icon: '📊' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as BrandTabView)}
                  className={`flex-1 md:flex-none px-2 md:px-4 py-2.5 md:py-2 font-medium rounded-t-lg transition-colors text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1 md:mr-2">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3 md:p-6">
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
    </div>
  );
};