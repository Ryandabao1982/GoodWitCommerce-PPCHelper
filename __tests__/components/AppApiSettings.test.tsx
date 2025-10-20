import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import type { ApiSettings } from '../../types';

const storageMocks = vi.hoisted(() => {
  const baseState = {
    keywordResults: [],
    searchedKeywords: [],
    advancedSearchSettings: {
      advancedKeywords: '',
      minVolume: '',
      maxVolume: '',
      isWebAnalysisEnabled: false,
      brandName: '',
      asin: '',
    },
    keywordClusters: null,
    campaigns: [],
  };

  const cloneState = () => JSON.parse(JSON.stringify(baseState));

  return {
    brandList: vi.fn().mockResolvedValue(['Test Brand']),
    getActiveBrand: vi.fn().mockResolvedValue('Test Brand'),
    getAllBrandStates: vi.fn().mockImplementation(() =>
      Promise.resolve({ 'Test Brand': cloneState() })
    ),
    updateBrandState: vi.fn(),
    setActiveBrand: vi.fn(),
    createBrand: vi.fn(),
    deleteBrand: vi.fn(),
    getDarkMode: vi.fn().mockReturnValue(false),
    setDarkMode: vi.fn(),
    getQuickStartSeen: vi.fn().mockReturnValue(true),
    setQuickStartSeen: vi.fn(),
  };
});

let latestViewChange: ((view: any) => void) | undefined;
let keywordInputProps: any;
let latestSettingsProps:
  | { apiSettings: ApiSettings; onSaveSettings: (settings: ApiSettings) => void }
  | undefined;
let latestApiKeyPromptProps:
  | { isOpen: boolean; onSave: (key: string) => void; onClose: () => void }
  | undefined;

vi.mock('../../utils/hybridStorage', () => ({
  brandStorage: {
    list: storageMocks.brandList,
    getActive: storageMocks.getActiveBrand,
    setActive: storageMocks.setActiveBrand,
    create: storageMocks.createBrand,
    delete: storageMocks.deleteBrand,
  },
  brandStateStorage: {
    getAll: storageMocks.getAllBrandStates,
    update: storageMocks.updateBrandState,
  },
  settingsStorage: {
    getDarkMode: storageMocks.getDarkMode,
    setDarkMode: storageMocks.setDarkMode,
    getQuickStartSeen: storageMocks.getQuickStartSeen,
    setQuickStartSeen: storageMocks.setQuickStartSeen,
  },
}));

vi.mock('../../services/geminiService', () => ({
  fetchKeywords: vi.fn().mockResolvedValue([[], []]),
  fetchKeywordClusters: vi.fn(),
  reinitializeGeminiService: vi.fn(),
  analyzeKeywordsBatch: vi.fn(),
}));

vi.mock('../../services/sopService', () => ({
  aiSearchSOPs: vi.fn(),
  getAIRecommendedSOPs: vi.fn(),
  reinitializeSOPService: vi.fn(),
}));

vi.mock('../../services/supabaseClient', () => ({
  reinitializeSupabaseClient: vi.fn(),
}));

vi.mock('../../utils/sopStorage', () => ({
  getSOPsForBrand: vi.fn().mockResolvedValue([]),
  addSOP: vi.fn(),
  updateSOP: vi.fn(),
  deleteSOP: vi.fn(),
  toggleSOPFavorite: vi.fn(),
  incrementSOPViewCount: vi.fn(),
  trackSOPView: vi.fn(),
}));

vi.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => {},
}));

