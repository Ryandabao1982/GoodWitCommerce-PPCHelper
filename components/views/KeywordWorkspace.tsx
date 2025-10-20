import React from 'react';
import type { AdvancedSearchSettings, BrandState, Campaign, KeywordData } from '../../types';
import type { ViewType } from '../ViewSwitcher';
import { KeywordInput } from '../KeywordInput';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingSpinner } from '../LoadingSpinner';
import { QuickStartGuide } from '../QuickStartGuide';
import { WelcomeMessage } from '../WelcomeMessage';
import { RelatedKeywords } from '../RelatedKeywords';
import { SessionManager } from '../SessionManager';
import { KeywordClusters } from '../KeywordClusters';
import { Dashboard } from '../Dashboard';
import { KeywordBank } from '../KeywordBank';
import { CampaignManager } from '../CampaignManager';
import { parseSearchVolume } from '../../utils/sorting';

interface KeywordWorkspaceProps {
  activeBrand: string | null;
  activeBrandState: BrandState | null;
  brands: string[];
  brandStates: Record<string, BrandState>;
  lastActiveBrand: string | null;
  currentView: ViewType;
  isLoading: boolean;
  isClustering: boolean;
  error: string | null;
  relatedKeywords: string[];
  allBrandKeywords: KeywordData[];
  selectedKeywords: Set<string>;
  isAnalyzingManualKeywords: boolean;
  shouldShowQuickStart: boolean;
  hasApiKey: boolean;
  onCreateBrand: () => void;
  onGoToSettings: () => void;
  onAdvancedSettingsChange: (settings: Partial<AdvancedSearchSettings>) => void;
  onSearch: (keyword?: string) => void;
  onHistoryItemClick: (keyword: string) => void;
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  onDeleteSelected: () => void;
  onUnassignSelected: () => void;
  onToggleSelect: (keyword: string, isSelected: boolean) => void;
  onToggleSelectAll: (isSelected: boolean) => void;
  onDragStart: (event: React.DragEvent, keyword: string) => void;
  onAddManualKeywords: (keywords: string[]) => void;
  onClearBrandKeywords: () => void;
  onClusterKeywords: () => void;
  onSelectBrand: (brand: string) => void;
  onCreateBrandFromDashboard: () => void;
  onClearClusters: () => void;
}

