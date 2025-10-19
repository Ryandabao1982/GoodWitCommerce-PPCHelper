import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeywordClusters } from '../../components/KeywordClusters';

describe('KeywordClusters', () => {
  const mockOnClear = vi.fn();
  
  const sampleClusters = {
    'wireless audio': ['wireless headphones', 'bluetooth earbuds', 'wireless speakers'],
    'gaming': ['gaming headset', 'gaming mouse', 'gaming keyboard'],
    'noise canceling': ['noise canceling headphones', 'anc earbuds']
  };

  beforeEach(() => {
    mockOnClear.mockClear();
  });

  describe('rendering', () => {
    it('should render keyword clusters title', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      expect(screen.getByText('Keyword Clusters')).toBeInTheDocument();
    });

    it('should render clear clusters button', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      expect(screen.getByRole('button', { name: /clear clusters/i })).toBeInTheDocument();
    });

    it('should render all cluster names', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText('wireless audio')).toBeInTheDocument();
      expect(screen.getByText('gaming')).toBeInTheDocument();
      expect(screen.getByText('noise canceling')).toBeInTheDocument();
    });

    it('should display keyword count badges', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // wireless audio cluster
      expect(screen.getByText('2')).toBeInTheDocument(); // noise canceling cluster
    });

    it('should render keywords in each cluster', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText(/wireless headphones/)).toBeInTheDocument();
      expect(screen.getByText(/gaming headset/)).toBeInTheDocument();
      expect(screen.getByText(/noise canceling headphones/)).toBeInTheDocument();
    });

    it('should render empty clusters object', () => {
      render(<KeywordClusters clusters={{}} onClear={mockOnClear} />);
      expect(screen.getByText('Keyword Clusters')).toBeInTheDocument();
    });

    it('should limit displayed keywords to 10 per cluster', () => {
      const largeCluster = {
        'large': Array.from({ length: 15 }, (_, i) => `keyword ${i + 1}`)
      };
      
      render(<KeywordClusters clusters={largeCluster} onClear={mockOnClear} />);
      
      expect(screen.getByText(/keyword 1/)).toBeInTheDocument();
      expect(screen.getByText(/keyword 10/)).toBeInTheDocument();
      expect(screen.getByText(/\+5 more\.\.\./)).toBeInTheDocument();
    });

    it('should show "more" indicator for clusters with over 10 keywords', () => {
      const largeCluster = {
        'big cluster': Array.from({ length: 12 }, (_, i) => `kw ${i}`)
      };
      
      render(<KeywordClusters clusters={largeCluster} onClear={mockOnClear} />);
      expect(screen.getByText(/\+2 more\.\.\./)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      const clearButton = screen.getByRole('button', { name: /clear clusters/i });
      await user.click(clearButton);
      
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });

    it('should call onClear multiple times', async () => {
      const user = userEvent.setup();
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      const clearButton = screen.getByRole('button', { name: /clear clusters/i });
      await user.click(clearButton);
      await user.click(clearButton);
      
      expect(mockOnClear).toHaveBeenCalledTimes(2);
    });
  });

  describe('styling and layout', () => {
    it('should use grid layout for clusters', () => {
      const { container } = render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid columns', () => {
      const { container } = render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      const grid = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should support dark mode classes', () => {
      const { container } = render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      const darkElement = container.querySelector('.dark\\:bg-gray-800');
      expect(darkElement).toBeInTheDocument();
    });

    it('should have rounded corners and shadow', () => {
      const { container } = render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      const card = container.querySelector('.rounded-lg.shadow-md');
      expect(card).toBeInTheDocument();
    });
  });

  describe('keyword display', () => {
    it('should truncate long keywords with title attribute', () => {
      const longKeyword = 'very long keyword that should be truncated';
      const clustersWithLongKeyword = {
        'test': [longKeyword]
      };
      
      const { container } = render(<KeywordClusters clusters={clustersWithLongKeyword} onClear={mockOnClear} />);
      const listItem = container.querySelector('li[title]');
      
      expect(listItem).toHaveAttribute('title', longKeyword);
    });

    it('should display keywords with bullet points', () => {
      render(<KeywordClusters clusters={sampleClusters} onClear={mockOnClear} />);
      
      const listItems = screen.getAllByText(/•/);
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('single cluster', () => {
    it('should render with one cluster', () => {
      const singleCluster = {
        'only one': ['keyword1', 'keyword2']
      };
      
      render(<KeywordClusters clusters={singleCluster} onClear={mockOnClear} />);
      expect(screen.getByText('only one')).toBeInTheDocument();
    });
  });
});