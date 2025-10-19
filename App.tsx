import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KeywordInput } from './components/KeywordInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { fetchKeywords, fetchKeywordClusters, reinitializeGeminiService } from './services/geminiService';
import { reinitializeSupabaseClient } from './services/supabaseClient';
import { BrandState, KeywordData, AdvancedSearchSettings, Campaign, ApiSettings } from './types';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { RelatedKeywords } from './components/RelatedKeywords';
import { SessionManager } from './components/SessionManager';
import { KeywordClusters } from './components/KeywordClusters';
import { Dashboard } from './components/Dashboard';
import { Footer } from './components/Footer';
import { BrandCreationModal } from './components/BrandCreationModal';
import { ViewSwitcher } from './components/ViewSwitcher';
import type { ViewType } from './components/ViewSwitcher';
import { CampaignManager } from './components/CampaignManager';
import { parseSearchVolume } from './utils/sorting';
import { KeywordBank } from './components/KeywordBank';
import { WelcomeMessage } from './components/WelcomeMessage';
import { Settings } from './components/Settings';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage';
import type { BreadcrumbItem } from './components/Breadcrumb';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = loadFromLocalStorage<boolean | null>('ppcGeniusDarkMode', null);
      if (savedDarkMode !== null) return savedDarkMode;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [brands, setBrands] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [brandStates, setBrandStates] = useState<Record<string, BrandState>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  
  const [currentView, setCurrentView] = useState<ViewType>('research');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  // API Settings state
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => ({
    geminiApiKey: loadFromLocalStorage<string>('ppcGeniusApiSettings.geminiApiKey', ''),
    supabaseUrl: loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseUrl', ''),
    supabaseAnonKey: loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseAnonKey', ''),
  }));
  
  // Load from localStorage on initial render
  useEffect(() => {
    setBrands(loadFromLocalStorage<string[]>('ppcGeniusBrands', []));
    setActiveBrand(loadFromLocalStorage<string | null>('ppcGeniusActiveBrand', null));
    setBrandStates(loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {}));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage('ppcGeniusBrands', brands);
    saveToLocalStorage('ppcGeniusActiveBrand', activeBrand);
    saveToLocalStorage('ppcGeniusBrandStates', brandStates);
    saveToLocalStorage('ppcGeniusDarkMode', isDarkMode);
  }, [brands, activeBrand, brandStates, isDarkMode]);
  
  // Handle dark mode class on html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to top button visibility
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const activeBrandState = useMemo(() => {
    if (!activeBrand || !brandStates[activeBrand]) {
      return null;
    }
    return brandStates[activeBrand];
  }, [activeBrand, brandStates]);

  const updateBrandState = useCallback((brandName: string, updates: Partial<BrandState>) => {
    setBrandStates(prev => ({
      ...prev,
      [brandName]: {
        ...(prev[brandName] || { // Provide a default structure if it doesn't exist
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: { advancedKeywords: '', minVolume: '', maxVolume: '', isWebAnalysisEnabled: false, brandName: '' },
          keywordClusters: null,
          campaigns: []
        }),
        ...updates,
      }
    }));
  }, []);
  
  const handleSearch = useCallback(async (searchOverride?: string) => {
    if (!activeBrand || !activeBrandState) return;
    
    const searchSettings = activeBrandState.advancedSearchSettings;
    const seedKeyword = searchOverride ?? (searchSettings.advancedKeywords);

    if (!seedKeyword.trim()) {
        setError("Please enter at least one seed keyword.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setRelatedKeywords([]);
    setSelectedKeywords(new Set()); // Clear selection on new search

    try {
      const [newKeywords, related] = await fetchKeywords(
        seedKeyword,
        searchSettings.isWebAnalysisEnabled,
        searchSettings.brandName
      );
      
      const uniqueNewKeywords = new Map(activeBrandState.keywordResults.map(kw => [kw.keyword.toLowerCase(), kw]));
      newKeywords.forEach(kw => {
        if (!uniqueNewKeywords.has(kw.keyword.toLowerCase())) {
          uniqueNewKeywords.set(kw.keyword.toLowerCase(), kw);
        }
      });
      
      const newSearchedKeywords = new Set(activeBrandState.searchedKeywords);
      seedKeyword.split(/, |\n/).map(k => k.trim()).filter(Boolean).forEach(k => newSearchedKeywords.add(k));

      updateBrandState(activeBrand, {
        keywordResults: Array.from(uniqueNewKeywords.values()),
        searchedKeywords: Array.from(newSearchedKeywords).slice(-10), // Keep history manageable
        keywordClusters: null, // Reset clusters on new search
      });
      setRelatedKeywords(related);
      setCurrentView('bank'); // UX Improvement: Default to keyword bank after search

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand, activeBrandState, updateBrandState]);

  const handleAdvancedSettingsChange = (settings: Partial<AdvancedSearchSettings>) => {
    if (!activeBrand) return;
    const currentSettings = brandStates[activeBrand]?.advancedSearchSettings ?? {
        advancedKeywords: '', minVolume: '', maxVolume: '', isWebAnalysisEnabled: false, brandName: ''
    };
    updateBrandState(activeBrand, { 
      advancedSearchSettings: { ...currentSettings, ...settings }
    });
  };

  const handleCampaignsChange = (campaigns: Campaign[]) => {
    if (activeBrand) {
      updateBrandState(activeBrand, { campaigns });
    }
  };

  // --- Keyword Selection & Actions ---
  const handleToggleSelect = useCallback((keyword: string, isSelected: boolean) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(keyword);
      } else {
        newSet.delete(keyword);
      }
      return newSet;
    });
  }, []);

  const handleToggleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected && activeBrandState) {
      setSelectedKeywords(new Set(activeBrandState.keywordResults.map(kw => kw.keyword)));
    } else {
      setSelectedKeywords(new Set());
    }
  }, [activeBrandState]);
  
  const handleDeleteSelected = () => {
    if (!activeBrand || !activeBrandState) return;

    const keywordsToDelete = Array.from(selectedKeywords);
    const lowerCaseToDelete = new Set(keywordsToDelete.map(k => k.toLowerCase()));
    const newStateUpdate: Partial<BrandState> = {};

    // Filter keywords from results bank
    newStateUpdate.keywordResults = activeBrandState.keywordResults.filter(kw => !lowerCaseToDelete.has(kw.keyword.toLowerCase()));

    // Filter keywords from any campaign assignments
    newStateUpdate.campaigns = activeBrandState.campaigns.map(c => ({
        ...c,
        adGroups: c.adGroups.map(ag => ({
            ...ag,
            keywords: ag.keywords.filter(kw => !lowerCaseToDelete.has(kw.toLowerCase()))
        }))
    }));
    
    updateBrandState(activeBrand, newStateUpdate);
    setSelectedKeywords(new Set());
};

  const handleUnassignSelected = () => {
    if (!activeBrand || !activeBrandState) return;
      const lowerCaseToUnassign = new Set(Array.from(selectedKeywords).map(k => (k as string).toLowerCase()));
      const newCampaigns = activeBrandState.campaigns.map(c => ({
        ...c,
        adGroups: c.adGroups.map(ag => ({
          ...ag,
          keywords: ag.keywords.filter(kw => !lowerCaseToUnassign.has((kw as string).toLowerCase()))
        }))
      }));
      updateBrandState(activeBrand, { campaigns: newCampaigns });
      setSelectedKeywords(new Set());
  };

  const handleAssignKeywords = (targetCampaignId: string, targetAdGroupId: string, keywordsToAssign: string[]) => {
    if (!activeBrand || !activeBrandState) return;
    
    const keywordsToAssignLowerCase = new Set(keywordsToAssign.map((k: string) => k.toLowerCase()));

    const newCampaigns = activeBrandState.campaigns.map(campaign => {
        const isTargetCampaign = campaign.id === targetCampaignId;
        const newAdGroups = campaign.adGroups.map(adGroup => {
            let updatedKeywords = adGroup.keywords.filter(kw => !keywordsToAssignLowerCase.has(kw.toLowerCase()));
            if (isTargetCampaign && adGroup.id === targetAdGroupId) {
                const existingKeywords = new Set(updatedKeywords.map((k: string) => k.toLowerCase()));
                keywordsToAssign.forEach((kw: string) => {
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
  };

  const handleDragStart = (e: React.DragEvent, draggedKeyword: string) => {
      let keywordsToDrag: string[];
      // If the dragged keyword is part of the current selection, drag all selected keywords.
      // Otherwise, clear selection and drag only the single keyword.
      if (selectedKeywords.has(draggedKeyword)) {
          keywordsToDrag = Array.from(selectedKeywords);
      } else {
          keywordsToDrag = [draggedKeyword];
          setSelectedKeywords(new Set([draggedKeyword])); // Auto-select the dragged keyword
      }
      e.dataTransfer.setData('application/json', JSON.stringify(keywordsToDrag));
      e.dataTransfer.effectAllowed = 'move';
  };


  // --- Brand Management ---
  const handleCreateBrand = (brandName: string): boolean => {
    if (brands.includes(brandName)) {
      alert(`Brand "${brandName}" already exists.`);
      return false;
    }
    const newBrands = [...brands, brandName];
    setBrands(newBrands);
    setBrandStates(prev => ({
      ...prev,
      [brandName]: {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: { advancedKeywords: '', minVolume: '', maxVolume: '', isWebAnalysisEnabled: false, brandName: '' },
        keywordClusters: null,
        campaigns: []
      }
    }));
    setActiveBrand(brandName);
    setIsBrandModalOpen(false);
    return true;
  };
  
  const handleSelectBrand = (brandName: string) => {
    setActiveBrand(brandName);
    setCurrentView('research');
    setIsSidebarOpen(false);
    setSelectedKeywords(new Set()); // Clear selection when changing brands
  };
  
  const handleDeleteBrand = (brandName: string) => {
    if (window.confirm(`Are you sure you want to delete the brand "${brandName}" and all its data? This cannot be undone.`)) {
      const newBrands = brands.filter(b => b !== brandName);
      setBrands(newBrands);
      const newBrandStates = { ...brandStates };
      delete newBrandStates[brandName];
      setBrandStates(newBrandStates);
      if (activeBrand === brandName) {
        setActiveBrand(newBrands[0] || null);
      }
    }
  };
  
  // Keyword management for active brand
  const handleClearBrandKeywords = () => {
    if (!activeBrand) return;
    if (window.confirm(`Are you sure you want to clear all keywords and search history for "${activeBrand}"?`)) {
      updateBrandState(activeBrand, {
        keywordResults: [],
        searchedKeywords: [],
        keywordClusters: null,
      });
      setSelectedKeywords(new Set());
    }
  };
  
  const handleClusterKeywords = async () => {
    if (!activeBrand || !activeBrandState || activeBrandState.keywordResults.length < 2) return;
    setIsClustering(true);
    setError(null);
    try {
      const clusters = await fetchKeywordClusters(activeBrandState.keywordResults);
      updateBrandState(activeBrand, { keywordClusters: clusters });
    } catch(err: any) {
      setError(err.message || 'Failed to cluster keywords.');
    } finally {
      setIsClustering(false);
    }
  };

  const handleToggleDarkMode = () => setIsDarkMode(prev => !prev);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleHistoryItemClick = (keyword: string) => {
    if (!activeBrand) return;
    const currentSettings = activeBrandState?.advancedSearchSettings ?? { advancedKeywords: '', minVolume: '', maxVolume: '', isWebAnalysisEnabled: false, brandName: '' };
    handleAdvancedSettingsChange({ ...currentSettings, advancedKeywords: keyword, isWebAnalysisEnabled: false });
    handleSearch(keyword);
    setIsSidebarOpen(false);
  };

  // API Settings handlers
  const handleApiSettingsChange = (settings: Partial<ApiSettings>) => {
    setApiSettings(prev => ({ ...prev, ...settings }));
  };

  const handleSaveApiSettings = () => {
    saveToLocalStorage('ppcGeniusApiSettings.geminiApiKey', apiSettings.geminiApiKey);
    saveToLocalStorage('ppcGeniusApiSettings.supabaseUrl', apiSettings.supabaseUrl);
    saveToLocalStorage('ppcGeniusApiSettings.supabaseAnonKey', apiSettings.supabaseAnonKey);
    // Reinitialize services with new settings
    reinitializeGeminiService();
    reinitializeSupabaseClient();
  };

  const handleResetApiSettings = () => {
    const defaultSettings: ApiSettings = {
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };
    setApiSettings(defaultSettings);
    saveToLocalStorage('ppcGeniusApiSettings.geminiApiKey', defaultSettings.geminiApiKey);
    saveToLocalStorage('ppcGeniusApiSettings.supabaseUrl', defaultSettings.supabaseUrl);
    saveToLocalStorage('ppcGeniusApiSettings.supabaseAnonKey', defaultSettings.supabaseAnonKey);
    // Reinitialize services with default settings
    reinitializeGeminiService();
    reinitializeSupabaseClient();
  };
  
  const allBrandKeywords = activeBrandState?.keywordResults || [];

  // Generate breadcrumb items based on current navigation state
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    
    // Home/Root level
    items.push({
      label: 'Home',
      onClick: () => {
        setCurrentView('research');
        if (brands.length === 0) {
          setIsBrandModalOpen(true);
        }
      },
      isActive: !activeBrand && brands.length === 0,
    });

    // Brand level
    if (activeBrand) {
      items.push({
        label: activeBrand,
        onClick: brands.length > 1 ? () => setCurrentView('research') : undefined,
        isActive: false,
      });

      // View level
      const viewLabels: Record<ViewType, string> = {
        research: 'Dashboard',
        bank: 'Keyword Bank',
        planner: 'Campaign Planner',
        settings: 'Settings',
      };

      items.push({
        label: viewLabels[currentView],
        isActive: true,
      });
    }

    return items;
  }, [activeBrand, brands.length, currentView]);

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        recentSearches={activeBrandState?.searchedKeywords.slice(-10) || []}
        onHistoryItemClick={handleHistoryItemClick}
        brands={brands}
        onSelectBrand={handleSelectBrand}
        onDeleteBrand={handleDeleteBrand}
        onCreateBrandClick={() => setIsBrandModalOpen(true)}
        isLoading={isLoading || isClustering}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          brands={brands}
          activeBrand={activeBrand}
          onSelectBrand={handleSelectBrand}
          onOpenCreateBrandModal={() => setIsBrandModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          breadcrumbItems={breadcrumbItems}
        />
        <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1">
          {/* Show ViewSwitcher when brand is active and not in clusters view */}
          {activeBrand && !activeBrandState?.keywordClusters && (
            <div className="mb-6">
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </div>
          )}

          {currentView === 'settings' ? (
            <Settings
              apiSettings={apiSettings}
              onApiSettingsChange={handleApiSettingsChange}
              onSaveSettings={handleSaveApiSettings}
              onResetSettings={handleResetApiSettings}
            />
          ) : (
            <>
              {!isLoading && allBrandKeywords.length === 0 && (
                <div className="mb-8">
                  <WelcomeMessage
                    activeBrand={activeBrand}
                    onCreateBrandClick={() => setIsBrandModalOpen(true)}
                  />
                </div>
              )}

              <KeywordInput
                seedKeyword={activeBrandState?.advancedSearchSettings.advancedKeywords || ''}
                setSeedKeyword={(value) => handleAdvancedSettingsChange({ advancedKeywords: value })}
                onSearch={handleSearch}
                isLoading={isLoading}
                isBrandActive={!!activeBrand}
                isAdvancedSearchOpen={activeBrandState?.advancedSearchSettings.isWebAnalysisEnabled ?? false}
                onToggleAdvancedSearch={() => handleAdvancedSettingsChange({ isWebAnalysisEnabled: !(activeBrandState?.advancedSearchSettings.isWebAnalysisEnabled ?? false) })}
                advancedKeywords={activeBrandState?.advancedSearchSettings.advancedKeywords || ''}
                setAdvancedKeywords={(value) => handleAdvancedSettingsChange({ advancedKeywords: value })}
                minVolume={activeBrandState?.advancedSearchSettings.minVolume || ''}
                setMinVolume={(value) => handleAdvancedSettingsChange({ minVolume: value })}
                maxVolume={activeBrandState?.advancedSearchSettings.maxVolume || ''}
                setMaxVolume={(value) => handleAdvancedSettingsChange({ maxVolume: value })}
                isWebAnalysisEnabled={activeBrandState?.advancedSearchSettings.isWebAnalysisEnabled ?? false}
                setIsWebAnalysisEnabled={(value) => handleAdvancedSettingsChange({ isWebAnalysisEnabled: value })}
                brandName={activeBrandState?.advancedSearchSettings.brandName || ''}
                setBrandName={(value) => handleAdvancedSettingsChange({ brandName: value })}
              />
              
              {error && <div className="mt-6"><ErrorMessage message={error} /></div>}

              {isLoading && <div className="mt-6"><LoadingSpinner /></div>}

              {!isLoading && allBrandKeywords.length > 0 && (
            <>
              {relatedKeywords.length > 0 && (
                <RelatedKeywords keywords={relatedKeywords} onKeywordSelect={handleHistoryItemClick} />
              )}
              
              <SessionManager
                searchedKeywords={activeBrandState?.searchedKeywords || []}
                onClearBrandKeywords={handleClearBrandKeywords}
                onClusterKeywords={handleClusterKeywords}
                isClustering={isClustering}
                keywordCount={allBrandKeywords.length}
              />
              
              {activeBrandState?.keywordClusters ? (
                <KeywordClusters clusters={activeBrandState.keywordClusters} onClear={() => activeBrand && updateBrandState(activeBrand, { keywordClusters: null })} />
              ) : (
                <>
                  {currentView === 'research' && (
                     <Dashboard
                        data={allBrandKeywords}
                        parseVolume={parseSearchVolume}
                      />
                  )}
                  
                  {currentView === 'bank' && activeBrand && (
                     <KeywordBank
                        keywords={allBrandKeywords}
                        searchedKeywords={activeBrandState?.searchedKeywords || []}
                        campaigns={activeBrandState?.campaigns || []}
                        onCampaignsChange={handleCampaignsChange}
                        onAssignKeywords={handleAssignKeywords}
                        onDeleteSelected={handleDeleteSelected}
                        onUnassignSelected={handleUnassignSelected}
                        activeBrandName={activeBrand}
                        selectedKeywords={selectedKeywords}
                        onToggleSelect={handleToggleSelect}
                        onToggleSelectAll={handleToggleSelectAll}
                        onDragStart={handleDragStart}
                      />
                  )}

                  {currentView === 'planner' && activeBrand && (
                      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 order-2 lg:order-1">
                           <CampaignManager
                              campaigns={activeBrandState?.campaigns || []}
                              onCampaignsChange={handleCampaignsChange}
                              onAssignKeywords={handleAssignKeywords}
                              allKeywords={allBrandKeywords}
                              activeBrandName={activeBrand}
                            />
                        </div>
                        <div className="lg:col-span-2 order-1 lg:order-2">
                          <KeywordBank
                            keywords={allBrandKeywords}
                            searchedKeywords={activeBrandState?.searchedKeywords || []}
                            campaigns={activeBrandState?.campaigns || []}
                            onCampaignsChange={handleCampaignsChange}
                            onAssignKeywords={handleAssignKeywords}
                            onDeleteSelected={handleDeleteSelected}
                            onUnassignSelected={handleUnassignSelected}
                            activeBrandName={activeBrand}
                            selectedKeywords={selectedKeywords}
                            onToggleSelect={handleToggleSelect}
                            onToggleSelectAll={handleToggleSelectAll}
                            onDragStart={handleDragStart}
                          />
                        </div>
                      </div>
                  )}
                </>
              )}
            </>
          )}
        </>
          )}
        </main>
        <Footer />
      </div>
      <ScrollToTopButton isVisible={isScrollButtonVisible} onClick={scrollToTop} />
      <BrandCreationModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} onCreate={handleCreateBrand} />
    </div>
  );
};

export default App;