export const KeywordWorkspace: React.FC<KeywordWorkspaceProps> = ({
  activeBrand,
  activeBrandState,
  brands,
  brandStates,
  lastActiveBrand,
  currentView,
  isLoading,
  isClustering,
  error,
  relatedKeywords,
  allBrandKeywords,
  selectedKeywords,
  isAnalyzingManualKeywords,
  shouldShowQuickStart,
  hasApiKey,
  onCreateBrand,
  onGoToSettings,
  onAdvancedSettingsChange,
  onSearch,
  onCampaignsChange,
  onAssignKeywords,
  onDeleteSelected,
  onUnassignSelected,
  onToggleSelect,
  onToggleSelectAll,
  onDragStart,
  onAddManualKeywords,
  onClearBrandKeywords,
  onClusterKeywords,
  onSelectBrand,
  onCreateBrandFromDashboard,
  onClearClusters,
  onHistoryItemClick,
}) => {
  const searchedKeywords = activeBrandState?.searchedKeywords || [];
  const campaigns = activeBrandState?.campaigns || [];
  const advancedSettings = activeBrandState?.advancedSearchSettings;

  return (
    <>
      {shouldShowQuickStart && !isLoading && (
        <QuickStartGuide
          onCreateBrand={onCreateBrand}
          onGoToSettings={onGoToSettings}
          hasApiKey={hasApiKey}
          hasBrand={brands.length > 0}
        />
      )}

      {!isLoading && allBrandKeywords.length === 0 && (
        <div className="mb-8">
          <WelcomeMessage
            activeBrand={activeBrand}
            onCreateBrandClick={onCreateBrand}
            hasKeywords={allBrandKeywords.length > 0}
            currentView={currentView}
          />
        </div>
      )}

      <KeywordInput
        seedKeyword={advancedSettings?.advancedKeywords || ''}
        setSeedKeyword={value => onAdvancedSettingsChange({ advancedKeywords: value })}
        onSearch={onSearch}
        isLoading={isLoading}
        isBrandActive={!!activeBrand}
        isAdvancedSearchOpen={advancedSettings?.isWebAnalysisEnabled ?? false}
        onToggleAdvancedSearch={() =>
          onAdvancedSettingsChange({
            isWebAnalysisEnabled: !(advancedSettings?.isWebAnalysisEnabled ?? false),
          })
        }
        advancedKeywords={advancedSettings?.advancedKeywords || ''}
        setAdvancedKeywords={value => onAdvancedSettingsChange({ advancedKeywords: value })}
        minVolume={advancedSettings?.minVolume || ''}
        setMinVolume={value => onAdvancedSettingsChange({ minVolume: value })}
        maxVolume={advancedSettings?.maxVolume || ''}
        setMaxVolume={value => onAdvancedSettingsChange({ maxVolume: value })}
        isWebAnalysisEnabled={advancedSettings?.isWebAnalysisEnabled ?? false}
        setIsWebAnalysisEnabled={value => onAdvancedSettingsChange({ isWebAnalysisEnabled: value })}
        brandName={advancedSettings?.brandName || ''}
        setBrandName={value => onAdvancedSettingsChange({ brandName: value })}
        asin={advancedSettings?.asin || ''}
        setAsin={value => onAdvancedSettingsChange({ asin: value })}
      />

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {isLoading && (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && allBrandKeywords.length === 0 && activeBrand && currentView === 'bank' && (
        <KeywordBank
          keywords={allBrandKeywords}
          searchedKeywords={searchedKeywords}
          campaigns={campaigns}
          onCampaignsChange={onCampaignsChange}
          onAssignKeywords={onAssignKeywords}
          onDeleteSelected={onDeleteSelected}
          onUnassignSelected={onUnassignSelected}
          activeBrandName={activeBrand}
          selectedKeywords={selectedKeywords}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
          onDragStart={onDragStart}
          onAddManualKeywords={onAddManualKeywords}
          isAnalyzingManualKeywords={isAnalyzingManualKeywords}
          brandContextName={advancedSettings?.brandName || ''}
        />
      )}

      {!isLoading && allBrandKeywords.length === 0 && activeBrand && currentView === 'planner' && (
        <CampaignManager
          campaigns={campaigns}
          onCampaignsChange={onCampaignsChange}
          onAssignKeywords={onAssignKeywords}
          allKeywords={allBrandKeywords}
          activeBrandName={activeBrand}
        />
      )}

      {!isLoading && allBrandKeywords.length > 0 && (
        <>
          {relatedKeywords.length > 0 && (
            <RelatedKeywords keywords={relatedKeywords} onKeywordSelect={onHistoryItemClick} />
          )}

          <SessionManager
            searchedKeywords={searchedKeywords}
            onClearBrandKeywords={onClearBrandKeywords}
            onClusterKeywords={onClusterKeywords}
            isClustering={isClustering}
            keywordCount={allBrandKeywords.length}
          />

          {activeBrandState?.keywordClusters ? (
            <KeywordClusters
              clusters={activeBrandState.keywordClusters}
              onClear={onClearClusters}
            />
          ) : (
            <>
              {currentView === 'research' && (
                <Dashboard
                  data={allBrandKeywords}
                  parseVolume={parseSearchVolume}
                  brands={brands}
                  activeBrand={activeBrand}
                  brandStates={brandStates}
                  onSelectBrand={onSelectBrand}
                  onCreateBrand={onCreateBrandFromDashboard}
                  recentSearches={searchedKeywords}
                  lastActiveBrand={lastActiveBrand}
                />
              )}

              {currentView === 'bank' && activeBrand && (
                <KeywordBank
                  keywords={allBrandKeywords}
                  searchedKeywords={searchedKeywords}
                  campaigns={campaigns}
                  onCampaignsChange={onCampaignsChange}
                  onAssignKeywords={onAssignKeywords}
                  onDeleteSelected={onDeleteSelected}
                  onUnassignSelected={onUnassignSelected}
                  activeBrandName={activeBrand}
                  selectedKeywords={selectedKeywords}
                  onToggleSelect={onToggleSelect}
                  onToggleSelectAll={onToggleSelectAll}
                  onDragStart={onDragStart}
                  onAddManualKeywords={onAddManualKeywords}
                  isAnalyzingManualKeywords={isAnalyzingManualKeywords}
                  brandContextName={advancedSettings?.brandName || ''}
                />
              )}

              {currentView === 'planner' && activeBrand && (
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 order-2 lg:order-1">
                    <CampaignManager
                      campaigns={campaigns}
                      onCampaignsChange={onCampaignsChange}
                      onAssignKeywords={onAssignKeywords}
                      allKeywords={allBrandKeywords}
                      activeBrandName={activeBrand}
                    />
                  </div>
                  <div className="lg:col-span-2 order-1 lg:order-2">
                    <KeywordBank
                      keywords={allBrandKeywords}
                      searchedKeywords={searchedKeywords}
                      campaigns={campaigns}
                      onCampaignsChange={onCampaignsChange}
                      onAssignKeywords={onAssignKeywords}
                      onDeleteSelected={onDeleteSelected}
                      onUnassignSelected={onUnassignSelected}
                      activeBrandName={activeBrand}
                      selectedKeywords={selectedKeywords}
                      onToggleSelect={onToggleSelect}
                      onToggleSelectAll={onToggleSelectAll}
                      onDragStart={onDragStart}
                      onAddManualKeywords={onAddManualKeywords}
                      isAnalyzingManualKeywords={isAnalyzingManualKeywords}
                      brandContextName={advancedSettings?.brandName || ''}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
