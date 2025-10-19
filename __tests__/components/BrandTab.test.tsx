import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandTab } from '../../components/BrandTab/BrandTab';
import { BrandState } from '../../types';

describe('BrandTab', () => {
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

  const mockOnUpdateBrandState = vi.fn();

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

  it('should display KPI metrics', () => {
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

  it('should display portfolios in left rail', () => {
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

  it('should display RAG status badge', () => {
    render(
      <BrandTab
        brandState={mockBrandState}
        activeBrand="TestBrand"
        onUpdateBrandState={mockOnUpdateBrandState}
      />
    );

    // Check that Status label exists in header
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
