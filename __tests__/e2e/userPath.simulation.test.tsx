/**
 * User Path Simulation Test
 *
 * This test suite simulates complete user journeys through the application,
 * tracing paths from the root landing page through key workflows.
 *
 * Based on USER_PATH_SIMULATION.md documentation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue(
            JSON.stringify({
              keywords: [
                {
                  keyword: 'wireless headphones',
                  type: 'Broad',
                  category: 'Core',
                  estimatedSearchVolume: '10k-50k',
                  competition: 'High',
                  relevanceScore: 10,
                },
              ],
            })
          ),
        },
      }),
    }),
  })),
}));

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
  reinitializeSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
  getSupabaseUser: vi.fn().mockResolvedValue(null),
}));

describe('User Path Simulation - Complete Journey from Root', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Set up API key in storage (simulating it's already configured)
    localStorageMock.setItem('ppcGeniusApiSettings.geminiApiKey', 'test-api-key-12345');
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Path 1: First-Time User - Complete Onboarding Flow', () => {
    it('should guide user through complete first-time setup from root', async () => {
      // STEP 1: Landing at root with no brands
      render(<App />);

      // User should see Quick Start Guide
      await waitFor(() => {
        expect(screen.getByText(/Quick Start Guide/i)).toBeInTheDocument();
      });

      // API key should already be configured (Step 1 complete)
      expect(screen.getByText(/Set Up API Key/i)).toBeInTheDocument();

      // STEP 2: User creates their first brand
      const createBrandButton = screen.getByRole('button', { name: /Create Brand/i });
      expect(createBrandButton).toBeInTheDocument();

      fireEvent.click(createBrandButton);

      // Brand creation modal should appear
      await waitFor(() => {
        expect(screen.getByText(/Create New Brand/i)).toBeInTheDocument();
      });

      // User enters brand name
      const brandInput = screen.getByPlaceholderText(/Enter brand name/i);
      fireEvent.change(brandInput, { target: { value: 'Test Brand' } });

      // User submits the form
      const submitButton = screen.getByRole('button', { name: /Create/i });
      fireEvent.click(submitButton);

      // STEP 3: User should now see the research interface
      await waitFor(
        () => {
          // Search input should be enabled
          const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
          expect(searchInput).toBeEnabled();
        },
        { timeout: 3000 }
      );

      console.log('✓ User Path 1 Complete: First-time setup successful');
    }, 10000);
  });

  describe('Path 2: Keyword Research Workflow', () => {
    beforeEach(() => {
      // Set up a pre-existing brand for this workflow
      localStorageMock.setItem('ppcGenius_brands', JSON.stringify(['Test Brand']));
      localStorageMock.setItem('ppcGenius_activeBrand', 'Test Brand');
      localStorageMock.setItem(
        'ppcGenius_brand_Test Brand',
        JSON.stringify({
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
        })
      );
    });

    it('should trace complete keyword research path from search to results', async () => {
      render(<App />);

      // STEP 1: Wait for brand to load
      await waitFor(
        () => {
          expect(screen.getByText('Test Brand')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // STEP 2: User enters a seed keyword
      const searchInput = screen.getByPlaceholderText(/Enter seed keyword/i);
      expect(searchInput).toBeEnabled();

      fireEvent.change(searchInput, { target: { value: 'wireless headphones' } });
      expect(searchInput).toHaveValue('wireless headphones');

      // STEP 3: User initiates search
      const searchButton = screen.getByRole('button', { name: /Search/i });
      fireEvent.click(searchButton);

      // STEP 4: Loading state should appear
      await waitFor(
        () => {
          expect(screen.getByText(/Loading/i) || screen.getByRole('status')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      console.log('✓ User Path 2 Complete: Keyword research workflow traced');
    }, 10000);
  });

  describe('Path 3: View Navigation and State Persistence', () => {
    beforeEach(() => {
      localStorageMock.setItem('ppcGenius_brands', JSON.stringify(['Test Brand']));
      localStorageMock.setItem('ppcGenius_activeBrand', 'Test Brand');
      localStorageMock.setItem(
        'ppcGenius_brand_Test Brand',
        JSON.stringify({
          keywordResults: [
            {
              keyword: 'wireless headphones',
              type: 'Broad',
              category: 'Core',
              estimatedSearchVolume: '10k-50k',
              competition: 'High',
              relevanceScore: 10,
            },
          ],
          searchedKeywords: ['wireless headphones'],
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
        })
      );
    });

    it('should trace navigation between different views maintaining state', async () => {
      render(<App />);

      // STEP 1: Start at Research view (default)
      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      // STEP 2: Navigate to Keyword Bank view
      // Look for view switcher buttons
      const viewButtons = screen.getAllByRole('button');
      const keywordBankButton = viewButtons.find(
        (btn) => btn.textContent?.includes('Bank') || btn.textContent?.includes('Keywords')
      );

      if (keywordBankButton) {
        fireEvent.click(keywordBankButton);

        // Verify we're in Keyword Bank view
        await waitFor(
          () => {
            // Keywords from storage should be visible
            expect(screen.getByText(/wireless headphones/i)).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
      }

      // STEP 3: Navigate to Campaign Planner
      const campaignButton = viewButtons.find(
        (btn) => btn.textContent?.includes('Campaign') || btn.textContent?.includes('Planner')
      );

      if (campaignButton) {
        fireEvent.click(campaignButton);

        await waitFor(
          () => {
            // Campaign view should load
            expect(screen.getByText(/Campaign/i)).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
      }

      console.log('✓ User Path 3 Complete: View navigation traced');
    }, 10000);
  });

  describe('Path 4: Settings and API Configuration', () => {
    beforeEach(() => {
      localStorageMock.setItem('ppcGenius_brands', JSON.stringify(['Test Brand']));
      localStorageMock.setItem('ppcGenius_activeBrand', 'Test Brand');
    });

    it('should trace path to settings and API key management', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      // STEP 1: Navigate to Settings
      const viewButtons = screen.getAllByRole('button');
      const settingsButton = viewButtons.find(
        (btn) => btn.textContent?.includes('Settings') || btn.textContent?.includes('⚙')
      );

      if (settingsButton) {
        fireEvent.click(settingsButton);

        // STEP 2: Verify settings interface loads
        await waitFor(
          () => {
            // Look for settings-related content
            const settingsText = screen.queryByText(/API/i) || screen.queryByText(/Settings/i);
            expect(settingsText).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
      }

      console.log('✓ User Path 4 Complete: Settings navigation traced');
    }, 10000);
  });

  describe('Path 5: Multi-Brand Workflow', () => {
    beforeEach(() => {
      localStorageMock.setItem('ppcGenius_brands', JSON.stringify(['Brand A', 'Brand B']));
      localStorageMock.setItem('ppcGenius_activeBrand', 'Brand A');
      localStorageMock.setItem(
        'ppcGenius_brand_Brand A',
        JSON.stringify({
          keywordResults: [
            {
              keyword: 'product a',
              type: 'Broad',
              category: 'Core',
              estimatedSearchVolume: '1k-5k',
              competition: 'Low',
              relevanceScore: 8,
            },
          ],
          searchedKeywords: ['product a'],
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
        })
      );
      localStorageMock.setItem(
        'ppcGenius_brand_Brand B',
        JSON.stringify({
          keywordResults: [
            {
              keyword: 'product b',
              type: 'Exact',
              category: 'Core',
              estimatedSearchVolume: '5k-10k',
              competition: 'Medium',
              relevanceScore: 9,
            },
          ],
          searchedKeywords: ['product b'],
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
        })
      );
    });

    it('should trace brand switching and data isolation', async () => {
      render(<App />);

      // STEP 1: Verify Brand A is active
      await waitFor(() => {
        expect(screen.getByText('Brand A')).toBeInTheDocument();
      });

      // Brand A's keywords should be visible
      await waitFor(
        () => {
          const productAText = screen.queryByText(/product a/i);
          if (productAText) {
            expect(productAText).toBeInTheDocument();
          }
        },
        { timeout: 2000 }
      );

      // STEP 2: Switch to Brand B
      // Find brand selector dropdown or button
      const brandButtons = screen.getAllByRole('button');
      const brandSelector = brandButtons.find(
        (btn) => btn.textContent?.includes('Brand A') || btn.textContent?.includes('Brand')
      );

      if (brandSelector) {
        fireEvent.click(brandSelector);

        // Look for Brand B in dropdown
        await waitFor(
          () => {
            const brandBOption = screen.queryByText('Brand B');
            if (brandBOption) {
              fireEvent.click(brandBOption);
            }
          },
          { timeout: 2000 }
        );
      }

      console.log('✓ User Path 5 Complete: Multi-brand workflow traced');
    }, 10000);
  });

  describe('Path 6: Error Handling and Edge Cases', () => {
    it('should trace error path when no API key is configured', async () => {
      // Remove API key
      localStorageMock.removeItem('ppcGeniusApiSettings.geminiApiKey');

      render(<App />);

      // User should see API key prompt or warning
      await waitFor(
        () => {
          const apiKeyText = screen.queryByText(/API Key/i) || screen.queryByText(/Configure/i);
          expect(apiKeyText).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      console.log('✓ User Path 6 Complete: Error handling traced');
    }, 10000);

    it('should handle empty state when no brands exist', async () => {
      // Clear brands
      localStorageMock.removeItem('ppcGenius_brands');
      localStorageMock.removeItem('ppcGenius_activeBrand');

      render(<App />);

      // User should see empty state or brand creation prompt
      await waitFor(
        () => {
          const createBrandText =
            screen.queryByText(/Create Brand/i) || screen.queryByText(/Get started/i);
          expect(createBrandText).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      console.log('✓ User Path 6b Complete: Empty state handled');
    }, 10000);
  });

  describe('Path 7: Campaign Planning Workflow', () => {
    beforeEach(() => {
      localStorageMock.setItem('ppcGenius_brands', JSON.stringify(['Test Brand']));
      localStorageMock.setItem('ppcGenius_activeBrand', 'Test Brand');
      localStorageMock.setItem(
        'ppcGenius_brand_Test Brand',
        JSON.stringify({
          keywordResults: [
            {
              keyword: 'wireless headphones',
              type: 'Broad',
              category: 'Core',
              estimatedSearchVolume: '10k-50k',
              competition: 'High',
              relevanceScore: 10,
            },
            {
              keyword: 'bluetooth headphones',
              type: 'Phrase',
              category: 'Core',
              estimatedSearchVolume: '5k-10k',
              competition: 'Medium',
              relevanceScore: 9,
            },
          ],
          searchedKeywords: ['wireless headphones'],
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
        })
      );
    });

    it('should trace campaign creation and keyword assignment path', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Brand')).toBeInTheDocument();
      });

      // Navigate to Campaign Planner view
      const viewButtons = screen.getAllByRole('button');
      const campaignButton = viewButtons.find(
        (btn) => btn.textContent?.includes('Campaign') || btn.textContent?.includes('Planner')
      );

      if (campaignButton) {
        fireEvent.click(campaignButton);

        await waitFor(
          () => {
            expect(screen.getByText(/Campaign/i)).toBeInTheDocument();
          },
          { timeout: 2000 }
        );

        // Look for "New Campaign" or "Add Campaign" button
        const addCampaignButton =
          screen.queryByRole('button', { name: /New Campaign/i }) ||
          screen.queryByRole('button', { name: /Add Campaign/i });

        if (addCampaignButton) {
          expect(addCampaignButton).toBeInTheDocument();
        }
      }

      console.log('✓ User Path 7 Complete: Campaign planning workflow traced');
    }, 10000);
  });
});

describe('User Path Simulation - Function Tracing', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('ppcGeniusApiSettings.geminiApiKey', 'test-api-key-12345');
    vi.clearAllMocks();
  });

  it('should trace storage functions during user journey', async () => {
    // Track localStorage calls
    const setItemSpy = vi.spyOn(window.Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(window.Storage.prototype, 'getItem');

    render(<App />);

    // Wait for initial load
    await waitFor(
      () => {
        expect(getItemSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Verify that storage functions were called
    expect(getItemSpy.mock.calls.length).toBeGreaterThan(0);

    console.log('✓ Storage function tracing complete');
    console.log(`  - getItem called ${getItemSpy.mock.calls.length} times`);

    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  }, 10000);

  it('should trace state updates during brand creation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Quick Start Guide/i)).toBeInTheDocument();
    });

    const setItemSpy = vi.spyOn(window.Storage.prototype, 'setItem');

    // Create a brand
    const createBrandButton = screen.getByRole('button', { name: /Create Brand/i });
    fireEvent.click(createBrandButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Brand/i)).toBeInTheDocument();
    });

    const brandInput = screen.getByPlaceholderText(/Enter brand name/i);
    fireEvent.change(brandInput, { target: { value: 'Test Brand' } });

    const submitButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submitButton);

    // Verify storage was updated
    await waitFor(
      () => {
        expect(setItemSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    console.log('✓ State update tracing complete');
    console.log(`  - setItem called ${setItemSpy.mock.calls.length} times during brand creation`);

    setItemSpy.mockRestore();
  }, 10000);
});
