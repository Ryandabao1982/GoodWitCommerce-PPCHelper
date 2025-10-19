import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../../components/Sidebar';

describe('Sidebar', () => {
  const mockOnClose = vi.fn();
  const mockOnHistoryItemClick = vi.fn();
  const mockOnSelectBrand = vi.fn();
  const mockOnDeleteBrand = vi.fn();
  const mockOnCreateBrandClick = vi.fn();
  
  const brands = ['Brand A', 'Brand B', 'Brand C'];
  const recentSearches = ['headphones', 'earbuds', 'speakers'];

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnHistoryItemClick.mockClear();
    mockOnSelectBrand.mockClear();
    mockOnDeleteBrand.mockClear();
    mockOnCreateBrandClick.mockClear();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <Sidebar
          isOpen={false}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
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
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
    });

    it('should render brands section header', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText('Brands')).toBeInTheDocument();
    });

    it('should render all brands', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      brands.forEach(brand => {
        expect(screen.getByText(brand)).toBeInTheDocument();
      });
    });

    it('should show "No brands yet" when brands array is empty', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={[]}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText('No brands yet')).toBeInTheDocument();
    });

    it('should render recent searches section when searches exist', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });

    it('should not render recent searches section when empty', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={[]}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.queryByText('Recent Searches')).not.toBeInTheDocument();
    });

    it('should render all recent searches', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      recentSearches.forEach(search => {
        expect(screen.getByText(search)).toBeInTheDocument();
      });
    });

    it('should render create brand button', () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      expect(screen.getByRole('button', { name: /create new brand/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close menu/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectBrand and onClose when brand is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const brandButton = screen.getByRole('button', { name: 'Brand B' });
      await user.click(brandButton);
      
      expect(mockOnSelectBrand).toHaveBeenCalledWith('Brand B');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onDeleteBrand when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const deleteButton = screen.getByRole('button', { name: /delete brand a/i });
      await user.click(deleteButton);
      
      expect(mockOnDeleteBrand).toHaveBeenCalledWith('Brand A');
    });

    it('should call onHistoryItemClick and onClose when recent search is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: 'headphones' });
      await user.click(searchButton);
      
      expect(mockOnHistoryItemClick).toHaveBeenCalledWith('headphones');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onCreateBrandClick and onClose when create brand button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const createButton = screen.getByRole('button', { name: /create new brand/i });
      await user.click(createButton);
      
      expect(mockOnCreateBrandClick).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should disable delete brand button when loading', async () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={true}
        />
      );
      
      const deleteButton = screen.getByRole('button', { name: /delete brand a/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should disable recent search buttons when loading', async () => {
      render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={true}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: 'headphones' });
      expect(searchButton).toBeDisabled();
    });
  });

  describe('overlay', () => {
    it('should render overlay when open', () => {
      const { container } = render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const overlay = container.querySelector('.fixed.inset-0.bg-black');
      expect(overlay).toBeInTheDocument();
    });

    it('should call onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Sidebar
          isOpen={true}
          onClose={mockOnClose}
          recentSearches={recentSearches}
          onHistoryItemClick={mockOnHistoryItemClick}
          brands={brands}
          onSelectBrand={mockOnSelectBrand}
          onDeleteBrand={mockOnDeleteBrand}
          onCreateBrandClick={mockOnCreateBrandClick}
          isLoading={false}
        />
      );
      
      const overlay = container.querySelector('.fixed.inset-0.bg-black') as HTMLElement;
      await user.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});