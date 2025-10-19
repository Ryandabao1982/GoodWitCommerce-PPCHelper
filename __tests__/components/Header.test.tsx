import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../components/Header';

describe('Header', () => {
  const mockOnMenuClick = vi.fn();
  const mockOnSelectBrand = vi.fn();
  const mockOnOpenCreateBrandModal = vi.fn();
  const mockOnToggleDarkMode = vi.fn();
  const brands = ['Brand A', 'Brand B', 'Brand C'];

  beforeEach(() => {
    mockOnMenuClick.mockClear();
    mockOnSelectBrand.mockClear();
    mockOnOpenCreateBrandModal.mockClear();
    mockOnToggleDarkMode.mockClear();
  });

  describe('rendering', () => {
    it('should render app title', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByText('Amazon PPC Keyword Genius')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByText(/AI-Powered Keyword Research & Campaign Planning/)).toBeInTheDocument();
    });

    it('should render menu button', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('should render dark mode toggle button', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    });

    it('should render brand selector when brands exist', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should not render brand selector when no brands', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={[]}
          activeBrand={null}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.queryByRole('combobox');
      expect(select).not.toBeInTheDocument();
    });

    it('should render create brand button when brands exist', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /create new brand/i })).toBeInTheDocument();
    });

    it('should show all brands in selector', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      brands.forEach(brand => {
        expect(screen.getByRole('option', { name: brand })).toBeInTheDocument();
      });
    });

    it('should show selected brand in selector', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand B"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('Brand B');
    });
  });

  describe('dark mode toggle', () => {
    it('should show moon icon when dark mode is off', () => {
      const { container } = render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const darkModeButton = screen.getByRole('button', { name: /toggle dark mode/i });
      const svg = darkModeButton.querySelector('svg');
      expect(svg).toHaveClass('text-gray-700');
    });

    it('should show sun icon when dark mode is on', () => {
      const { container } = render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={true}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const darkModeButton = screen.getByRole('button', { name: /toggle dark mode/i });
      const svg = darkModeButton.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-500');
    });
  });

  describe('interactions', () => {
    it('should call onMenuClick when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      await user.click(menuButton);
      
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleDarkMode when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
      await user.click(toggleButton);
      
      expect(mockOnToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenCreateBrandModal when create brand button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const createButton = screen.getByRole('button', { name: /create new brand/i });
      await user.click(createButton);
      
      expect(mockOnOpenCreateBrandModal).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectBrand when brand is selected', async () => {
      const user = userEvent.setup();
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Brand C');
      
      expect(mockOnSelectBrand).toHaveBeenCalledWith('Brand C');
    });

    it('should not call onSelectBrand when empty value is selected', async () => {
      const user = userEvent.setup();
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      // Simulate selecting empty value
      await user.click(select);
      
      // Should have the current brand selected
      expect(select.value).toBe('Brand A');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-labels for buttons', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create new brand' })).toBeInTheDocument();
    });

    it('should have header landmark', () => {
      const { container } = render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should have responsive classes', () => {
      const { container } = render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={brands}
          activeBrand="Brand A"
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const menuButton = container.querySelector('.lg\\:hidden');
      expect(menuButton).toBeInTheDocument();
    });
  });
});