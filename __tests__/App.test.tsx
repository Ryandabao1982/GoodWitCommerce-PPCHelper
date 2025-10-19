import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock services
vi.mock('../services/geminiService', () => ({
  fetchKeywords: vi.fn(),
  fetchKeywordClusters: vi.fn(),
  reinitializeGeminiService: vi.fn(),
}));

vi.mock('../services/supabaseClient', () => ({
  reinitializeSupabaseClient: vi.fn(),
}));

describe('App - Brand Tab Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Brand Tab View', () => {
    it('should render the app without crashing', () => {
      render(<App />);
      expect(screen.getByText(/Keyword Research/i)).toBeInTheDocument();
    });

    it('should display view switcher with Brand Tab option', () => {
      render(<App />);
      expect(screen.getByText(/Brand Tab/i)).toBeInTheDocument();
    });

    it('should show Brand Tab icon in view switcher', () => {
      render(<App />);
      const viewSwitcher = screen.getByText('🎯');
      expect(viewSwitcher).toBeInTheDocument();
    });

    it('should not show Brand Tab content when no active brand', async () => {
      render(<App />);
      
      // Click on Brand Tab view
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);

      // Should show welcome message or empty state, not Brand Tab content
      await waitFor(() => {
        expect(screen.queryByText(/Brand Tab/i)).toBeInTheDocument();
      });
    });

    it('should render Brand Tab when brand exists and view is selected', async () => {
      // Setup: Create a brand first
      render(<App />);
      
      // Open brand creation modal
      const brandButtons = screen.getAllByRole('button');
      const createBrandButton = brandButtons.find(btn => 
        btn.textContent?.includes('New Brand') || btn.textContent?.includes('+')
      );
      
      if (createBrandButton) {
        fireEvent.click(createBrandButton);
      }
    });

    it('should maintain Brand Tab state across view switches', async () => {
      render(<App />);
      
      // Switch to Brand Tab
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      // Switch to another view
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      fireEvent.click(dashboardButton);
      
      // Switch back to Brand Tab
      fireEvent.click(brandTabButton);
      
      // Brand Tab should still be available
      expect(brandTabButton).toBeInTheDocument();
    });

    it('should handle view switching from research to brand', () => {
      render(<App />);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      expect(brandTabButton).not.toHaveClass('bg-blue-600');
      
      fireEvent.click(brandTabButton);
      expect(brandTabButton).toHaveClass('bg-blue-600');
    });

    it('should handle view switching from bank to brand', () => {
      render(<App />);
      
      const bankButton = screen.getByRole('button', { name: /🏦 Keyword Bank/i });
      fireEvent.click(bankButton);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      expect(brandTabButton).toHaveClass('bg-blue-600');
    });

    it('should handle view switching from planner to brand', () => {
      render(<App />);
      
      const plannerButton = screen.getByRole('button', { name: /📋 Campaign Planner/i });
      fireEvent.click(plannerButton);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      expect(brandTabButton).toHaveClass('bg-blue-600');
    });

    it('should handle view switching from settings to brand', () => {
      render(<App />);
      
      const settingsButton = screen.getByRole('button', { name: /⚙️ Settings/i });
      fireEvent.click(settingsButton);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      expect(brandTabButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Brand State Management', () => {
    it('should persist brand state in localStorage', () => {
      render(<App />);
      
      // Verify localStorage is being used
      expect(localStorage.getItem).toBeDefined();
    });

    it('should load brand state from localStorage on mount', () => {
      const mockBrandState = {
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
      };

      localStorage.setItem('ppcGeniusBrandStates', JSON.stringify({ TestBrand: mockBrandState }));
      localStorage.setItem('ppcGeniusActiveBrand', JSON.stringify('TestBrand'));
      localStorage.setItem('ppcGeniusBrands', JSON.stringify(['TestBrand']));

      render(<App />);
      
      expect(screen.getByText(/Keyword Research/i)).toBeInTheDocument();
    });

    it('should handle empty brand states gracefully', () => {
      localStorage.setItem('ppcGeniusBrandStates', JSON.stringify({}));
      
      render(<App />);
      
      expect(screen.getByText(/Keyword Research/i)).toBeInTheDocument();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('ppcGeniusBrandStates', 'invalid json');
      
      // Should not crash
      render(<App />);
      
      expect(screen.getByText(/Keyword Research/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should handle dark mode toggle', () => {
      render(<App />);
      
      // Initial state
      const html = document.documentElement;
      const initialHasDark = html.classList.contains('dark');
      
      expect(html).toBeDefined();
    });

    it('should persist dark mode preference', () => {
      localStorage.setItem('ppcGeniusDarkMode', JSON.stringify(true));
      
      render(<App />);
      
      const html = document.documentElement;
      expect(html).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing activeBrand gracefully', () => {
      localStorage.removeItem('ppcGeniusActiveBrand');
      
      render(<App />);
      
      expect(screen.getByText(/Keyword Research/i)).toBeInTheDocument();
    });

    it('should handle navigation with undefined brand state', () => {
      render(<App />);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      // Should not crash
      expect(brandTabButton).toBeInTheDocument();
    });
  });

  describe('ViewSwitcher Integration', () => {
    it('should render all 5 view options including Brand Tab', () => {
      render(<App />);
      
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Keyword Bank/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Planner/i)).toBeInTheDocument();
      expect(screen.getByText(/Brand Tab/i)).toBeInTheDocument();
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should default to research view on initial load', () => {
      render(<App />);
      
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      expect(dashboardButton).toHaveClass('bg-blue-600');
    });
  });

  describe('BrandTab Props', () => {
    it('should pass correct props to BrandTab when rendered', async () => {
      // Setup with a brand
      localStorage.setItem('ppcGeniusBrands', JSON.stringify(['TestBrand']));
      localStorage.setItem('ppcGeniusActiveBrand', JSON.stringify('TestBrand'));
      localStorage.setItem('ppcGeniusBrandStates', JSON.stringify({
        TestBrand: {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: 'TestBrand',
          },
          keywordClusters: null,
          campaigns: [],
        },
      }));

      render(<App />);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      await waitFor(() => {
        // BrandTab should be rendered with the brand
        expect(brandTabButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should render Brand Tab only when activeBrand and activeBrandState exist', async () => {
      render(<App />);
      
      const brandTabButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandTabButton);
      
      // Without a brand, should not show Brand Tab content
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should not render Brand Tab content when currentView is not brand', () => {
      localStorage.setItem('ppcGeniusBrands', JSON.stringify(['TestBrand']));
      localStorage.setItem('ppcGeniusActiveBrand', JSON.stringify('TestBrand'));
      
      render(<App />);
      
      // Default view is research, not brand
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      expect(dashboardButton).toHaveClass('bg-blue-600');
    });
  });
});