import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionManager } from '../../components/SessionManager';

describe('SessionManager', () => {
  const mockOnClearBrandKeywords = vi.fn();
  const mockOnClusterKeywords = vi.fn();
  const mockSearchedKeywords = ['wireless headphones', 'bluetooth speakers', 'gaming mouse'];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render session info heading', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/Session Info/i)).toBeInTheDocument();
    });

    it('should display keyword count with singular form', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1}
        />
      );
      
      expect(screen.getByText(/1 keyword in bank/i)).toBeInTheDocument();
    });

    it('should display keyword count with plural form', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/10 keywords in bank/i)).toBeInTheDocument();
    });

    it('should display last searched keyword when available', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/Last: gaming mouse/i)).toBeInTheDocument();
    });

    it('should not display last searched keyword when array is empty', () => {
      render(
        <SessionManager
          searchedKeywords={[]}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={0}
        />
      );
      
      expect(screen.queryByText(/Last:/i)).not.toBeInTheDocument();
    });

    it('should render cluster button', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByRole('button', { name: /🧩 Cluster/i })).toBeInTheDocument();
    });

    it('should render clear button', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      expect(screen.getByRole('button', { name: /🗑️ Clear/i })).toBeInTheDocument();
    });
  });

  describe('Cluster Button States', () => {
    it('should enable cluster button when keywordCount is 2 or more', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={2}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /🧩 Cluster/i });
      expect(clusterButton).not.toBeDisabled();
    });

    it('should disable cluster button when keywordCount is less than 2', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /🧩 Cluster/i });
      expect(clusterButton).toBeDisabled();
    });

    it('should disable cluster button when isClustering is true', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={true}
          keywordCount={10}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /Clustering.../i });
      expect(clusterButton).toBeDisabled();
    });

    it('should show loading spinner when clustering', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={true}
          keywordCount={10}
        />
      );
      
      expect(screen.getByText(/Clustering\.\.\./i)).toBeInTheDocument();
      const spinner = screen.getByRole('button', { name: /Clustering.../i }).querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClusterKeywords when cluster button is clicked', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /🧩 Cluster/i });
      fireEvent.click(clusterButton);
      
      expect(mockOnClusterKeywords).toHaveBeenCalledTimes(1);
    });

    it('should call onClearBrandKeywords when clear button is clicked', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={10}
        />
      );
      
      const clearButton = screen.getByRole('button', { name: /🗑️ Clear/i });
      fireEvent.click(clearButton);
      
      expect(mockOnClearBrandKeywords).toHaveBeenCalledTimes(1);
    });

    it('should not call onClusterKeywords when button is disabled', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1}
        />
      );
      
      const clusterButton = screen.getByRole('button', { name: /🧩 Cluster/i });
      fireEvent.click(clusterButton);
      
      expect(mockOnClusterKeywords).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero keywords', () => {
      render(
        <SessionManager
          searchedKeywords={[]}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={0}
        />
      );
      
      expect(screen.getByText(/0 keywords in bank/i)).toBeInTheDocument();
    });

    it('should handle large keyword counts', () => {
      render(
        <SessionManager
          searchedKeywords={mockSearchedKeywords}
          onClearBrandKeywords={mockOnClearBrandKeywords}
          onClusterKeywords={mockOnClusterKeywords}
          isClustering={false}
          keywordCount={1000}
        />
      );
      
      expect(screen.getByText(/1000 keywords in bank/i)).toBeInTheDocument();
    });
  });
});