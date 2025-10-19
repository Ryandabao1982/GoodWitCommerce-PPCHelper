import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb, BreadcrumbItem } from '../../components/Breadcrumb';

describe('Breadcrumb', () => {
  describe('rendering', () => {
    it('should render single breadcrumb item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render multiple breadcrumb items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Brand', onClick: vi.fn() },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Brand')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render separators between items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Brand', isActive: true },
      ];
      
      const { container } = render(<Breadcrumb items={items} />);
      
      const separators = container.querySelectorAll('svg');
      expect(separators).toHaveLength(1);
    });

    it('should not render separator before first item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', isActive: true },
      ];
      
      const { container } = render(<Breadcrumb items={items} />);
      
      const separators = container.querySelectorAll('svg');
      expect(separators).toHaveLength(0);
    });
  });

  describe('active state', () => {
    it('should highlight active item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const activeItem = screen.getByText('Dashboard');
      expect(activeItem).toHaveClass('font-semibold');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });

    it('should not make active item clickable', () => {
      const mockOnClick = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', onClick: mockOnClick, isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const activeItem = screen.getByText('Dashboard');
      expect(activeItem.tagName).toBe('SPAN');
    });
  });

  describe('clickable items', () => {
    it('should render clickable item as button', () => {
      const mockOnClick = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: mockOnClick },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const clickableItem = screen.getByRole('button', { name: 'Home' });
      expect(clickableItem).toBeInTheDocument();
    });

    it('should call onClick when item is clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: mockOnClick },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const clickableItem = screen.getByRole('button', { name: 'Home' });
      await user.click(clickableItem);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should render non-clickable item as span', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home' },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const nonClickableItem = screen.getByText('Home');
      expect(nonClickableItem.tagName).toBe('SPAN');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
      expect(nav).toBeInTheDocument();
    });

    it('should hide separator icons from screen readers', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Dashboard', isActive: true },
      ];
      
      const { container } = render(<Breadcrumb items={items} />);
      
      const separators = container.querySelectorAll('svg');
      separators.forEach((separator) => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('styling', () => {
    it('should apply hover styles to clickable items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const clickableItem = screen.getByRole('button', { name: 'Home' });
      expect(clickableItem).toHaveClass('hover:text-blue-800');
    });

    it('should style active item differently', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home', onClick: vi.fn() },
        { label: 'Dashboard', isActive: true },
      ];
      
      render(<Breadcrumb items={items} />);
      
      const activeItem = screen.getByText('Dashboard');
      expect(activeItem).toHaveClass('text-gray-900');
      expect(activeItem).toHaveClass('font-semibold');
    });
  });
});
