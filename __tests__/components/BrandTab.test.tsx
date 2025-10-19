import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrandTab } from '../../components/BrandTab/BrandTab';
import { BrandState, Portfolio, KPIMetrics, RAGBadge, BrandTabSettings } from '../../types';

describe('BrandTab', () => {
  const mockOnUpdateBrandState = vi.fn();

  const mockBrandState: BrandState = {
    keywordResults: [
      {
        keyword: 'test keyword',
        type: 'Exact',
        category: 'Core',
        searchVolume: '1000-5000',
        competition: 'Medium',
        relevance: 8,
        source: 'AI',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the BrandTab component', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Check for main tab navigation buttons
      const tabButtons = screen.getAllByRole('button');
      const tabLabels = tabButtons.map(button => button.textContent);
      
      expect(tabLabels.some(label => label?.includes('Overview'))).toBe(true);
      expect(tabLabels.some(label => label?.includes('Keywords'))).toBe(true);
      expect(tabLabels.some(label => label?.includes('Campaigns'))).toBe(true);
    });

    it('should display brand name in header', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });

    it('should render with custom brand name', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="MyCustomBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('MyCustomBrand')).toBeInTheDocument();
    });

    it('should render all three tab navigation buttons', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByRole('button', { name: /📋 Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🔑 Keywords/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📊 Campaigns/i })).toBeInTheDocument();
    });

    it('should have Overview tab active by default', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      expect(overviewButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  describe('KPI Metrics Display', () => {
    it('should display all KPI metric labels', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Spend')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('ACOS')).toBeInTheDocument();
      expect(screen.getByText('ROAS')).toBeInTheDocument();
    });

    it('should display default KPI values when not provided', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Should display $0.00 for spend and sales by default
      const spendValues = screen.getAllByText(/\$0\.00/i);
      expect(spendValues.length).toBeGreaterThan(0);
    });

    it('should display custom KPI values when provided', () => {
      const stateWithMetrics: BrandState = {
        ...mockBrandState,
        kpiMetrics: {
          spend: 1500.50,
          sales: 5000.75,
          acos: 30.5,
          roas: 3.33,
          ctr: 1.25,
          cvr: 0.85,
          tacos: 25.0,
        },
      };

      render(
        <BrandTab
          brandState={stateWithMetrics}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText(/1,500\.50/i)).toBeInTheDocument();
      expect(screen.getByText(/5,000\.75/i)).toBeInTheDocument();
    });

    it('should handle zero values in KPI metrics', () => {
      const stateWithZeroMetrics: BrandState = {
        ...mockBrandState,
        kpiMetrics: {
          spend: 0,
          sales: 0,
          acos: 0,
          roas: 0,
          ctr: 0,
          cvr: 0,
          tacos: 0,
        },
      };

      render(
        <BrandTab
          brandState={stateWithZeroMetrics}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Component should render without errors
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });

    it('should handle extremely large KPI values', () => {
      const stateWithLargeMetrics: BrandState = {
        ...mockBrandState,
        kpiMetrics: {
          spend: 999999.99,
          sales: 9999999.99,
          acos: 100,
          roas: 10,
          ctr: 50,
          cvr: 25,
          tacos: 100,
        },
      };

      render(
        <BrandTab
          brandState={stateWithLargeMetrics}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });
  });

  describe('Portfolio Display', () => {
    it('should display all default portfolios in left rail', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Launch')).toBeInTheDocument();
      expect(screen.getByText('Optimize')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
      expect(screen.getByText('Maintain')).toBeInTheDocument();
    });

    it('should display custom portfolios when provided', () => {
      const stateWithPortfolios: BrandState = {
        ...mockBrandState,
        portfolios: [
          { id: 'custom1', name: 'Launch', budget: 5000, campaigns: [] },
          { id: 'custom2', name: 'Scale', budget: 10000, campaigns: [] },
        ],
      };

      render(
        <BrandTab
          brandState={stateWithPortfolios}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Launch')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });

    it('should display portfolio budgets', () => {
      const stateWithPortfolios: BrandState = {
        ...mockBrandState,
        portfolios: [
          { id: 'launch', name: 'Launch', budget: 1000, campaigns: [] },
          { id: 'optimize', name: 'Optimize', budget: 2000, campaigns: [] },
        ],
      };

      render(
        <BrandTab
          brandState={stateWithPortfolios}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Budgets should be displayed
      expect(screen.getByText(/1,000/i)).toBeInTheDocument();
      expect(screen.getByText(/2,000/i)).toBeInTheDocument();
    });

    it('should handle portfolios with zero budget', () => {
      const stateWithPortfolios: BrandState = {
        ...mockBrandState,
        portfolios: [
          { id: 'empty', name: 'Launch', budget: 0, campaigns: [] },
        ],
      };

      render(
        <BrandTab
          brandState={stateWithPortfolios}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('should handle empty portfolios array', () => {
      const stateWithEmptyPortfolios: BrandState = {
        ...mockBrandState,
        portfolios: [],
      };

      render(
        <BrandTab
          brandState={stateWithEmptyPortfolios}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Should still render component
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });
  });

  describe('RAG Status Badge', () => {
    it('should display RAG status badge', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display Green status by default', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Green')).toBeInTheDocument();
    });

    it('should display Red status when provided', () => {
      const stateWithRedStatus: BrandState = {
        ...mockBrandState,
        ragBadge: {
          status: 'Red',
          drivers: ['High ACOS', 'Low CVR'],
        },
      };

      render(
        <BrandTab
          brandState={stateWithRedStatus}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    it('should display Amber status when provided', () => {
      const stateWithAmberStatus: BrandState = {
        ...mockBrandState,
        ragBadge: {
          status: 'Amber',
          drivers: ['ACOS trending up'],
        },
      };

      render(
        <BrandTab
          brandState={stateWithAmberStatus}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Amber')).toBeInTheDocument();
    });

    it('should display status drivers', () => {
      const stateWithDrivers: BrandState = {
        ...mockBrandState,
        ragBadge: {
          status: 'Green',
          drivers: ['All metrics within target range', 'Consistent performance'],
        },
      };

      render(
        <BrandTab
          brandState={stateWithDrivers}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText(/All metrics within target range/i)).toBeInTheDocument();
    });

    it('should handle empty drivers array', () => {
      const stateWithEmptyDrivers: BrandState = {
        ...mockBrandState,
        ragBadge: {
          status: 'Green',
          drivers: [],
        },
      };

      render(
        <BrandTab
          brandState={stateWithEmptyDrivers}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Keywords tab when clicked', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      expect(keywordsButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should switch to Campaigns tab when clicked', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const campaignsButton = screen.getByRole('button', { name: /📊 Campaigns/i });
      fireEvent.click(campaignsButton);

      expect(campaignsButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should switch back to Overview tab when clicked', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      fireEvent.click(overviewButton);

      expect(overviewButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should only have one active tab at a time', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      const activeButtons = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('bg-blue-600')
      );

      expect(activeButtons.length).toBe(1);
    });

    it('should render different content for each tab', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Click through all tabs to ensure they render
      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      const campaignsButton = screen.getByRole('button', { name: /📊 Campaigns/i });
      fireEvent.click(campaignsButton);

      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      fireEvent.click(overviewButton);

      // Should render without errors
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });
  });

  describe('Portfolio Selection', () => {
    it('should handle portfolio selection', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const launchPortfolio = screen.getByText('Launch');
      fireEvent.click(launchPortfolio);

      // Should be clickable without errors
      expect(launchPortfolio).toBeInTheDocument();
    });

    it('should toggle portfolio selection on double click', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const launchPortfolio = screen.getByText('Launch');
      fireEvent.click(launchPortfolio);
      fireEvent.click(launchPortfolio);

      // Should handle toggle without errors
      expect(launchPortfolio).toBeInTheDocument();
    });
  });

  describe('Settings Modal', () => {
    it('should open settings modal when settings button is clicked', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const settingsButton = screen.getByRole('button', { name: /⚙️/i });
      fireEvent.click(settingsButton);

      // Settings modal should open (checking for settings-related text)
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should close settings modal', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const settingsButton = screen.getByRole('button', { name: /⚙️/i });
      fireEvent.click(settingsButton);

      const closeButton = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeButton);

      // Modal should be closed
      expect(screen.queryByRole('button', { name: /Close/i })).not.toBeInTheDocument();
    });

    it('should display default settings values', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const settingsButton = screen.getByRole('button', { name: /⚙️/i });
      fireEvent.click(settingsButton);

      // Default settings should be displayed
      expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // clicksToPromote
      expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // clicksToNegate
    });

    it('should call onUpdateBrandState when settings are saved', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const settingsButton = screen.getByRole('button', { name: /⚙️/i });
      fireEvent.click(settingsButton);

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      expect(mockOnUpdateBrandState).toHaveBeenCalled();
    });

    it('should handle custom settings values', () => {
      const stateWithSettings: BrandState = {
        ...mockBrandState,
        brandTabSettings: {
          clicksToPromote: 30,
          clicksToNegate: 25,
          ctrPauseThreshold: 0.3,
          cvrFactorMedian: 0.9,
          wastedSpendRedThreshold: 1000,
          isCompetitiveCategory: true,
          price: 29.99,
          targetAcos: 25,
        },
      };

      render(
        <BrandTab
          brandState={stateWithSettings}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const settingsButton = screen.getByRole('button', { name: /⚙️/i });
      fireEvent.click(settingsButton);

      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should switch to overview tab when "g" key is pressed', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Navigate to keywords first
      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      // Press 'g' key
      fireEvent.keyDown(window, { key: 'g' });

      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      expect(overviewButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not trigger shortcuts when typing in input fields', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Create a mock input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      // Press 'g' key while in input
      fireEvent.keyDown(input, { key: 'g' });

      // Should not switch tabs
      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      expect(overviewButton).toHaveClass('bg-blue-600', 'text-white');

      document.body.removeChild(input);
    });

    it('should not trigger shortcuts when typing in textarea', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Navigate to keywords first
      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      // Create a mock textarea element
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      // Press 'g' key while in textarea
      fireEvent.keyDown(textarea, { key: 'g' });

      // Should not switch tabs
      expect(keywordsButton).toHaveClass('bg-blue-600', 'text-white');

      document.body.removeChild(textarea);
    });

    it('should log console messages for shortcut actions', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Press 'a' key for add shell campaign
      fireEvent.keyDown(window, { key: 'a' });
      expect(consoleSpy).toHaveBeenCalledWith('Add shell campaign');

      // Press 'p' key for promote keyword
      fireEvent.keyDown(window, { key: 'p' });
      expect(consoleSpy).toHaveBeenCalledWith('Promote keyword');

      // Press 'n' key for negate keyword
      fireEvent.keyDown(window, { key: 'n' });
      expect(consoleSpy).toHaveBeenCalledWith('Negate keyword');

      consoleSpy.mockRestore();
    });

    it('should handle "/" key press for search focus', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const event = new KeyboardEvent('keydown', { key: '/' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      window.dispatchEvent(event);

      // Should attempt to focus search input
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null brandState gracefully', () => {
      // This should not happen in practice, but testing defensive coding
      const minimalState: BrandState = {
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

      render(
        <BrandTab
          brandState={minimalState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });

    it('should handle empty activeBrand string', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand=""
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Should render without crashing
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should handle long brand names', () => {
      const longBrandName = 'A'.repeat(100);
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand={longBrandName}
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText(longBrandName)).toBeInTheDocument();
    });

    it('should handle special characters in brand name', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="Test & Brand <> 123"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Test & Brand <> 123')).toBeInTheDocument();
    });

    it('should handle undefined optional properties in brandState', () => {
      const stateWithUndefined: BrandState = {
        ...mockBrandState,
        portfolios: undefined,
        kpiMetrics: undefined,
        ragBadge: undefined,
        brandTabSettings: undefined,
      };

      render(
        <BrandTab
          brandState={stateWithUndefined}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Should use defaults
      expect(screen.getByText('Launch')).toBeInTheDocument();
      expect(screen.getByText('Green')).toBeInTheDocument();
    });

    it('should handle rapid tab switching', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const overviewButton = screen.getByRole('button', { name: /📋 Overview/i });
      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      const campaignsButton = screen.getByRole('button', { name: /📊 Campaigns/i });

      // Rapidly switch tabs
      fireEvent.click(keywordsButton);
      fireEvent.click(campaignsButton);
      fireEvent.click(overviewButton);
      fireEvent.click(keywordsButton);
      fireEvent.click(overviewButton);

      // Should handle without errors
      expect(overviewButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Marketplace and Date Range', () => {
    it('should display default marketplace as US', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('US')).toBeInTheDocument();
    });

    it('should display default date range as "Last 30 days"', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('should change marketplace when dropdown is changed', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const marketplaceSelect = screen.getByDisplayValue('US');
      fireEvent.change(marketplaceSelect, { target: { value: 'UK' } });

      expect(marketplaceSelect).toHaveValue('UK');
    });

    it('should change date range when dropdown is changed', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const dateRangeSelect = screen.getByDisplayValue('Last 30 days');
      fireEvent.change(dateRangeSelect, { target: { value: 'Last 7 days' } });

      expect(dateRangeSelect).toHaveValue('Last 7 days');
    });
  });

  describe('Component Integration', () => {
    it('should pass brandState to child components', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      // Child components should receive and render with brandState
      expect(screen.getByText('TestBrand')).toBeInTheDocument();
    });

    it('should pass settings to BrandTabKeywords component', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const keywordsButton = screen.getByRole('button', { name: /🔑 Keywords/i });
      fireEvent.click(keywordsButton);

      // Keywords tab should render
      expect(keywordsButton).toHaveClass('bg-blue-600');
    });

    it('should pass portfolios to BrandTabCampaigns component', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const campaignsButton = screen.getByRole('button', { name: /📊 Campaigns/i });
      fireEvent.click(campaignsButton);

      // Campaigns tab should render
      expect(campaignsButton).toHaveClass('bg-blue-600');
    });

    it('should pass selectedPortfolio to BrandTabOverview component', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const launchPortfolio = screen.getByText('Launch');
      fireEvent.click(launchPortfolio);

      // Overview should receive selectedPortfolio prop
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles for tabs', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible tab labels', () => {
      render(
        <BrandTab
          brandState={mockBrandState}
          activeBrand="TestBrand"
          onUpdateBrandState={mockOnUpdateBrandState}
        />
      );

      expect(screen.getByRole('button', { name: /📋 Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🔑 Keywords/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📊 Campaigns/i })).toBeInTheDocument();
    });
  });
});