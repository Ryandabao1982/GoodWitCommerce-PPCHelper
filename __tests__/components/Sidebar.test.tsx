import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar } from '../../components/Sidebar';

describe('Sidebar', () => {
  const mockOnClose = vi.fn();
  const mockOnHistoryItemClick = vi.fn();
  const mockOnSelectBrand = vi.fn();
  const mockOnDeleteBrand = vi.fn();
  const mockOnCreateBrandClick = vi.fn();
  
  const mockBrands = ['Brand A', 'Brand B', 'Brand C'];
  const mockRecentSearches = ['wireless headphones', 'bluetooth speakers', 'gaming mouse'];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <Sidebar
          isOpen={false}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText(/Menu/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();
    });
  });

  describe('Brands Section', () => {
    it('should render brands heading', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText(/Brands/i)).toBeInTheDocument();
    });

    it('should render all brands', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      mockBrands.forEach(brand => {
        expect(screen.getByText(brand)).toBeInTheDocument();
      });
    });

    it('should show "No brands yet" when brands array is empty', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={[]}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText(/No brands yet/i)).toBeInTheDocument();
    });

    it('should render create brand button', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByRole('button', { name: /Create new brand/i })).toBeInTheDocument();
    });

    it('should call onSelectBrand and onClose when brand is clicked', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const brandButton = screen.getByRole('button', { name: mockBrands[0] });
      fireEvent.click(brandButton);
      
      expect(mockOnSelectBrand).toHaveBeenCalledWith(mockBrands[0]);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onDeleteBrand when delete button is clicked', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const deleteButtons = screen.getAllByLabelText(/Delete/i);
      fireEvent.click(deleteButtons[0]);
      
      expect(mockOnDeleteBrand).toHaveBeenCalledWith(mockBrands[0]);
    });

    it('should disable delete buttons when isLoading is true', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={true}
        />
      );
      
      const deleteButtons = screen.getAllByLabelText(/Delete/i);
      deleteButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should call onCreateBrandClick and onClose when create button is clicked', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const createButton = screen.getByRole('button', { name: /Create new brand/i });
      fireEvent.click(createButton);
      
      expect(mockOnCreateBrandClick).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Recent Searches Section', () => {
    it('should render recent searches heading when searches exist', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText(/Recent Searches/i)).toBeInTheDocument();
    });

    it('should not render recent searches section when empty', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={[]}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.queryByText(/Recent Searches/i)).not.toBeInTheDocument();
    });

    it('should render all recent searches', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      mockRecentSearches.forEach(search => {
        expect(screen.getByText(search)).toBeInTheDocument();
      });
    });

    it('should call onHistoryItemClick and onClose when search is clicked', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: mockRecentSearches[0] });
      fireEvent.click(searchButton);
      
      expect(mockOnHistoryItemClick).toHaveBeenCalledWith(mockRecentSearches[0]);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable search history buttons when isLoading is true', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={true}
        />
      );
      
      const searchButtons = mockRecentSearches.map(search => 
        screen.getByRole('button', { name: search })
      );
      
      searchButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Close Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /Close menu/i });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const { container } = render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const overlay = container.querySelector('.fixed.inset-0.bg-black');
      fireEvent.click(overlay!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={mockRecentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={mockBrands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByLabelText(/Close menu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Create new brand/i)).toBeInTheDocument();
    });
  });
});