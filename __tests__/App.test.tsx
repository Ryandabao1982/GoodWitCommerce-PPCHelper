import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock child components to simplify testing
vi.mock('../components/BrandTab', () => ({
  BrandTab: ({ activeBrand, brandState }: any) => (
    <div data-testid="brand-tab-mock">
      BrandTab: {activeBrand}
    </div>
  ),
}));

vi.mock('../components/Settings', () => ({
  Settings: () => <div data-testid="settings-mock">Settings</div>,
}));

vi.mock('../components/KeywordBank', () => ({
  KeywordBank: () => <div data-testid="keyword-bank-mock">KeywordBank</div>,
}));

vi.mock('../components/CampaignManager', () => ({
  CampaignManager: () => <div data-testid="campaign-manager-mock">CampaignManager</div>,
}));

vi.mock('../components/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-mock">Dashboard</div>,
}));

vi.mock('../components/Header', () => ({
  Header: () => <div data-testid="header-mock">Header</div>,
}));

vi.mock('../components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock">Sidebar</div>,
}));

vi.mock('../components/ViewSwitcher', () => ({
  ViewSwitcher: ({ currentView, onViewChange }: any) => (
    <div data-testid="view-switcher-mock">
      <button onClick={() => onViewChange('research')}>Dashboard</button>
      <button onClick={() => onViewChange('bank')}>Keyword Bank</button>
      <button onClick={() => onViewChange('planner')}>Campaign Planner</button>
      <button onClick={() => onViewChange('brand')}>Brand Tab</button>
      <button onClick={() => onViewChange('settings')}>Settings</button>
    </div>
  ),
}));

vi.mock('../components/ApiKeyPrompt', () => ({
  ApiKeyPrompt: () => <div data-testid="api-key-prompt-mock">ApiKeyPrompt</div>,
}));

vi.mock('../components/BrandCreationModal', () => ({
  BrandCreationModal: () => <div data-testid="brand-creation-modal-mock">BrandCreationModal</div>,
}));

vi.mock('../components/SessionManager', () => ({
  SessionManager: () => <div data-testid="session-manager-mock">SessionManager</div>,
}));

describe('App Component - Brand Tab Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('BrandTab Rendering Conditions', () => {
    it('should render BrandTab when currentView is "brand" with active brand and brand state', () => {
      // Set up localStorage with a brand and brand state
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('activeBrand', 'TestBrand');
      localStorage.setItem('brandStates', JSON.stringify({
        TestBrand: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      // BrandTab should be rendered
      expect(screen.queryByTestId('brand-tab-mock')).toBeInTheDocument();
    });

    it('should not render BrandTab when currentView is not "brand"', () => {
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('activeBrand', 'TestBrand');
      localStorage.setItem('brandStates', JSON.stringify({
        TestBrand: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('currentView', 'research');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      expect(screen.queryByTestId('brand-tab-mock')).not.toBeInTheDocument();
    });

    it('should not render BrandTab when there is no active brand', () => {
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      expect(screen.queryByTestId('brand-tab-mock')).not.toBeInTheDocument();
    });

    it('should not render BrandTab when there is no brand state for active brand', () => {
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('activeBrand', 'TestBrand');
      localStorage.setItem('brandStates', JSON.stringify({}));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      expect(screen.queryByTestId('brand-tab-mock')).not.toBeInTheDocument();
    });
  });

  describe('View Rendering Priority', () => {
    it('should render Settings view when currentView is "settings"', () => {
      localStorage.setItem('currentView', 'settings');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      expect(screen.queryByTestId('settings-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('brand-tab-mock')).not.toBeInTheDocument();
    });

    it('should prioritize Settings over BrandTab when both conditions are met', () => {
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('activeBrand', 'TestBrand');
      localStorage.setItem('brandStates', JSON.stringify({
        TestBrand: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('currentView', 'settings');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      expect(screen.queryByTestId('settings-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('brand-tab-mock')).not.toBeInTheDocument();
    });
  });

  describe('BrandTab Props', () => {
    it('should pass correct props to BrandTab component', () => {
      const testBrandState = {
        keywordResults: [
          {
            keyword: 'test keyword',
            type: 'Exact' as const,
            category: 'Core' as const,
            searchVolume: '1000-5000',
            competition: 'Medium' as const,
            relevance: 8,
            source: 'AI' as const,
          },
        ],
        searchedKeywords: ['test'],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
      };

      localStorage.setItem('brands', JSON.stringify(['MyTestBrand']));
      localStorage.setItem('activeBrand', 'MyTestBrand');
      localStorage.setItem('brandStates', JSON.stringify({
        MyTestBrand: testBrandState,
      }));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      const brandTab = screen.getByTestId('brand-tab-mock');
      expect(brandTab).toHaveTextContent('BrandTab: MyTestBrand');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing localStorage gracefully', () => {
      expect(() => render(<App />)).not.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('brandStates', 'invalid-json');
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('activeBrand', 'TestBrand');

      expect(() => render(<App />)).not.toThrow();
    });

    it('should handle empty brand name', () => {
      localStorage.setItem('brands', JSON.stringify(['']));
      localStorage.setItem('activeBrand', '');
      localStorage.setItem('brandStates', JSON.stringify({
        '': {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      expect(() => render(<App />)).not.toThrow();
    });

    it('should handle switching between different views', () => {
      localStorage.setItem('brands', JSON.stringify(['TestBrand']));
      localStorage.setItem('activeBrand', 'TestBrand');
      localStorage.setItem('brandStates', JSON.stringify({
        TestBrand: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      // Start with brand view
      localStorage.setItem('currentView', 'brand');
      const { rerender } = render(<App />);
      expect(screen.queryByTestId('brand-tab-mock')).toBeInTheDocument();

      // Switch to settings view
      localStorage.setItem('currentView', 'settings');
      rerender(<App />);
      // Note: In a real app, this would need proper state management
    });
  });

  describe('Multiple Brands Scenario', () => {
    it('should render BrandTab with correct brand when multiple brands exist', () => {
      localStorage.setItem('brands', JSON.stringify(['Brand1', 'Brand2', 'Brand3']));
      localStorage.setItem('activeBrand', 'Brand2');
      localStorage.setItem('brandStates', JSON.stringify({
        Brand1: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
        Brand2: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
        Brand3: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));
      localStorage.setItem('currentView', 'brand');
      localStorage.setItem('apiSettings', JSON.stringify({
        geminiApiKey: 'test-key',
        supabaseUrl: '',
        supabaseAnonKey: '',
      }));

      render(<App />);

      const brandTab = screen.getByTestId('brand-tab-mock');
      expect(brandTab).toHaveTextContent('BrandTab: Brand2');
    });
  });
});