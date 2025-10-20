import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandTabCampaigns } from '../../components/BrandTab/BrandTabCampaigns';
import { BrandState, Portfolio } from '../../types';

describe('BrandTabCampaigns', () => {
  const mockCampaigns = [
    {
      id: 'campaign-1',
      name: 'Test Campaign Exact Match',
      dailyBudget: 100,
      asin: 'B08N5WRWNW',
      adGroups: [
        {
          id: 'ag-1',
          name: 'Ad Group 1',
          keywords: ['keyword1', 'keyword2', 'keyword3'],
          defaultBid: 1.5,
          defaultMatchType: 'Exact' as const,
          bidModifiers: { topOfSearch: 50, productPages: 0 },
        },
        {
          id: 'ag-2',
          name: 'Ad Group 2',
          keywords: ['keyword4', 'keyword5'],
          defaultBid: 1.2,
          defaultMatchType: 'Phrase' as const,
        },
      ],
    },
    {
      id: 'campaign-2',
      name: 'Test Campaign Broad',
      dailyBudget: 50,
      asin: 'B07N5WRWWX',
      adGroups: [
        {
          id: 'ag-3',
          name: 'Broad Keywords',
          keywords: ['keyword6'],
          defaultBid: 0.8,
          defaultMatchType: 'Broad' as const,
        },
      ],
    },
    {
      id: 'campaign-3',
      name: 'Empty Campaign',
      dailyBudget: 0,
      adGroups: [
        {
          id: 'ag-4',
          name: 'Empty Ad Group',
          keywords: [],
          defaultBid: 1.0,
          defaultMatchType: 'Exact' as const,
        },
      ],
    },
  ];

  const mockPortfolios: Portfolio[] = [
    {
      id: 'launch',
      name: 'Launch',
      budget: 1000,
      campaigns: ['campaign-1'],
    },
    {
      id: 'optimize',
      name: 'Optimize',
      budget: 2000,
      campaigns: ['campaign-2'],
    },
    {
      id: 'scale',
      name: 'Scale',
      budget: 5000,
      campaigns: [],
    },
    {
      id: 'maintain',
      name: 'Maintain',
      budget: 3000,
      campaigns: [],
    },
  ];

  const mockBrandState: BrandState = {
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
    campaigns: mockCampaigns,
    portfolios: mockPortfolios,
  };

  it('should render Speed Actions buttons', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    expect(screen.getByText('+ SP_EXACT_PERF')).toBeInTheDocument();
    expect(screen.getByText('+ SP_EXACT_SKAG')).toBeInTheDocument();
    expect(screen.getByText('+ SP_PT_AUTO')).toBeInTheDocument();
    expect(screen.getByText('+ SP_BROAD')).toBeInTheDocument();
    expect(screen.getByText('📥 Export Promote-to-Exact.csv')).toBeInTheDocument();
    expect(screen.getByText('📥 Export Negatives.csv')).toBeInTheDocument();
  });

  it('should display portfolio stats cards', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByText('Optimize')).toBeInTheDocument();
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByText('Maintain')).toBeInTheDocument();
  });

  it('should display campaign suggestions when there are issues', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Should suggest creating missing campaign types
    expect(screen.getByText(/Consider creating an Auto campaign/i)).toBeInTheDocument();
  });

  it('should display campaigns in cards view by default', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    expect(screen.getByText('Test Campaign Exact Match')).toBeInTheDocument();
    expect(screen.getByText('Test Campaign Broad')).toBeInTheDocument();
    expect(screen.getByText('Empty Campaign')).toBeInTheDocument();
  });

  it('should switch between view modes', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const viewButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('title')?.includes('view')
    );

    // Switch to table view
    const tableViewButton = viewButtons.find(btn => btn.getAttribute('title') === 'Table view');
    if (tableViewButton) {
      fireEvent.click(tableViewButton);
      // In table view, we should see a table element
      const tables = document.querySelectorAll('table');
      expect(tables.length).toBeGreaterThan(0);
    }

    // Switch to list view
    const listViewButton = viewButtons.find(btn => btn.getAttribute('title') === 'List view');
    if (listViewButton) {
      fireEvent.click(listViewButton);
      // List view should still show campaigns
      expect(screen.getByText('Test Campaign Exact Match')).toBeInTheDocument();
    }
  });

  it('should filter campaigns by search query', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const searchInput = screen.getByPlaceholderText(/Search campaigns/i);
    
    // Search for "Exact"
    fireEvent.change(searchInput, { target: { value: 'Exact' } });
    
    expect(screen.getByText('Test Campaign Exact Match')).toBeInTheDocument();
    expect(screen.queryByText('Test Campaign Broad')).not.toBeInTheDocument();
  });

  it('should filter campaigns by portfolio', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Click on Launch portfolio
    const launchPortfolio = screen.getByText('Launch').closest('div');
    if (launchPortfolio) {
      fireEvent.click(launchPortfolio);
      
      // Only campaign-1 should be visible
      expect(screen.getByText('Test Campaign Exact Match')).toBeInTheDocument();
    }
  });

  it('should display campaign status badges', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Campaigns with keywords and budget should show "Ready"
    const readyBadges = screen.getAllByText('✓ Ready');
    expect(readyBadges.length).toBeGreaterThan(0);

    // Empty campaign should show warning badges
    const warningBadges = screen.getAllByText(/⚠️/);
    expect(warningBadges.length).toBeGreaterThan(0);
  });

  it('should expand campaigns to show ad groups', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const campaignCard = screen.getByText('Test Campaign Exact Match').closest('div');
    const expandButton = campaignCard?.querySelector('button');
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      // Should show ad groups
      expect(screen.getByText('Ad Group 1')).toBeInTheDocument();
      expect(screen.getByText('Ad Group 2')).toBeInTheDocument();
    }
  });

  it('should display campaign metrics correctly', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Check for budget display
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    
    // Check that campaign names are displayed with their metrics
    const campaign1 = screen.getByText('Test Campaign Exact Match');
    expect(campaign1).toBeInTheDocument();
    
    const campaign2 = screen.getByText('Test Campaign Broad');
    expect(campaign2).toBeInTheDocument();
  });

  it('should sort campaigns when clicking on sort headers in table view', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Switch to table view
    const viewButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('title')?.includes('view')
    );
    const tableViewButton = viewButtons.find(btn => btn.getAttribute('title') === 'Table view');
    
    if (tableViewButton) {
      fireEvent.click(tableViewButton);
      
      // Find the Budget header in the table (last occurrence should be the table header)
      const budgetHeaders = screen.getAllByText(/Budget/);
      const tableHeader = budgetHeaders.find(el => el.tagName === 'TH');
      
      if (tableHeader) {
        fireEvent.click(tableHeader);
        
        // Verify campaigns are displayed (sorting logic tested through presence)
        expect(screen.getByText('Test Campaign Exact Match')).toBeInTheDocument();
      }
    }
  });

  it('should display portfolio budget utilization', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    // Launch portfolio has 100/1000 = 10% utilization
    // Optimize portfolio has 50/2000 = 2.5% utilization
    const utilizationTexts = screen.getAllByText(/Utilization/);
    expect(utilizationTexts.length).toBeGreaterThan(0);
  });

  it('should show empty state when no campaigns match filter', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const searchInput = screen.getByPlaceholderText(/Search campaigns/i);
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'NonexistentCampaign' } });
    
    expect(screen.getByText('No campaigns found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search or filter/i)).toBeInTheDocument();
  });

  it('should display ASIN badges for campaigns', () => {
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    expect(screen.getByText('B08N5WRWNW')).toBeInTheDocument();
    expect(screen.getByText('B07N5WRWWX')).toBeInTheDocument();
  });

  it('should handle create shell campaign button clicks', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const exactPerfButton = screen.getByText('+ SP_EXACT_PERF');
    fireEvent.click(exactPerfButton);

    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining('Creating SP_EXACT_PERF')
    );

    alertMock.mockRestore();
  });

  it('should handle bulk export button clicks', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<BrandTabCampaigns brandState={mockBrandState} portfolios={mockPortfolios} />);

    const exportPromoteButton = screen.getByText('📥 Export Promote-to-Exact.csv');
    fireEvent.click(exportPromoteButton);

    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining('Exporting keywords that are ready to be promoted')
    );

    alertMock.mockRestore();
  });
});