vi.mock('../../components/Header', () => ({ Header: () => null }));
vi.mock('../../components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('../../components/DesktopSidebar', () => ({ DesktopSidebar: () => null }));
vi.mock('../../components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
vi.mock('../../components/ErrorMessage', () => ({ ErrorMessage: () => null }));
vi.mock('../../components/ScrollToTopButton', () => ({ ScrollToTopButton: () => null }));
vi.mock('../../components/RelatedKeywords', () => ({ RelatedKeywords: () => null }));
vi.mock('../../components/SessionManager', () => ({ SessionManager: () => null }));
vi.mock('../../components/KeywordClusters', () => ({ KeywordClusters: () => null }));
vi.mock('../../components/Dashboard', () => ({ Dashboard: () => null }));
vi.mock('../../components/Footer', () => ({ Footer: () => null }));
vi.mock('../../components/BrandCreationModal', () => ({ BrandCreationModal: () => null }));
vi.mock('../../components/CampaignManager', () => ({ CampaignManager: () => null }));
vi.mock('../../components/KeywordBank', () => ({ KeywordBank: () => null }));
vi.mock('../../components/WelcomeMessage', () => ({ WelcomeMessage: () => null }));
vi.mock('../../components/BrandTab', () => ({ BrandTab: () => null }));
vi.mock('../../components/QuickStartGuide', () => ({ QuickStartGuide: () => null }));
vi.mock('../../components/SearchFeedback', () => ({ SearchFeedback: () => null }));
vi.mock('../../components/SearchSuccessToast', () => ({ SearchSuccessToast: () => null }));
vi.mock('../../components/Breadcrumb', () => ({ Breadcrumb: () => null }));
vi.mock('../../components/SOPLibrary', () => ({ SOPLibrary: () => null }));

vi.mock('../../components/ViewSwitcher', () => ({
  ViewSwitcher: ({ onViewChange }: { onViewChange: (view: any) => void }) => {
    latestViewChange = onViewChange;
    return null;
  },
}));

vi.mock('../../components/EnhancedViewSwitcher', () => ({
  EnhancedViewSwitcher: ({ onViewChange }: { onViewChange: (view: any) => void }) => {
    latestViewChange = onViewChange;
    return null;
  },
}));

vi.mock('../../components/BottomNavigation', () => ({
  BottomNavigation: ({ onViewChange }: { onViewChange: (view: any) => void }) => {
    latestViewChange = onViewChange;
    return null;
  },
}));

vi.mock('../../components/KeywordInput', () => ({
  KeywordInput: (props: any) => {
    keywordInputProps = props;
    return <div data-testid="keyword-input" />;
  },
}));

vi.mock('../../components/Settings', () => ({
  Settings: (props: { apiSettings: ApiSettings; onSaveSettings: (settings: ApiSettings) => void }) => {
    latestSettingsProps = props;
    return <div data-testid="settings-view">{props.apiSettings.geminiApiKey}</div>;
  },
}));

vi.mock('../../components/ApiKeyPrompt', () => ({
  ApiKeyPrompt: (props: { isOpen: boolean; onSave: (key: string) => void; onClose: () => void }) => {
    latestApiKeyPromptProps = props;
    return props.isOpen ? <div data-testid="api-key-prompt" /> : null;
  },
}));

describe('App API settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    keywordInputProps = undefined;
    latestSettingsProps = undefined;
    latestApiKeyPromptProps = undefined;
    latestViewChange = undefined;
  });

  it('persists newly saved API key and reuses it when reopening settings', async () => {
    render(<App />);

    await waitFor(() => {
      expect(keywordInputProps).toBeDefined();
    });

    act(() => {
      keywordInputProps.onSearch('seed keyword');
    });

    await waitFor(() => {
      expect(latestApiKeyPromptProps?.isOpen).toBe(true);
    });

    act(() => {
      latestApiKeyPromptProps?.onSave('new-test-api-key');
    });

    await waitFor(() => {
      expect(latestApiKeyPromptProps?.isOpen).toBe(false);
    });

    expect(localStorage.getItem('ppcGeniusApiSettings.geminiApiKey')).toBe(JSON.stringify('new-test-api-key'));

    expect(typeof latestViewChange).toBe('function');

    act(() => {
      latestViewChange?.('settings');
    });

    await waitFor(() => {
      expect(latestSettingsProps?.apiSettings.geminiApiKey).toBe('new-test-api-key');
    });

    act(() => {
      latestViewChange?.('research');
      latestViewChange?.('settings');
    });

    await waitFor(() => {
      expect(latestSettingsProps?.apiSettings.geminiApiKey).toBe('new-test-api-key');
    });
  });
});
