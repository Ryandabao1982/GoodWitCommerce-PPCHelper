import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeywordClusters } from '../../components/KeywordClusters';

describe('KeywordClusters', () => {
  const mockOnClear = vi.fn();
  const mockOnClusterClick = vi.fn();
  const mockClusters = {
    'Wireless Audio': ['wireless headphones', 'bluetooth earbuds', 'wireless speakers'],
    Gaming: ['gaming headset', 'gaming keyboard', 'gaming mouse'],
    Office: ['office chair', 'desk lamp', 'monitor stand'],
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

    it('should render view mode toggle buttons', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('Bubble view')).toBeInTheDocument();
    });

    it('should render all cluster names in grid view', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      expect(screen.getByText('Wireless Audio')).toBeInTheDocument();
      expect(screen.getByText('Gaming')).toBeInTheDocument();
      expect(screen.getByText('Office')).toBeInTheDocument();
    });

    it('should display keyword count badges for each cluster', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      // Each cluster has 3 keywords, so there should be three badges showing "3"
      const badges = screen.getAllByText('3');
      expect(badges.length).toBe(3);
    });

    it('should render keywords in each cluster', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      expect(screen.getByText(/• wireless headphones/i)).toBeInTheDocument();
      expect(screen.getByText(/• gaming headset/i)).toBeInTheDocument();
      expect(screen.getByText(/• office chair/i)).toBeInTheDocument();
    });

    it('should show helper text when onClusterClick is provided', () => {
      render(
        <KeywordClusters
          clusters={mockClusters}
          onClear={mockOnClear}
          onClusterClick={mockOnClusterClick}
        />
      );

      expect(screen.getByText(/Click on any cluster to filter keywords/i)).toBeInTheDocument();
    });

    it('should not show helper text when onClusterClick is not provided', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      expect(
        screen.queryByText(/Click on any cluster to filter keywords/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    it('should switch to bubble view when bubble button is clicked', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      const bubbleButton = screen.getByLabelText('Bubble view');
      fireEvent.click(bubbleButton);

      // In bubble view, clusters should not show individual keyword list items
      expect(screen.queryByText(/• wireless headphones/i)).not.toBeInTheDocument();
    });

    it('should switch back to grid view when grid button is clicked', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      // Switch to bubble view first
      const bubbleButton = screen.getByLabelText('Bubble view');
      fireEvent.click(bubbleButton);

      // Switch back to grid view
      const gridButton = screen.getByLabelText('Grid view');
      fireEvent.click(gridButton);

      // In grid view, keywords should be visible
      expect(screen.getByText(/• wireless headphones/i)).toBeInTheDocument();
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

  describe('Cluster Click Functionality', () => {
    it('should call onClusterClick when a cluster is clicked in grid view', () => {
      render(
        <KeywordClusters
          clusters={mockClusters}
          onClear={mockOnClear}
          onClusterClick={mockOnClusterClick}
        />
      );

      const wirelessCluster = screen.getByText('Wireless Audio');
      fireEvent.click(wirelessCluster.closest('div[role="button"]')!);

      expect(mockOnClusterClick).toHaveBeenCalledTimes(1);
      expect(mockOnClusterClick).toHaveBeenCalledWith('Wireless Audio', [
        'wireless headphones',
        'bluetooth earbuds',
        'wireless speakers',
      ]);
    });

    it('should call onClusterClick when Enter key is pressed on a cluster', () => {
      render(
        <KeywordClusters
          clusters={mockClusters}
          onClear={mockOnClear}
          onClusterClick={mockOnClusterClick}
        />
      );

      const wirelessCluster = screen.getByText('Wireless Audio').closest('div[role="button"]')!;
      fireEvent.keyDown(wirelessCluster, { key: 'Enter', code: 'Enter' });

      expect(mockOnClusterClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClusterClick when onClusterClick is not provided', () => {
      render(<KeywordClusters clusters={mockClusters} onClear={mockOnClear} />);

      const wirelessCluster = screen.getByText('Wireless Audio');
      fireEvent.click(wirelessCluster.closest('div')!);

      // Should not throw error, just not call anything
      expect(mockOnClusterClick).not.toHaveBeenCalled();
    });
  });

  describe('Large Cluster Handling', () => {
    it('should show only first 10 keywords and display more indicator', () => {
      const largeCluster = {
        'Large Cluster': Array.from({ length: 15 }, (_, i) => `keyword ${i + 1}`),
      };

      render(<KeywordClusters clusters={largeCluster} onClear={mockOnClear} />);

      // Check for exact keyword text to avoid matching "keyword 10" when looking for "keyword 1"
      const allItems = screen.getAllByRole('listitem');
      const itemTexts = allItems.map((item) => item.textContent);

      // Should show keyword 1 through 10
      expect(
        itemTexts.some((text) => text?.includes('keyword 1') && !text?.includes('keyword 10'))
      ).toBe(true);
      expect(itemTexts.some((text) => text?.includes('keyword 10'))).toBe(true);
      expect(itemTexts.some((text) => text?.includes('keyword 11'))).toBe(false);
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
    it('should use responsive grid classes in grid view', () => {
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

    it('should have proper role and tabIndex for clickable clusters', () => {
      render(
        <KeywordClusters
          clusters={mockClusters}
          onClear={mockOnClear}
          onClusterClick={mockOnClusterClick}
        />
      );

      const wirelessCluster = screen.getByText('Wireless Audio').closest('div[role="button"]')!;
      expect(wirelessCluster).toHaveAttribute('role', 'button');
      expect(wirelessCluster).toHaveAttribute('tabIndex', '0');
    });
  });
});
