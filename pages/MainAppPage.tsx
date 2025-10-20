import React, { useCallback, useEffect, useState } from 'react';
import type { ApiSettings, Campaign } from '../types';
import type { UseBrandManagerResult } from '../src/hooks/useBrandManager';
import type { UseApiSettingsResult } from '../src/hooks/useApiSettings';
import type { UseSOPManagerResult } from '../src/hooks/useSOPManager';
import { AppLayout } from '../components/layout/AppLayout';
import { Breadcrumb } from '../components/Breadcrumb';
import { ViewSwitcher } from '../components/ViewSwitcher';
import { EnhancedViewSwitcher } from '../components/EnhancedViewSwitcher';
import { Settings } from '../components/Settings';
import { SOPLibrary } from '../components/SOPLibrary';
import { BrandTab } from '../components/BrandTab';
import { BrandCreationModal } from '../components/BrandCreationModal';
import { ApiKeyPrompt } from '../components/ApiKeyPrompt';
import { SearchFeedback, SearchSuccessToast } from '../components/SearchFeedback';
import { KeywordWorkspace } from '../components/views/KeywordWorkspace';
import type { ViewType } from '../components/ViewSwitcher';
import {
  fetchKeywords,
  fetchKeywordClusters,
  analyzeKeywordsBatch,
} from '../services/geminiService';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { settingsStorage } from '../utils/hybridStorage';
import type { AdvancedSearchSettings } from '../types';

interface MainAppPageProps {
  brandManager: UseBrandManagerResult;
  apiSettingsManager: UseApiSettingsResult;
  sopManager: UseSOPManagerResult;
}

