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
      
      // Check for buttons by their role, not text (since text appears multiple times due to responsive design)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
      expect(buttons[0]).toHaveTextContent('Dashboard');
      expect(buttons[1]).toHaveTextContent('Keyword Bank');
      expect(buttons[2]).toHaveTextContent('Campaign Planner');
      expect(buttons[3]).toHaveTextContent('Brand Tab');
      expect(buttons[4]).toHaveTextContent('SOP Library');
      expect(buttons[5]).toHaveTextContent('Settings');
    });

    it('should display all view icons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('should highlight the current view button', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not highlight non-current view buttons', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).not.toHaveClass('bg-blue-600');
      expect(buttons[1]).toHaveClass('bg-gray-100');
    });
  });

  describe('View Selection', () => {
    it('should call onViewChange with correct view when Dashboard is clicked', () => {
      render(<ViewSwitcher currentView="bank" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Dashboard is first button
      
      expect(mockOnViewChange).toHaveBeenCalledWith('research');
    });

    it('should call onViewChange with correct view when Keyword Bank is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]); // Keyword Bank is second button
      
      expect(mockOnViewChange).toHaveBeenCalledWith('bank');
    });

    it('should call onViewChange with correct view when Campaign Planner is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[2]); // Campaign Planner is third button
      
      expect(mockOnViewChange).toHaveBeenCalledWith('planner');
    });

    it('should call onViewChange with correct view when Settings is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[5]); // Settings is sixth button
      
      expect(mockOnViewChange).toHaveBeenCalledWith('settings');
    });
  });

  describe('Different Current Views', () => {
    const views: ViewType[] = ['research', 'bank', 'planner', 'brand', 'sop', 'settings'];

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