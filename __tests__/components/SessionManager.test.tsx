import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionManager } from '../../components/SessionManager';

describe('SessionManager', () => {
  const mockOnClearBrandKeywords = vi.fn();
  const mockOnClusterKeywords = vi.fn();
  const searchedKeywords = ['headphones', 'earbuds', 'speakers'];

  beforeEach(() => {
    mockOnClearBrandKeywords.mockClear();
    mockOnClusterKeywords.mockClear();
  });

  describe('rendering', () => {
    it('should render session info header', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText('Session Info')).toBeInTheDocument();
    });

    it('should display keyword count with singular form', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1}
        />
      );
      
      expect(screen.getByText(/1 keyword in bank/)).toBeInTheDocument();
    });

    it('should display keyword count with plural form', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={25}
        />
      );
      
      expect(screen.getByText(/25 keywords in bank/)).toBeInTheDocument();
    });

    it('should display last searched keyword', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/Last: speakers/)).toBeInTheDocument();
    });

    it('should not display last searched keyword when empty', () => {
      render(
        <SessionManager
          searchedKeywords={[]}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={0}
        />
      );
      
      expect(screen.queryByText(/Last:/)).not.toBeInTheDocument();
    });

    it('should render cluster button', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByRole('button', { name: /cluster/i })).toBeInTheDocument();
    });

    it('should render clear button', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('cluster button states', () => {
    it('should disable cluster button when clustering', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={true}
          keywordCount={10}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /clustering/i });
      expect(clusterButton).toBeDisabled();
    });

    it('should disable cluster button when less than 2 keywords', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /cluster/i });
      expect(clusterButton).toBeDisabled();
    });

    it('should enable cluster button with 2 or more keywords', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={2}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /cluster/i });
      expect(clusterButton).not.toBeDisabled();
    });

    it('should show clustering spinner when clustering', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={true}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/Clustering\.\.\./)).toBeInTheDocument();
    });

    it('should show cluster emoji when not clustering', () => {
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/🧩 Cluster/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClusterKeywords when cluster button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /cluster/i });
      await user.click(clusterButton);
      
      expect(mockOnClusterKeywords).toHaveBeenCalledTimes(1);
    });

    it('should call onClearBrandKeywords when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      expect(mockOnClearBrandKeywords).toHaveBeenCalledTimes(1);
    });

    it('should not call onClusterKeywords when button is disabled', async () => {
      const user = userEvent.setup();
      render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={true}
          keywordCount={10}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /clustering/i });
      await user.click(clusterButton);
      
      expect(mockOnClusterKeywords).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have border and rounded styling', () => {
      const { container } = render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const wrapper = container.querySelector('.border.rounded-lg');
      expect(wrapper).toBeInTheDocument();
    });

    it('should support dark mode classes', () => {
      const { container } = render(
        <SessionManager
          searchedKeywords={searchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const darkElement = container.querySelector('.dark\\:bg-gray-800\\/50');
      expect(darkElement).toBeInTheDocument();
    });
  });
});