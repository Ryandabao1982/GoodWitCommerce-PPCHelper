import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../../components/Header';

describe('Header', () => {
  const mockOnMenuClick = vi.fn();
  const mockOnSelectBrand = vi.fn();
  const mockOnOpenCreateBrandModal = vi.fn();
  const mockOnToggleDarkMode = vi.fn();
  const mockBrands = ['Brand A', 'Brand B', 'Brand C'];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the header with title', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByText(/Amazon PPC Keyword Genius/i)).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByText(/AI-Powered Keyword Research & Campaign Planning/i)).toBeInTheDocument();
    });

    it('should render menu button', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /Open menu/i })).toBeInTheDocument();
    });

    it('should render dark mode toggle button', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /Toggle dark mode/i })).toBeInTheDocument();
    });
  });

  describe('Brand Selection', () => {
    it('should render brand selector when brands exist', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox', { name: /Select brand/i });
      expect(select).toBeInTheDocument();
    });

    it('should not render brand selector when no brands exist', () => {
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
      
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should display all brands in the selector', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      mockBrands.forEach(brand => {
        expect(screen.getByRole('option', { name: brand })).toBeInTheDocument();
      });
    });

    it('should select the active brand', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[1]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe(mockBrands[1]);
    });

    it('should call onSelectBrand when a brand is selected', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: mockBrands[2] } });
      
      expect(mockOnSelectBrand).toHaveBeenCalledWith(mockBrands[2]);
    });

    it('should render create brand button when brands exist', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByRole('button', { name: /Create new brand/i })).toBeInTheDocument();
    });

    it('should call onOpenCreateBrandModal when create button is clicked', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const createButton = screen.getByRole('button', { name: /Create new brand/i });
      fireEvent.click(createButton);
      
      expect(mockOnOpenCreateBrandModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dark Mode Toggle', () => {
    it('should display sun icon when in light mode', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
      const moonIcon = darkModeButton.querySelector('path[d*="17.293"]');
      expect(moonIcon).toBeInTheDocument();
    });

    it('should display moon icon when in dark mode', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={true}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
      const sunIcon = darkModeButton.querySelector('path[fill-rule="evenodd"]');
      expect(sunIcon).toBeInTheDocument();
    });

    it('should call onToggleDarkMode when clicked', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });
      fireEvent.click(darkModeButton);
      
      expect(mockOnToggleDarkMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Menu Button', () => {
    it('should call onMenuClick when menu button is clicked', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const menuButton = screen.getByRole('button', { name: /Open menu/i });
      fireEvent.click(menuButton);
      
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for all buttons', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={mockBrands[0]}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      expect(screen.getByLabelText(/Open menu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Toggle dark mode/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Create new brand/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null activeBrand', () => {
      render(
        <Header
          onMenuClick={mockOnMenuClick}
          brands={mockBrands}
          activeBrand={null}
          onSelectBrand={mockOnSelectBrand}
          onOpenCreateBrandModal={mockOnOpenCreateBrandModal}
          isDarkMode={false}
          onToggleDarkMode={mockOnToggleDarkMode}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });
});