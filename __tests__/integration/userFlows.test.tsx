import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Integration Tests - User Flow Simulations
 * 
 * These tests simulate complete user workflows from start to finish,
 * validating the interaction between multiple components and services.
 */

// Mock the Gemini service before importing App
vi.mock('../../services/geminiService', () => ({
  fetchKeywords: vi.fn(),
  fetchKeywordClusters: vi.fn(),
  fetchKeywordDeepDive: vi.fn(),
  reinitializeGeminiService: vi.fn(),
}));

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: null,
  reinitializeSupabaseClient: vi.fn(),
}));

// Import App after mocks are set up
import App from '../../App';
import * as geminiService from '../../services/geminiService';

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Set up default API key
    localStorage.setItem('ppcGeniusApiSettings.geminiApiKey', 'test-api-key');
  });

  describe('First-Time User Flow', () => {
    it('should guide user through complete onboarding and first search', async () => {
      const user = userEvent.setup();
      
      // Mock successful keyword fetch
      const mockKeywords = [
        {
          keyword: 'wireless headphones',
          type: 'Broad' as const,
          category: 'Core' as const,
          searchVolume: '10k-20k',
          competition: 'Medium' as const,
          relevance: 9,
          source: 'AI' as const,
        },
        {
          keyword: 'bluetooth headphones',
          type: 'Phrase' as const,
          category: 'Opportunity' as const,
          searchVolume: '5k-10k',
          competition: 'Low' as const,
          relevance: 8,
          source: 'AI' as const,
        },
      ];
      
      vi.mocked(geminiService.fetchKeywords).mockResolvedValue([
        mockKeywords,
        ['noise cancelling headphones', 'wireless earbuds'],
      ]);
      
      render(<App />);
      
      // Step 1: User sees welcome message (no brands yet)
      await waitFor(() => {
        expect(screen.getByText(/Create Your First Brand/i)).toBeInTheDocument();
      });
      
      // Step 2: Create a brand
      const createBrandButton = screen.getAllByText(/Create Brand/i)[0];
      await user.click(createBrandButton);
      
      // Brand modal should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const brandInput = screen.getByPlaceholderText(/Brand Name/i);
      await user.type(brandInput, 'Test Electronics');
      
      const createButton = screen.getByRole('button', { name: /Create$/i });
      await user.click(createButton);
      
      // Step 3: Brand created, search interface should be ready
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // Step 4: Perform first search
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      await user.type(searchInput, 'wireless headphones');
      
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await user.click(searchButton);
      
      // Step 5: Verify keywords are displayed
      await waitFor(() => {
        expect(screen.getByText('wireless headphones')).toBeInTheDocument();
        expect(screen.getByText('bluetooth headphones')).toBeInTheDocument();
      });
      
      // Verify API was called correctly
      expect(geminiService.fetchKeywords).toHaveBeenCalledWith(
        'wireless headphones',
        false,
        'Test Electronics'
      );
    });

    it('should handle API key setup flow', async () => {
      const user = userEvent.setup();
      
      // Remove API key to trigger prompt
      localStorage.removeItem('ppcGeniusApiSettings.geminiApiKey');
      
      render(<App />);
      
      // Create a brand first
      const createBrandButton = screen.getAllByText(/Create Brand/i)[0];
      await user.click(createBrandButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const brandInput = screen.getByPlaceholderText(/Brand Name/i);
      await user.type(brandInput, 'Test Brand');
      
      const createButton = screen.getByRole('button', { name: /Create$/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // Try to search without API key
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      await user.type(searchInput, 'test keyword');
      
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await user.click(searchButton);
      
      // API Key Prompt should appear
      await waitFor(() => {
        expect(screen.getByText(/API Key Required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Returning User Flow', () => {
    beforeEach(() => {
      // Set up existing brand and data
      localStorage.setItem('ppcGeniusBrands', JSON.stringify(['Existing Brand']));
      localStorage.setItem('ppcGeniusActiveBrand', JSON.stringify('Existing Brand'));
      localStorage.setItem('ppcGeniusBrandStates', JSON.stringify({
        'Existing Brand': {
          keywordResults: [
            {
              keyword: 'existing keyword',
              type: 'Broad',
              category: 'Core',
              searchVolume: '1k-5k',
              competition: 'Low',
              relevance: 7,
              source: 'AI',
            },
          ],
          searchedKeywords: ['existing keyword'],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          campaigns: [],
        },
      }));
      localStorage.setItem('ppcGeniusHasSeenQuickStart', JSON.stringify(true));
    });

    it('should load existing brand data and allow new search', async () => {
      const user = userEvent.setup();
      
      const mockNewKeywords = [
        {
          keyword: 'new keyword 1',
          type: 'Phrase' as const,
          category: 'Opportunity' as const,
          searchVolume: '2k-5k',
          competition: 'Medium' as const,
          relevance: 8,
          source: 'AI' as const,
        },
      ];
      
      vi.mocked(geminiService.fetchKeywords).mockResolvedValue([
        mockNewKeywords,
        ['related keyword'],
      ]);
      
      render(<App />);
      
      // Existing data should be loaded
      await waitFor(() => {
        expect(screen.getByText('existing keyword')).toBeInTheDocument();
      });
      
      // Perform new search
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'new search term');
      
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await user.click(searchButton);
      
      // New keywords should appear
      await waitFor(() => {
        expect(screen.getByText('new keyword 1')).toBeInTheDocument();
      });
    });

    it('should allow switching between views', async () => {
      const user = userEvent.setup();
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('existing keyword')).toBeInTheDocument();
      });
      
      // Switch to Campaign Planner
      const campaignPlannerButton = screen.getByText(/Campaign Planner/i);
      await user.click(campaignPlannerButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Campaign Manager/i)).toBeInTheDocument();
      });
      
      // Switch to Settings
      const settingsButton = screen.getByText(/Settings/i);
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText(/API Configuration/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Flow', () => {
    it('should persist data across page reloads', async () => {
      const user = userEvent.setup();
      
      const mockKeywords = [
        {
          keyword: 'persisted keyword',
          type: 'Exact' as const,
          category: 'Core' as const,
          searchVolume: '10k-20k',
          competition: 'High' as const,
          relevance: 10,
          source: 'AI' as const,
        },
      ];
      
      vi.mocked(geminiService.fetchKeywords).mockResolvedValue([
        mockKeywords,
        ['related'],
      ]);
      
      const { unmount } = render(<App />);
      
      // Create brand
      const createBrandButton = screen.getAllByText(/Create Brand/i)[0];
      await user.click(createBrandButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const brandInput = screen.getByPlaceholderText(/Brand Name/i);
      await user.type(brandInput, 'Persistence Test');
      
      const createButton = screen.getByRole('button', { name: /Create$/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // Perform search
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      await user.type(searchInput, 'test');
      
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('persisted keyword')).toBeInTheDocument();
      });
      
      // Unmount component (simulate page reload)
      unmount();
      
      // Re-render
      render(<App />);
      
      // Data should still be there
      await waitFor(() => {
        expect(screen.getByText('persisted keyword')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      vi.mocked(geminiService.fetchKeywords).mockRejectedValue(
        new Error('API rate limit exceeded')
      );
      
      // Set up brand
      localStorage.setItem('ppcGeniusBrands', JSON.stringify(['Test Brand']));
      localStorage.setItem('ppcGeniusActiveBrand', JSON.stringify('Test Brand'));
      localStorage.setItem('ppcGeniusBrandStates', JSON.stringify({
        'Test Brand': {
          keywordResults: [],
          searchedKeywords: [],
          advancedSearchSettings: {
            advancedKeywords: '',
            minVolume: '',
            maxVolume: '',
            isWebAnalysisEnabled: false,
            brandName: '',
          },
          campaigns: [],
        },
      }));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter seed keyword/i)).toBeInTheDocument();
      });
      
      // Perform search that will fail
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      await user.type(searchInput, 'test keyword');
      
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await user.click(searchButton);
      
      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
      });
    });
  });
});
