import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeywordClusters } from '../../components/KeywordClusters';

describe('KeywordClusters', () => {
  const mockOnClear = vi.fn();
  const mockClusters = {
    'Wireless Audio': ['wireless headphones', 'bluetooth earbuds', 'wireless speakers'],
    'Gaming': ['gaming headset', 'gaming keyboard', 'gaming mouse'],
    'Office': ['office chair', 'desk lamp', 'monitor stand'],
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the clusters heading', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText(/Keyword Clusters/i)).toBeInTheDocument();
    });

    it('should render clear button', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      expect(screen.getByRole('button', { name: /Clear Clusters/i })).toBeInTheDocument();
    });

    it('should render all cluster names', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText('Wireless Audio')).toBeInTheDocument();
      expect(screen.getByText('Gaming')).toBeInTheDocument();
      expect(screen.getByText('Office')).toBeInTheDocument();
    });

    it('should display keyword count badges for each cluster', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render keywords in each cluster', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText(/• wireless headphones/i)).toBeInTheDocument();
      expect(screen.getByText(/• gaming headset/i)).toBeInTheDocument();
      expect(screen.getByText(/• office chair/i)).toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    it('should call onClear when clear button is clicked', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      const clearButton = screen.getByRole('button', { name: /Clear Clusters/i });
      fireEvent.click(clearButton);
      
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Large Cluster Handling', () => {
    it('should show only first 10 keywords and display more indicator', () => {
      const largeCluster = {
        'Large Cluster': Array.from({ length: 15 }, (_, i) => `keyword ${i + 1}`),
      };
      
      render(<KeywordClusters clusters={largeCluster} onClear={mockOnClear} />);
      
      expect(screen.getByText(/• keyword 1/i)).toBeInTheDocument();
      expect(screen.getByText(/• keyword 10/i)).toBeInTheDocument();
      expect(screen.queryByText(/• keyword 11/i)).not.toBeInTheDocument();
      expect(screen.getByText(/\+5 more\.\.\./i)).toBeInTheDocument();
    });

    it('should not show more indicator for clusters with 10 or fewer keywords', () => {
      const smallCluster = {
        'Small Cluster': Array.from({ length: 10 }, (_, i) => `keyword ${i + 1}`),
      };
      
      render(<KeywordClusters clusters={smallCluster} onClear={mockOnClear} />);
      
      expect(screen.queryByText(/more\.\.\./i)).not.toBeInTheDocument();
    });
  });

  describe('Empty Clusters', () => {
    it('should render empty clusters object', () => {
      render(<KeywordClusters clusters={{}} onClear={mockOnClear} />);
      
      expect(screen.getByText(/Keyword Clusters/i)).toBeInTheDocument();
    });

    it('should handle cluster with empty keyword array', () => {
      const emptyClusters = { 'Empty Cluster': [] };
      render(<KeywordClusters clusters={emptyClusters} onClear={mockOnClear} />);
      
      expect(screen.getByText('Empty Cluster')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should use responsive grid classes', () => {
      const { container } = render(
        <KeywordClusters clusters={mockClusters} onClear={mockOnClear} />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should provide title attribute for truncated keywords', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);
      
      const firstKeyword = screen.getByText(/• wireless headphones/i);
      expect(firstKeyword).toHaveAttribute('title', 'wireless headphones');
    });
  });
});