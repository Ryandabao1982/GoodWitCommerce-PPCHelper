import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSwitcher, ViewType } from '../../components/ViewSwitcher';

describe('ViewSwitcher', () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  describe('rendering', () => {
    it('should render all view buttons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/Keyword Bank/)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Planner/)).toBeInTheDocument();
      expect(screen.getByText(/Settings/)).toBeInTheDocument();
    });

    it('should render view icons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('should highlight current view', () => {
      const { container } = render(<ViewSwitcher currentView="bank" onViewChange={mockOnViewChange} />);
      
      const buttons = container.querySelectorAll('button');
      const bankButton = Array.from(buttons).find(btn => btn.textContent?.includes('Keyword Bank'));
      
      expect(bankButton?.className).toContain('bg-blue-600');
    });

    it('should not highlight non-current views', () => {
      const { container } = render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = container.querySelectorAll('button');
      const bankButton = Array.from(buttons).find(btn => btn.textContent?.includes('Keyword Bank'));
      
      expect(bankButton?.className).toContain('bg-gray-100');
    });
  });

  describe('interactions', () => {
    it('should call onViewChange when research button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewSwitcher currentView="bank" onViewChange={mockOnViewChange} />);
      
      const button = screen.getByText(/Dashboard/).closest('button');
      await user.click(button!);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('research');
    });

    it('should call onViewChange when bank button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const button = screen.getByText(/Keyword Bank/).closest('button');
      await user.click(button!);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('bank');
    });

    it('should call onViewChange when planner button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const button = screen.getByText(/Campaign Planner/).closest('button');
      await user.click(button!);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('planner');
    });

    it('should call onViewChange when settings button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const button = screen.getByText(/Settings/).closest('button');
      await user.click(button!);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('settings');
    });

    it('should allow switching between all views', async () => {
      const user = userEvent.setup();
      const views: ViewType[] = ['research', 'bank', 'planner', 'settings'];
      
      for (const view of views) {
        mockOnViewChange.mockClear();
        render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
        
        const buttons = screen.getAllByRole('button');
        await user.click(buttons[views.indexOf(view)]);
        
        expect(mockOnViewChange).toHaveBeenCalledWith(view);
      }
    });
  });

  describe('responsive behavior', () => {
    it('should have responsive classes for layout', () => {
      const { container } = render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const wrapper = container.querySelector('.flex.flex-wrap');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have responsive text sizing classes', () => {
      const { container } = render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const button = container.querySelector('.text-sm.md\\:text-base');
      expect(button).toBeInTheDocument();
    });
  });
});