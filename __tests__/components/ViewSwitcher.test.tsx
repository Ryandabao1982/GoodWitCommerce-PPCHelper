import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ViewSwitcher, ViewType } from '../../components/ViewSwitcher';

describe('ViewSwitcher', () => {
  const mockOnViewChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all view buttons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Keyword Bank/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Planner/i)).toBeInTheDocument();
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should display all view icons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('should highlight the current view button', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const researchButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      expect(researchButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not highlight non-current view buttons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const bankButton = screen.getByRole('button', { name: /🏦 Keyword Bank/i });
      expect(bankButton).not.toHaveClass('bg-blue-600');
      expect(bankButton).toHaveClass('bg-gray-100');
    });
  });

  describe('View Selection', () => {
    it('should call onViewChange with correct view when Dashboard is clicked', () => {
      render(<ViewSwitcher currentView="bank" onViewChange={mockOnViewChange} />);
      
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      fireEvent.click(dashboardButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('research');
    });

    it('should call onViewChange with correct view when Keyword Bank is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const bankButton = screen.getByRole('button', { name: /🏦 Keyword Bank/i });
      fireEvent.click(bankButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('bank');
    });

    it('should call onViewChange with correct view when Campaign Planner is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const plannerButton = screen.getByRole('button', { name: /📋 Campaign Planner/i });
      fireEvent.click(plannerButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('planner');
    });

    it('should call onViewChange with correct view when Settings is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const settingsButton = screen.getByRole('button', { name: /⚙️ Settings/i });
      fireEvent.click(settingsButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('settings');
    });
  });

  describe('Different Current Views', () => {
    const views: ViewType[] = ['research', 'bank', 'planner', 'settings'];

    views.forEach(view => {
      it(`should highlight ${view} view when it is current`, () => {
        render(<ViewSwitcher currentView={view} onViewChange={mockOnViewChange} />);
        
        const buttons = screen.getAllByRole('button');
        const activeButtons = buttons.filter(btn => 
          btn.classList.contains('bg-blue-600')
        );
        
        expect(activeButtons).toHaveLength(1);
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive layout classes', () => {
      const { container } = render(
        <ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />
      );
      
      const wrapper = container.querySelector('.flex');
      expect(wrapper).toHaveClass('flex-wrap', 'gap-2');
    });
  });
});