export const MainAppPage: React.FC<MainAppPageProps> = ({
  brandManager,
  apiSettingsManager,
  sopManager,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        settingsStorage.getDarkMode() ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });
  const [currentView, setCurrentView] = useState<ViewType>('research');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [isAnalyzingManualKeywords, setIsAnalyzingManualKeywords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [hasSeenQuickStart, setHasSeenQuickStart] = useState<boolean>(() =>
    settingsStorage.getQuickStartSeen()
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastSearchKeyword, setLastSearchKeyword] = useState('');
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string[] | null>(null);

  const { brands, activeBrand, activeBrandState, brandStates, lastActiveBrand, updateBrandState } =
    brandManager;
  const { apiSettings, hasApiKey, updateApiSettings, saveApiSettings, resetApiSettings } =
    apiSettingsManager;
  const {
    sops,
    addSOP,
    updateSOP,
    deleteSOP,
    toggleFavorite,
    recordView,
    recordViewAnalytics,
    aiSearch,
    aiRecommend,
  } = sopManager;

  const allBrandKeywords = activeBrandState?.keywordResults || [];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    settingsStorage.setDarkMode(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    settingsStorage.setQuickStartSeen(hasSeenQuickStart);
  }, [hasSeenQuickStart]);

  const handleAdvancedSettingsChange = useCallback(
    (settings: Partial<AdvancedSearchSettings>) => {
      if (!activeBrand) return;
      const currentSettings = activeBrandState?.advancedSearchSettings ?? {
        advancedKeywords: '',
        minVolume: '',
        maxVolume: '',
        isWebAnalysisEnabled: false,
        brandName: '',
        asin: '',
      };
      updateBrandState(activeBrand, {
        advancedSearchSettings: { ...currentSettings, ...settings },
      });
    },
    [activeBrand, activeBrandState?.advancedSearchSettings, updateBrandState]
  );

  const handleSearch = useCallback(
    async (searchOverride?: string) => {
      if (!activeBrand || !activeBrandState) return;

      if (!apiSettings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
        setIsApiKeyPromptOpen(true);
        return;
      }

      const searchSettings = activeBrandState.advancedSearchSettings;
      const seedKeyword = searchOverride ?? searchSettings.advancedKeywords;

      if (!seedKeyword.trim()) {
        setError('Please enter at least one seed keyword.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setRelatedKeywords([]);
      setSelectedKeywords(new Set());
      setLastSearchKeyword(seedKeyword.trim());
      setShowSuccessToast(false);

      try {
        const [newKeywords, related] = await fetchKeywords(
          seedKeyword,
          searchSettings.isWebAnalysisEnabled,
          searchSettings.brandName,
          searchSettings.asin || ''
        );

        const uniqueNewKeywords = new Map(
          activeBrandState.keywordResults.map((kw) => [kw.keyword.toLowerCase(), kw])
        );
        newKeywords.forEach((kw) => {
          if (!uniqueNewKeywords.has(kw.keyword.toLowerCase())) {
            uniqueNewKeywords.set(kw.keyword.toLowerCase(), kw);
          }
        });

        const newSearchedKeywords = new Set(activeBrandState.searchedKeywords);
        seedKeyword
          .split(/, |\n/)
          .map((k) => k.trim())
          .filter(Boolean)
          .forEach((k) => newSearchedKeywords.add(k));

        updateBrandState(activeBrand, {
          keywordResults: Array.from(uniqueNewKeywords.values()),
          searchedKeywords: Array.from(newSearchedKeywords).slice(-10),
          keywordClusters: null,
        });

        setRelatedKeywords(related);
        setCurrentView('bank');
        setSearchResultCount(newKeywords.length);
        setShowSuccessToast(true);

        if (!hasSeenQuickStart) {
          setHasSeenQuickStart(true);
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeBrand, activeBrandState, apiSettings.geminiApiKey, hasSeenQuickStart, updateBrandState]
  );

  const handleCampaignsChange = useCallback(
    (campaigns: Campaign[]) => {
      if (activeBrand) {
        updateBrandState(activeBrand, { campaigns });
      }
    },
    [activeBrand, updateBrandState]
  );

  const handleToggleSelect = useCallback((keyword: string, isSelected: boolean) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(keyword);
      } else {
        next.delete(keyword);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(
    (isSelected: boolean) => {
      if (isSelected && activeBrandState) {
        setSelectedKeywords(new Set(activeBrandState.keywordResults.map((kw) => kw.keyword)));
      } else {
        setSelectedKeywords(new Set());
      }
    },
    [activeBrandState]
  );

  const handleDeleteSelected = useCallback(() => {
    if (!activeBrand || !activeBrandState) return;

    const lowerCaseToDelete = new Set(Array.from(selectedKeywords).map((k) => k.toLowerCase()));

    const updatedCampaigns = activeBrandState.campaigns.map((c) => ({
      ...c,
      adGroups: c.adGroups.map((ag) => ({
        ...ag,
        keywords: ag.keywords.filter((kw) => !lowerCaseToDelete.has(kw.toLowerCase())),
      })),
    }));

    updateBrandState(activeBrand, {
      keywordResults: activeBrandState.keywordResults.filter(
        (kw) => !lowerCaseToDelete.has(kw.keyword.toLowerCase())
      ),
      campaigns: updatedCampaigns,
    });

    setSelectedKeywords(new Set());
  }, [activeBrand, activeBrandState, selectedKeywords, updateBrandState]);

  const handleUnassignSelected = useCallback(() => {
    if (!activeBrand || !activeBrandState) return;

    const lowerCaseToUnassign = new Set(
      Array.from(selectedKeywords).map((k) => (k as string).toLowerCase())
    );

    const newCampaigns = activeBrandState.campaigns.map((c) => ({
      ...c,
      adGroups: c.adGroups.map((ag) => ({
        ...ag,
        keywords: ag.keywords.filter((kw) => !lowerCaseToUnassign.has(kw.toLowerCase())),
      })),
    }));

    updateBrandState(activeBrand, { campaigns: newCampaigns });
    setSelectedKeywords(new Set());
  }, [activeBrand, activeBrandState, selectedKeywords, updateBrandState]);

  const handleAssignKeywords = useCallback(
    (targetCampaignId: string, targetAdGroupId: string, keywordsToAssign: string[]) => {
      if (!activeBrand || !activeBrandState) return;

      const keywordsToAssignLowerCase = new Set(keywordsToAssign.map((k) => k.toLowerCase()));

      const newCampaigns = activeBrandState.campaigns.map((campaign) => {
        const isTargetCampaign = campaign.id === targetCampaignId;
        const newAdGroups = campaign.adGroups.map((adGroup) => {
          let updatedKeywords = adGroup.keywords.filter(
            (kw) => !keywordsToAssignLowerCase.has(kw.toLowerCase())
          );
          if (isTargetCampaign && adGroup.id === targetAdGroupId) {
            const existingKeywords = new Set(updatedKeywords.map((k) => k.toLowerCase()));
            keywordsToAssign.forEach((kw) => {
              if (!existingKeywords.has(kw.toLowerCase())) {
                updatedKeywords.push(kw);
              }
            });
          }
          return { ...adGroup, keywords: updatedKeywords };
        });
        return { ...campaign, adGroups: newAdGroups };
      });

      updateBrandState(activeBrand, { campaigns: newCampaigns });
      setSelectedKeywords(new Set());
    },
    [activeBrand, activeBrandState, updateBrandState]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, draggedKeyword: string) => {
      let keywordsToDrag: string[];
      if (selectedKeywords.has(draggedKeyword)) {
        keywordsToDrag = Array.from(selectedKeywords);
      } else {
        keywordsToDrag = [draggedKeyword];
        setSelectedKeywords(new Set([draggedKeyword]));
      }
      e.dataTransfer.setData('application/json', JSON.stringify(keywordsToDrag));
      e.dataTransfer.effectAllowed = 'move';
    },
    [selectedKeywords]
  );

  const handleAddManualKeywords = useCallback(
    async (keywords: string[]) => {
      if (!activeBrand || !activeBrandState) return;

      if (!apiSettings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
        setIsApiKeyPromptOpen(true);
        return;
      }

      setIsAnalyzingManualKeywords(true);
      setError(null);

      try {
        const brandName = activeBrandState.advancedSearchSettings.brandName || '';

        const existingKeywordsLower = new Set(
          activeBrandState.keywordResults.map((kw) => kw.keyword.toLowerCase())
        );
        const newKeywords = keywords.filter((kw) => !existingKeywordsLower.has(kw.toLowerCase()));

        if (newKeywords.length === 0) {
          alert('All keywords already exist in your keyword bank.');
          return;
        }

        const result = await analyzeKeywordsBatch(newKeywords, brandName, () => {
          // optional progress updates
        });

        if (result.successful.length > 0) {
          const uniqueKeywords = new Map(
            activeBrandState.keywordResults.map((kw) => [kw.keyword.toLowerCase(), kw])
          );
          result.successful.forEach((kw) => {
            if (!uniqueKeywords.has(kw.keyword.toLowerCase())) {
              uniqueKeywords.set(kw.keyword.toLowerCase(), kw);
            }
          });

          updateBrandState(activeBrand, {
            keywordResults: Array.from(uniqueKeywords.values()),
            keywordClusters: null,
          });

          const successMsg = `✅ Successfully added ${result.successful.length} keyword${
            result.successful.length > 1 ? 's' : ''
          }`;
          const failedMsg =
            result.failed.length > 0
              ? `\n⚠️ ${result.failed.length} keyword${
                  result.failed.length > 1 ? 's' : ''
                } failed to analyze`
              : '';
          alert(successMsg + failedMsg);
        }

        if (result.failed.length > 0 && result.successful.length === 0) {
          throw new Error('Failed to analyze any keywords. Please check your input and try again.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while analyzing keywords.');
      } finally {
        setIsAnalyzingManualKeywords(false);
      }
    },
    [activeBrand, activeBrandState, apiSettings.geminiApiKey, updateBrandState]
  );

  const handleCreateBrand = useCallback(
    async (brandName: string, budget?: number, asins?: string[]) => {
      if (brands.includes(brandName)) {
        alert(`Brand "${brandName}" already exists.`);
        return false;
      }

      const created = await brandManager.createBrand(brandName, { budget, asins });
      if (created) {
        setIsBrandModalOpen(false);
      } else {
        alert('Failed to create brand. Please try again.');
      }
      return created;
    },
    [brandManager, brands]
  );

  const handleSelectBrand = useCallback(
    (brandName: string) => {
      brandManager.selectBrand(brandName);
      setCurrentView('research');
      setSelectedKeywords(new Set());
    },
    [brandManager]
  );

  const handleDeleteBrand = useCallback(
    async (brandName: string) => {
      if (
        window.confirm(
          `Are you sure you want to delete the brand "${brandName}" and all its data? This cannot be undone.`
        )
      ) {
        try {
          await brandManager.deleteBrand(brandName);
        } catch (error) {
          console.error('Error deleting brand:', error);
          alert('Failed to delete brand. Please try again.');
        }
      }
    },
    [brandManager]
  );

  const handleClearBrandKeywords = useCallback(() => {
    if (!activeBrand) return;
    if (
      window.confirm(
        `Are you sure you want to clear all keywords and search history for "${activeBrand}"?`
      )
    ) {
      updateBrandState(activeBrand, {
        keywordResults: [],
        searchedKeywords: [],
        keywordClusters: null,
      });
      setSelectedKeywords(new Set());
    }
  }, [activeBrand, updateBrandState]);

  const handleClusterKeywords = useCallback(async () => {
    if (!activeBrand || !activeBrandState || activeBrandState.keywordResults.length < 2) return;
    setIsClustering(true);
    setError(null);
    try {
      const clusters = await fetchKeywordClusters(activeBrandState.keywordResults);
      updateBrandState(activeBrand, { keywordClusters: clusters });
    } catch (err: any) {
      setError(err.message || 'Failed to cluster keywords.');
    } finally {
      setIsClustering(false);
    }
  }, [activeBrand, activeBrandState, updateBrandState]);

  const handleClusterClick = useCallback((clusterName: string, keywords: string[]) => {
    setActiveClusterFilter(keywords);
    // Switch to bank view to show filtered keywords
    setCurrentView('bank');
  }, []);

  const handleClearClusterFilter = useCallback(() => {
    setActiveClusterFilter(null);
  }, []);

  const handleToggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const handleHistoryItemClick = useCallback(
    (keyword: string) => {
      if (!activeBrand) return;
      const currentSettings = activeBrandState?.advancedSearchSettings ?? {
        advancedKeywords: '',
        minVolume: '',
        maxVolume: '',
        isWebAnalysisEnabled: false,
        brandName: '',
        asin: '',
      };

      handleAdvancedSettingsChange({
        ...currentSettings,
        advancedKeywords: keyword,
        isWebAnalysisEnabled: false,
      });
      void handleSearch(keyword);
    },
    [
      activeBrand,
      activeBrandState?.advancedSearchSettings,
      handleAdvancedSettingsChange,
      handleSearch,
    ]
  );

  const handleApiSettingsChange = (settings: Partial<ApiSettings>) => {
    updateApiSettings(settings);
  };

  const handleSaveApiSettings = () => {
    saveApiSettings();
    setIsApiKeyPromptOpen(false);
  };

  const handleResetApiSettings = () => {
    resetApiSettings();
  };

  const handleGoToSettings = () => {
    setCurrentView('settings');
    setHasSeenQuickStart(true);
  };

  const handleApiKeySave = (apiKey: string) => {
    saveApiSettings({ geminiApiKey: apiKey });
    setIsApiKeyPromptOpen(false);
  };

  const handleAuthChange = useCallback(async () => {
    await brandManager.reloadFromStorage();
  }, [brandManager]);

  useKeyboardShortcuts({
    onViewChange: setCurrentView,
    onCreateBrand: () => setIsBrandModalOpen(true),
    onSearch: () => {
      const searchInput = document.querySelector(
        'input[placeholder*="keyword"]'
      ) as HTMLInputElement;
      if (searchInput) searchInput.focus();
    },
  });

  const shouldShowQuickStart = !hasSeenQuickStart && (!hasApiKey || brands.length === 0);

  return (
    <>
      <AppLayout
        brands={brands}
        activeBrand={activeBrand}
        currentView={currentView}
        isDarkMode={isDarkMode}
        isBusy={isLoading || isClustering}
        recentSearches={activeBrandState?.searchedKeywords.slice(-10) || []}
        onToggleDarkMode={handleToggleDarkMode}
        onSelectBrand={handleSelectBrand}
        onDeleteBrand={handleDeleteBrand}
        onCreateBrandClick={() => setIsBrandModalOpen(true)}
        onViewChange={setCurrentView}
        onHistoryItemClick={handleHistoryItemClick}
        onAuthChange={handleAuthChange}
        enableBottomNavigation={Boolean(activeBrand)}
      >
        {activeBrand && (
          <div className="hidden lg:block">
            <Breadcrumb
              currentView={currentView}
              activeBrand={activeBrand}
              onViewChange={setCurrentView}
              onBrandClick={() => setIsBrandModalOpen(true)}
            />
          </div>
        )}

        {activeBrand && !activeBrandState?.keywordClusters && (
          <div className="mb-6 hidden md:block">
            <div className="hidden lg:block">
              <EnhancedViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </div>
            <div className="lg:hidden">
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </div>
        )}

        {currentView === 'settings' ? (
          <Settings
            apiSettings={apiSettings}
            onApiSettingsChange={handleApiSettingsChange}
            onSaveSettings={handleSaveApiSettings}
            onResetSettings={handleResetApiSettings}
          />
        ) : currentView === 'sop' && activeBrand ? (
          <SOPLibrary
            sops={sops}
            onAddSOP={async (sopData) => {
              await addSOP(activeBrand, sopData);
            }}
            onUpdateSOP={async (id, updates) => {
              await updateSOP(activeBrand, id, updates);
            }}
            onDeleteSOP={async (id) => {
              await deleteSOP(activeBrand, id);
            }}
            onToggleFavorite={async (id) => {
              await toggleFavorite(activeBrand, id);
            }}
            onSOPView={async (id) => {
              await recordView(activeBrand, id);
            }}
            onAISearch={async (query) => {
              return aiSearch(query, sops);
            }}
            onAIRecommend={async () => {
              return aiRecommend(sops, {
                recentSearches: activeBrandState?.searchedKeywords.slice(-5),
                currentView,
                activeBrand,
              });
            }}
            onTrackView={async (id) => {
              await recordViewAnalytics(activeBrand, id);
            }}
          />
        ) : currentView === 'brand' && activeBrand && activeBrandState ? (
          <BrandTab
            brandState={activeBrandState}
            activeBrand={activeBrand}
            onUpdateBrandState={(updates) => updateBrandState(activeBrand, updates)}
          />
        ) : (
          <KeywordWorkspace
            activeBrand={activeBrand}
            activeBrandState={activeBrandState}
            brands={brands}
            brandStates={brandStates}
            lastActiveBrand={lastActiveBrand}
            currentView={currentView}
            isLoading={isLoading}
            isClustering={isClustering}
            error={error}
            relatedKeywords={relatedKeywords}
            allBrandKeywords={allBrandKeywords}
            selectedKeywords={selectedKeywords}
            isAnalyzingManualKeywords={isAnalyzingManualKeywords}
            shouldShowQuickStart={shouldShowQuickStart}
            hasApiKey={hasApiKey}
            activeClusterFilter={activeClusterFilter}
            onCreateBrand={() => setIsBrandModalOpen(true)}
            onGoToSettings={handleGoToSettings}
            onAdvancedSettingsChange={handleAdvancedSettingsChange}
            onSearch={handleSearch}
            onHistoryItemClick={handleHistoryItemClick}
            onCampaignsChange={handleCampaignsChange}
            onAssignKeywords={handleAssignKeywords}
            onDeleteSelected={handleDeleteSelected}
            onUnassignSelected={handleUnassignSelected}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onDragStart={handleDragStart}
            onAddManualKeywords={handleAddManualKeywords}
            onClearBrandKeywords={handleClearBrandKeywords}
            onClusterKeywords={handleClusterKeywords}
            onSelectBrand={handleSelectBrand}
            onCreateBrandFromDashboard={() => setIsBrandModalOpen(true)}
            onClearClusters={() =>
              activeBrand && updateBrandState(activeBrand, { keywordClusters: null })
            }
            onClusterClick={handleClusterClick}
            onClearClusterFilter={handleClearClusterFilter}
          />
        )}
      </AppLayout>

      <BrandCreationModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onCreate={handleCreateBrand}
      />

      <ApiKeyPrompt
        isOpen={isApiKeyPromptOpen}
        onClose={() => setIsApiKeyPromptOpen(false)}
        onSave={handleApiKeySave}
      />

      <SearchFeedback
        isSearching={isLoading}
        searchKeyword={lastSearchKeyword}
        onCancel={() => setIsLoading(false)}
      />

      {showSuccessToast && (
        <SearchSuccessToast
          keyword={lastSearchKeyword}
          resultCount={searchResultCount}
          onDismiss={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
};
