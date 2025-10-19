import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KeywordInput } from './components/KeywordInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { fetchKeywords, fetchKeywordClusters, reinitializeGeminiService, analyzeKeywordsBatch } from './services/geminiService';
import { reinitializeSupabaseClient } from './services/supabaseClient';
import { BrandState, KeywordData, AdvancedSearchSettings, Campaign, ApiSettings, SOP } from './types';
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
import { BrandTab } from './components/BrandTab';
import { QuickStartGuide } from './components/QuickStartGuide';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { SearchFeedback, SearchSuccessToast } from './components/SearchFeedback';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { EnhancedViewSwitcher } from './components/EnhancedViewSwitcher';
import { Breadcrumb } from './components/Breadcrumb';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage';
import { brandStorage, brandStateStorage, settingsStorage } from './utils/hybridStorage';
import { SOPLibrary } from './components/SOPLibrary';
import { 
  getSOPsForBrand, 
  addSOP, 
  updateSOP, 
  deleteSOP, 
  toggleSOPFavorite, 
  incrementSOPViewCount,
  trackSOPView 
} from './utils/sopStorage';
import { aiSearchSOPs, getAIRecommendedSOPs } from './services/sopService';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return settingsStorage.getDarkMode() || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [brands, setBrands] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [brandStates, setBrandStates] = useState<Record<string, BrandState>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isClustering, setIsClustering] = useState(false);
  const [isAnalyzingManualKeywords, setIsAnalyzingManualKeywords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  
  const [currentView, setCurrentView] = useState<ViewType>('research');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);
  const [hasSeenQuickStart, setHasSeenQuickStart] = useState<boolean>(() => 
    settingsStorage.getQuickStartSeen()
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastSearchKeyword, setLastSearchKeyword] = useState('');
  const [searchResultCount, setSearchResultCount] = useState(0);

  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  
  // SOP update trigger to force re-renders
  const [sopUpdateTrigger, setSopUpdateTrigger] = useState(0);

  // API Settings state
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => ({
    geminiApiKey: loadFromLocalStorage<string>('ppcGeniusApiSettings.geminiApiKey', ''),
    supabaseUrl: loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseUrl', ''),
    supabaseAnonKey: loadFromLocalStorage<string>('ppcGeniusApiSettings.supabaseAnonKey', ''),
  }));
  
  // Load from hybrid storage on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedBrands, loadedActiveBrand, loadedBrandStates] = await Promise.all([
          brandStorage.list(),
          brandStorage.getActive(),
          brandStateStorage.getAll(),
        ]);
        
        setBrands(loadedBrands);
        setActiveBrand(loadedActiveBrand);
        setBrandStates(loadedBrandStates);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fall back to localStorage directly if hybrid storage fails
        setBrands(loadFromLocalStorage<string[]>('ppcGeniusBrands', []));
        setActiveBrand(loadFromLocalStorage<string | null>('ppcGeniusActiveBrand', null));
        setBrandStates(loadFromLocalStorage<Record<string, BrandState>>('ppcGeniusBrandStates', {}));
      }
    };
    loadData();
  }, []);

  // Save to hybrid storage whenever state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        // Save brands
        saveToLocalStorage('ppcGeniusBrands', brands);
        
        // Save active brand
        await brandStorage.setActive(activeBrand);
        
        // Save brand states
        saveToLocalStorage('ppcGeniusBrandStates', brandStates);
        
        // Save settings
        settingsStorage.setDarkMode(isDarkMode);
        settingsStorage.setQuickStartSeen(hasSeenQuickStart);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [brands, activeBrand, brandStates, isDarkMode, hasSeenQuickStart]);
  
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
    setBrandStates(prev => {
      const newState = {
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
      };
      
      // Sync to hybrid storage asynchronously
      brandStateStorage.update(brandName, newState[brandName]).catch(error => {
        console.error('Error syncing brand state to storage:', error);
      });
      
      return newState;
    });
  }, []);
  
  const handleSearch = useCallback(async (searchOverride?: string) => {
    if (!activeBrand || !activeBrandState) return;
    
    // Check if API key is configured
    if (!apiSettings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      setIsApiKeyPromptOpen(true);
      return;
    }
    
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
    setLastSearchKeyword(seedKeyword.trim());
    setShowSuccessToast(false);

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
      
      // Show success toast
      setSearchResultCount(newKeywords.length);
      setShowSuccessToast(true);
      
      // Dismiss Quick Start Guide after first successful search
      if (!hasSeenQuickStart) {
        setHasSeenQuickStart(true);
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand, activeBrandState, updateBrandState, apiSettings.geminiApiKey, hasSeenQuickStart]);

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

  // --- Manual Keyword Entry ---
  const handleAddManualKeywords = useCallback(async (keywords: string[]) => {
    if (!activeBrand || !activeBrandState) return;
    
    // Check if API key is configured
    if (!apiSettings.geminiApiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      setIsApiKeyPromptOpen(true);
      return;
    }

    setIsAnalyzingManualKeywords(true);
    setError(null);

    try {
      const brandName = activeBrandState.advancedSearchSettings.brandName || '';
      
      // Filter out keywords that already exist
      const existingKeywordsLower = new Set(
        activeBrandState.keywordResults.map(kw => kw.keyword.toLowerCase())
      );
      const newKeywords = keywords.filter(
        kw => !existingKeywordsLower.has(kw.toLowerCase())
      );

      if (newKeywords.length === 0) {
        alert('All keywords already exist in your keyword bank.');
        return;
      }

      // Analyze keywords in batch with progress tracking
      const result = await analyzeKeywordsBatch(newKeywords, brandName, (completed, total) => {
        // Could update a progress state here if we want to show progress
        console.log(`Analyzing keywords: ${completed}/${total}`);
      });

      if (result.successful.length > 0) {
        // Merge new keywords with existing ones
        const uniqueKeywords = new Map(
          activeBrandState.keywordResults.map(kw => [kw.keyword.toLowerCase(), kw])
        );
        result.successful.forEach(kw => {
          if (!uniqueKeywords.has(kw.keyword.toLowerCase())) {
            uniqueKeywords.set(kw.keyword.toLowerCase(), kw);
          }
        });

        updateBrandState(activeBrand, {
          keywordResults: Array.from(uniqueKeywords.values()),
          keywordClusters: null, // Reset clusters when adding new keywords
        });

        // Show success message
        const successMsg = `✅ Successfully added ${result.successful.length} keyword${result.successful.length > 1 ? 's' : ''}`;
        const failedMsg = result.failed.length > 0 
          ? `\n⚠️ ${result.failed.length} keyword${result.failed.length > 1 ? 's' : ''} failed to analyze` 
          : '';
        alert(successMsg + failedMsg);
      }

      if (result.failed.length > 0 && result.successful.length === 0) {
        throw new Error(`Failed to analyze any keywords. Please check your input and try again.`);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing keywords.');
    } finally {
      setIsAnalyzingManualKeywords(false);
    }
  }, [activeBrand, activeBrandState, updateBrandState, apiSettings.geminiApiKey]);

  // --- Brand Management ---
  const handleCreateBrand = async (brandName: string): Promise<boolean> => {
    if (brands.includes(brandName)) {
      alert(`Brand "${brandName}" already exists.`);
      return false;
    }
    
    try {
      // Create brand via hybrid storage
      await brandStorage.create(brandName);
      
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
    } catch (error) {
      console.error('Error creating brand:', error);
      alert('Failed to create brand. Please try again.');
      return false;
    }
  };
  
  const handleSelectBrand = (brandName: string) => {
    setActiveBrand(brandName);
    setCurrentView('research');
    setIsSidebarOpen(false);
    setSelectedKeywords(new Set()); // Clear selection when changing brands
  };
  
  const handleDeleteBrand = async (brandName: string) => {
    if (window.confirm(`Are you sure you want to delete the brand "${brandName}" and all its data? This cannot be undone.`)) {
      try {
        // Delete brand via hybrid storage
        await brandStorage.delete(brandName);
        
        const newBrands = brands.filter(b => b !== brandName);
        setBrands(newBrands);
        const newBrandStates = { ...brandStates };
        delete newBrandStates[brandName];
        setBrandStates(newBrandStates);
        if (activeBrand === brandName) {
          setActiveBrand(newBrands[0] || null);
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand. Please try again.');
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
    
    // Close API key prompt if it was open
    setIsApiKeyPromptOpen(false);
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
  const hasApiKey = !!(apiSettings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY);
  const shouldShowQuickStart = !hasSeenQuickStart && (!hasApiKey || brands.length === 0);

  const handleDismissQuickStart = () => {
    setHasSeenQuickStart(true);
  };

  const handleGoToSettings = () => {
    setCurrentView('settings');
    handleDismissQuickStart();
  };

  const handleApiKeySave = (apiKey: string) => {
    handleApiSettingsChange({ geminiApiKey: apiKey });
    handleSaveApiSettings();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onViewChange: setCurrentView,
    onCreateBrand: () => setIsBrandModalOpen(true),
    onSearch: () => {
      // Focus search input if available
      const searchInput = document.querySelector('input[placeholder*="keyword"]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    },
  });

  return (
    <div className={`flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300`}>
      {/* Mobile Sidebar */}
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
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        brands={brands}
        activeBrand={activeBrand}
        onSelectBrand={handleSelectBrand}
        onCreateBrandClick={() => setIsBrandModalOpen(true)}
        recentSearches={activeBrandState?.searchedKeywords.slice(-10) || []}
        onHistoryItemClick={handleHistoryItemClick}
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
        />
        <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 pb-20 md:pb-6">
          {/* Breadcrumb Navigation - Desktop only */}
          {activeBrand && (
            <div className="hidden lg:block">
              <Breadcrumb
                currentView={currentView}
                activeBrand={activeBrand}
                onViewChange={setCurrentView}
                onBrandClick={() => setIsSidebarOpen(true)}
              />
            </div>
          )}

          {/* Enhanced ViewSwitcher for Desktop - Hidden on mobile */}
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
              key={sopUpdateTrigger}
              sops={getSOPsForBrand(activeBrand)}
              onAddSOP={(sopData) => {
                addSOP(activeBrand, sopData);
                // Force re-render by incrementing trigger
                setSopUpdateTrigger(prev => prev + 1);
              }}
              onUpdateSOP={(id, updates) => {
                updateSOP(activeBrand, id, updates);
                setSopUpdateTrigger(prev => prev + 1);
              }}
              onDeleteSOP={(id) => {
                deleteSOP(activeBrand, id);
                setSopUpdateTrigger(prev => prev + 1);
              }}
              onToggleFavorite={(id) => {
                toggleSOPFavorite(activeBrand, id);
                setSopUpdateTrigger(prev => prev + 1);
              }}
              onSOPView={(id) => {
                incrementSOPViewCount(activeBrand, id);
                trackSOPView(activeBrand, id);
              }}
              onAISearch={async (query) => {
                const sops = getSOPsForBrand(activeBrand);
                return await aiSearchSOPs(query, sops);
              }}
              onAIRecommend={async () => {
                const sops = getSOPsForBrand(activeBrand);
                return await getAIRecommendedSOPs(sops, {
                  recentSearches: activeBrandState?.searchedKeywords.slice(-5),
                  currentView,
                  activeBrand,
                });
              }}
            />
          ) : currentView === 'brand' && activeBrand && activeBrandState ? (
            <BrandTab
              brandState={activeBrandState}
              activeBrand={activeBrand}
              onUpdateBrandState={(updates) => updateBrandState(activeBrand, updates)}
            />
          ) : (
            <>
              {/* Quick Start Guide for new users */}
              {shouldShowQuickStart && !isLoading && (
                <QuickStartGuide
                  onCreateBrand={() => setIsBrandModalOpen(true)}
                  onGoToSettings={handleGoToSettings}
                  hasApiKey={hasApiKey}
                  hasBrand={brands.length > 0}
                />
              )}

              {!isLoading && allBrandKeywords.length === 0 && (
                <div className="mb-8">
                  <WelcomeMessage
                    activeBrand={activeBrand}
                    onCreateBrandClick={() => setIsBrandModalOpen(true)}
                    hasKeywords={allBrandKeywords.length > 0}
                    currentView={currentView}
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

              {/* Show views even when no keywords to display empty states */}
              {!isLoading && allBrandKeywords.length === 0 && activeBrand && currentView === 'bank' && (
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
                  onAddManualKeywords={handleAddManualKeywords}
                  isAnalyzingManualKeywords={isAnalyzingManualKeywords}
                  brandContextName={activeBrandState?.advancedSearchSettings.brandName || ''}
                />
              )}

              {!isLoading && allBrandKeywords.length === 0 && activeBrand && currentView === 'planner' && (
                <CampaignManager
                  campaigns={activeBrandState?.campaigns || []}
                  onCampaignsChange={handleCampaignsChange}
                  onAssignKeywords={handleAssignKeywords}
                  allKeywords={allBrandKeywords}
                  activeBrandName={activeBrand}
                />
              )}

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
                        onAddManualKeywords={handleAddManualKeywords}
                        isAnalyzingManualKeywords={isAnalyzingManualKeywords}
                        brandContextName={activeBrandState?.advancedSearchSettings.brandName || ''}
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
                            onAddManualKeywords={handleAddManualKeywords}
                            isAnalyzingManualKeywords={isAnalyzingManualKeywords}
                            brandContextName={activeBrandState?.advancedSearchSettings.brandName || ''}
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
      <ApiKeyPrompt 
        isOpen={isApiKeyPromptOpen} 
        onClose={() => setIsApiKeyPromptOpen(false)}
        onSave={handleApiKeySave}
      />
      
      {/* Search Feedback Modal */}
      <SearchFeedback
        isSearching={isLoading}
        searchKeyword={lastSearchKeyword}
        onCancel={() => setIsLoading(false)}
      />
      
      {/* Success Toast */}
      {showSuccessToast && (
        <SearchSuccessToast
          keyword={lastSearchKeyword}
          resultCount={searchResultCount}
          onDismiss={() => setShowSuccessToast(false)}
        />
      )}
      
      {/* Bottom Navigation for Mobile */}
      {activeBrand && (
        <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
      )}
    </div>
  );
};

export default App;