import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from '../../components/Dashboard';
import type { KeywordData } from '../../types';

describe('Dashboard', () => {
  const mockParseVolume = vi.fn((volume: string) => {
    const match = volume.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  });

  const mockKeywordData: KeywordData[] = [
    {
      keyword: 'wireless headphones',
      type: 'Broad',
      category: 'Core',
      searchVolume: '10,000',
      competition: 'High',
      relevance: 9,
      source: 'AI',
    },
    {
      keyword: 'bluetooth speakers',
      type: 'Phrase',
      category: 'Opportunity',
      searchVolume: '5,000',
      competition: 'Medium',
      relevance: 7,
      source: 'Web',
    },
    {
      keyword: 'gaming mouse',
      type: 'Exact',
      category: 'Low-hanging Fruit',
      searchVolume: '2,500',
      competition: 'Low',
      relevance: 8,
      source: 'AI',
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dashboard heading', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getByText(/Keyword Research Results/i)).toBeInTheDocument();
    });

    it('should display Total Keywords stat', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getByText(/Total Keywords/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display stats correctly for single keyword', () => {
      render(<Dashboard data={[mockKeywordData[0]]} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getByText(/Total Keywords/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render mobile card view on small screens', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const mobileView = document.querySelector('.block.md\\:hidden');
      expect(mobileView).toBeInTheDocument();
    });

    it('should render desktop table view', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const desktopView = document.querySelector('.hidden.md\\:block');
      expect(desktopView).toBeInTheDocument();
    });
  });

  describe('Table Headers', () => {
    it('should render all table column headers', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      // Use getAllByText to get multiple matches, then check for th elements
      const headers = screen.getAllByRole('columnheader');
      const headerTexts = headers.map(h => h.textContent);
      
      expect(headerTexts.some(t => t?.includes('Keyword'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Type'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Category'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Volume'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Competition'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Relevance'))).toBe(true);
      expect(headerTexts.some(t => t?.includes('Source'))).toBe(true);
    });
  });

  describe('Data Display', () => {
    it('should display all keywords in the data', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      mockKeywordData.forEach(item => {
        const keywords = screen.getAllByText(item.keyword);
        expect(keywords.length).toBeGreaterThan(0);
      });
    });

    it('should display search volumes', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getAllByText('10,000').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5,000').length).toBeGreaterThan(0);
    });

    it('should display competition levels with badges', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getAllByText('High').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Low').length).toBeGreaterThan(0);
    });

    it('should display relevance scores', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getAllByText(/9\/10/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/7\/10/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/8\/10/i).length).toBeGreaterThan(0);
    });

    it('should display source badges', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const aiSources = screen.getAllByText('AI');
      const webSources = screen.getAllByText('Web');
      
      expect(aiSources.length).toBeGreaterThan(0);
      expect(webSources.length).toBeGreaterThan(0);
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by keyword when keyword header is clicked', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const keywordHeader = screen.getByText(/^Keyword/).parentElement!;
      fireEvent.click(keywordHeader);
      
      expect(mockParseVolume).not.toHaveBeenCalled();
    });

    it('should sort by search volume when volume header is clicked', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const volumeHeader = screen.getByText(/^Volume/).parentElement!;
      fireEvent.click(volumeHeader);
      
      expect(mockParseVolume).toHaveBeenCalled();
    });

    it('should toggle sort direction on repeated clicks', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const keywordHeader = screen.getByText(/^Keyword/).parentElement!;
      
      // First click - descending
      fireEvent.click(keywordHeader);
      expect(keywordHeader.textContent).toContain('↓');
      
      // Second click - ascending
      fireEvent.click(keywordHeader);
      expect(keywordHeader.textContent).toContain('↑');
    });

    it('should sort by competition level', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const competitionHeader = screen.getByText(/^Competition/).parentElement!;
      fireEvent.click(competitionHeader);
      
      // Competition should be sorted: High > Medium > Low
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should sort by relevance', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const relevanceHeader = screen.getByText(/^Relevance/).parentElement!;
      fireEvent.click(relevanceHeader);
      
      // Check that parseVolume was not called for relevance sorting
      mockParseVolume.mockClear();
      fireEvent.click(relevanceHeader);
      
      // Relevance is a number field, doesn't need parseVolume
      expect(mockParseVolume).not.toHaveBeenCalled();
    });
  });

  describe('Badge Colors', () => {
    it('should apply correct color for low competition', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const competitionBadges = document.querySelectorAll('.bg-green-100, .dark\\:bg-green-900');
      expect(competitionBadges.length).toBeGreaterThan(0);
    });

    it('should apply correct color for medium competition', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const competitionBadges = document.querySelectorAll('.bg-yellow-100, .dark\\:bg-yellow-900');
      expect(competitionBadges.length).toBeGreaterThan(0);
    });

    it('should apply correct color for high competition', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const competitionBadges = document.querySelectorAll('.bg-red-100, .dark\\:bg-red-900');
      expect(competitionBadges.length).toBeGreaterThan(0);
    });

    it('should apply correct color for AI source', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const sourceBadges = document.querySelectorAll('.bg-purple-100, .dark\\:bg-purple-900');
      expect(sourceBadges.length).toBeGreaterThan(0);
    });

    it('should apply correct color for Web source', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const sourceBadges = document.querySelectorAll('.bg-blue-100, .dark\\:bg-blue-900');
      expect(sourceBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should display 0 keywords found when data is empty', () => {
      render(<Dashboard data={[]} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getByText(/0 keywords found/i)).toBeInTheDocument();
    });

    it('should render table structure even with empty data', () => {
      render(<Dashboard data={[]} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      expect(screen.getByText(/^Keyword/)).toBeInTheDocument();
      expect(screen.getByText(/^Type/)).toBeInTheDocument();
    });
  });

  describe('Relevance Progress Bar', () => {
    it('should render relevance progress bar in desktop view', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const progressBars = document.querySelectorAll('.bg-blue-600.h-2.rounded-full');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should set correct width for relevance bar', () => {
      render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      // Relevance of 9 should be 90% width
      const progressBars = document.querySelectorAll('.bg-blue-600.h-2.rounded-full');
      const hasCorrectWidth = Array.from(progressBars).some(bar => 
        (bar as HTMLElement).style.width === '90%'
      );
      expect(hasCorrectWidth).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should have mobile-specific classes', () => {
      const { container } = render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const mobileView = container.querySelector('.block.md\\:hidden');
      expect(mobileView).toBeInTheDocument();
    });

    it('should have desktop-specific classes', () => {
      const { container } = render(<Dashboard data={mockKeywordData} parseVolume={mockParseVolume} activeBrand="Test Brand" />);
      
      const desktopView = container.querySelector('.hidden.md\\:block');
      expect(desktopView).toBeInTheDocument();
    });
  });
});