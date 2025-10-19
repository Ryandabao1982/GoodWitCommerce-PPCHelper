import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../../components/Dashboard';
import { KeywordData } from '../../types';

describe('Dashboard', () => {
  const mockParseVolume = vi.fn((vol: string) => {
    const num = parseInt(vol.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  });

  const sampleData: KeywordData[] = [
    {
      keyword: 'wireless headphones',
      type: 'Broad',
      category: 'Core',
      searchVolume: '10000',
      competition: 'High',
      relevance: 9,
      source: 'AI'
    },
    {
      keyword: 'bluetooth earbuds',
      type: 'Phrase',
      category: 'Opportunity',
      searchVolume: '5000',
      competition: 'Medium',
      relevance: 7,
      source: 'Web'
    },
    {
      keyword: 'noise canceling headphones',
      type: 'Exact',
      category: 'Low-hanging Fruit',
      searchVolume: '2000',
      competition: 'Low',
      relevance: 5,
      source: 'AI'
    }
  ];

  beforeEach(() => {
    mockParseVolume.mockClear();
  });

  describe('rendering', () => {
    it('should render dashboard title', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      expect(screen.getByText('Keyword Research Dashboard')).toBeInTheDocument();
    });

    it('should display keyword count with plural', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      expect(screen.getByText('3 keywords found')).toBeInTheDocument();
    });

    it('should display keyword count with singular', () => {
      render(<Dashboard data={[sampleData[0]]} parseVolume={mockParseVolume} />);
      expect(screen.getByText('1 keyword found')).toBeInTheDocument();
    });

    it('should render all keywords in desktop view', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      sampleData.forEach(item => {
        const keywords = screen.getAllByText(item.keyword);
        expect(keywords.length).toBeGreaterThan(0);
      });
    });

    it('should render with empty data', () => {
      render(<Dashboard data={[]} parseVolume={mockParseVolume} />);
      expect(screen.getByText('0 keywords found')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort by keyword alphabetically ascending', async () => {
      const user = userEvent.setup();
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const keywordHeader = screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Keyword');
      });
      
      await user.click(keywordHeader);
      
      // Should be descending by default after first click (relevance is default)
      // Click again for ascending
      await user.click(keywordHeader);
      
      // Verify sort indicator appears
      expect(keywordHeader.textContent).toContain('↑');
    });

    it('should toggle sort direction on repeated clicks', async () => {
      const user = userEvent.setup();
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const volumeHeader = screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Volume');
      });
      
      await user.click(volumeHeader);
      expect(volumeHeader.textContent).toContain('↓');
      
      await user.click(volumeHeader);
      expect(volumeHeader.textContent).toContain('↑');
    });

    it('should call parseVolume when sorting by volume', async () => {
      const user = userEvent.setup();
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const volumeHeader = screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Volume');
      });
      
      await user.click(volumeHeader);
      
      expect(mockParseVolume).toHaveBeenCalled();
    });

    it('should sort by competition', async () => {
      const user = userEvent.setup();
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const compHeader = screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Competition');
      });
      
      await user.click(compHeader);
      expect(compHeader.textContent).toContain('↓');
    });

    it('should sort by relevance', async () => {
      const user = userEvent.setup();
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const relHeader = screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Relevance');
      });
      
      await user.click(relHeader);
      // Already sorted by relevance desc by default, so this should toggle to asc
      expect(relHeader.textContent).toContain('↑');
    });
  });

  describe('badge colors', () => {
    it('should show green badge for low competition', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      const { container } = render(<Dashboard data={[sampleData[2]]} parseVolume={mockParseVolume} />);
      
      const lowBadge = container.querySelector('.bg-green-100');
      expect(lowBadge).toBeInTheDocument();
    });

    it('should show yellow badge for medium competition', () => {
      const { container } = render(<Dashboard data={[sampleData[1]]} parseVolume={mockParseVolume} />);
      
      const mediumBadge = container.querySelector('.bg-yellow-100');
      expect(mediumBadge).toBeInTheDocument();
    });

    it('should show red badge for high competition', () => {
      const { container } = render(<Dashboard data={[sampleData[0]]} parseVolume={mockParseVolume} />);
      
      const highBadge = container.querySelector('.bg-red-100');
      expect(highBadge).toBeInTheDocument();
    });

    it('should show purple badge for AI source', () => {
      const { container } = render(<Dashboard data={[sampleData[0]]} parseVolume={mockParseVolume} />);
      
      const aiBadge = container.querySelector('.bg-purple-100');
      expect(aiBadge).toBeInTheDocument();
    });

    it('should show blue badge for Web source', () => {
      const { container } = render(<Dashboard data={[sampleData[1]]} parseVolume={mockParseVolume} />);
      
      const webBadge = container.querySelector('.bg-blue-100');
      expect(webBadge).toBeInTheDocument();
    });
  });

  describe('relevance display', () => {
    it('should display relevance as score out of 10', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      expect(screen.getAllByText(/\/10/)).toHaveLength(sampleData.length * 2); // Desktop + mobile views
    });

    it('should render progress bar for relevance', () => {
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const progressBars = container.querySelectorAll('.bg-blue-600');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('responsive behavior', () => {
    it('should render mobile card view', () => {
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const mobileView = container.querySelector('.block.md\\:hidden');
      expect(mobileView).toBeInTheDocument();
    });

    it('should render desktop table view', () => {
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const desktopView = container.querySelector('.hidden.md\\:block');
      expect(desktopView).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have table structure', () => {
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should have proper table headers', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'TH' && content.includes('Keyword');
      })).toBeInTheDocument();
    });

    it('should have clickable column headers for sorting', () => {
      render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('dark mode support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<Dashboard data={sampleData} parseVolume={mockParseVolume} />);
      
      const darkElements = container.querySelectorAll('.dark\\:bg-gray-800, .dark\\:text-white');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });
});