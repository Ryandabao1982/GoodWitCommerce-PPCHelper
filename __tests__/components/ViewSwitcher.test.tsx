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

  describe('Brand Tab View (New)', () => {
    it('should render Brand Tab button', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText(/Brand Tab/i)).toBeInTheDocument();
    });

    it('should display Brand Tab icon', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should call onViewChange with "brand" when Brand Tab is clicked', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('brand');
    });

    it('should highlight Brand Tab when it is the current view', () => {
      render(<ViewSwitcher currentView="brand" onViewChange={mockOnViewChange} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      expect(brandButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should not highlight Brand Tab when another view is current', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      expect(brandButton).not.toHaveClass('bg-blue-600');
      expect(brandButton).toHaveClass('bg-gray-100');
    });

    it('should include brand in all views iteration', () => {
      const allViews: ViewType[] = ['research', 'bank', 'planner', 'brand', 'settings'];

      allViews.forEach(view => {
        render(<ViewSwitcher currentView={view} onViewChange={mockOnViewChange} />);
        
        const buttons = screen.getAllByRole('button');
        const activeButtons = buttons.filter(btn => 
          btn.classList.contains('bg-blue-600')
        );
        
        expect(activeButtons).toHaveLength(1);
      });
    });

    it('should maintain Brand Tab position in button order', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      const buttonTexts = buttons.map(btn => btn.textContent);
      
      const brandIndex = buttonTexts.findIndex(text => text?.includes('Brand Tab'));
      const plannerIndex = buttonTexts.findIndex(text => text?.includes('Campaign Planner'));
      const settingsIndex = buttonTexts.findIndex(text => text?.includes('Settings'));
      
      // Brand Tab should be between Campaign Planner and Settings
      expect(brandIndex).toBeGreaterThan(plannerIndex);
      expect(brandIndex).toBeLessThan(settingsIndex);
    });

    it('should switch from Brand Tab to other views', () => {
      render(<ViewSwitcher currentView="brand" onViewChange={mockOnViewChange} />);
      
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      fireEvent.click(dashboardButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('research');
    });

    it('should switch from other views to Brand Tab', () => {
      render(<ViewSwitcher currentView="planner" onViewChange={mockOnViewChange} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      fireEvent.click(brandButton);
      
      expect(mockOnViewChange).toHaveBeenCalledWith('brand');
    });

    it('should render total of 5 view buttons with brand included', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('should have exactly one highlighted button when brand is active', () => {
      render(<ViewSwitcher currentView="brand" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      const activeButtons = buttons.filter(btn => 
        btn.classList.contains('bg-blue-600') && btn.classList.contains('text-white')
      );
      
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0].textContent).toContain('Brand Tab');
    });
  });

  describe('All Views Including Brand', () => {
    const allViews: ViewType[] = ['research', 'bank', 'planner', 'brand', 'settings'];

    it('should render all 5 views correctly', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Keyword Bank/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Planner/i)).toBeInTheDocument();
      expect(screen.getByText(/Brand Tab/i)).toBeInTheDocument();
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should handle clicks on all views including brand', () => {
      const viewMap = {
        'research': 'Dashboard',
        'bank': 'Keyword Bank',
        'planner': 'Campaign Planner',
        'brand': 'Brand Tab',
        'settings': 'Settings',
      };

      Object.entries(viewMap).forEach(([viewId, viewLabel]) => {
        vi.clearAllMocks();
        render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
        
        const button = screen.getByRole('button', { name: new RegExp(viewLabel, 'i') });
        fireEvent.click(button);
        
        expect(mockOnViewChange).toHaveBeenCalledWith(viewId);
      });
    });

    it('should cycle through all views including brand', () => {
      const { rerender } = render(
        <ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />
      );

      allViews.forEach(view => {
        rerender(<ViewSwitcher currentView={view} onViewChange={mockOnViewChange} />);
        
        const buttons = screen.getAllByRole('button');
        const activeButtons = buttons.filter(btn => 
          btn.classList.contains('bg-blue-600')
        );
        
        expect(activeButtons).toHaveLength(1);
      });
    });
  });

  describe('Edge Cases with Brand View', () => {
    it('should handle rapid switching between brand and other views', () => {
      render(<ViewSwitcher currentView="research" onViewChange={mockOnViewChange} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      const dashboardButton = screen.getByRole('button', { name: /📊 Dashboard/i });
      
      fireEvent.click(brandButton);
      fireEvent.click(dashboardButton);
      fireEvent.click(brandButton);
      
      expect(mockOnViewChange).toHaveBeenCalledTimes(3);
      expect(mockOnViewChange).toHaveBeenNthCalledWith(1, 'brand');
      expect(mockOnViewChange).toHaveBeenNthCalledWith(2, 'research');
      expect(mockOnViewChange).toHaveBeenNthCalledWith(3, 'brand');
    });

    it('should maintain button order consistency with brand view', () => {
      render(<ViewSwitcher currentView="brand" onViewChange={mockOnViewChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
      
      const buttonTexts = buttons.map(btn => btn.textContent);
      expect(buttonTexts[0]).toContain('Dashboard');
      expect(buttonTexts[1]).toContain('Keyword Bank');
      expect(buttonTexts[2]).toContain('Campaign Planner');
      expect(buttonTexts[3]).toContain('Brand Tab');
      expect(buttonTexts[4]).toContain('Settings');
    });

    it('should apply correct styles to brand tab in dark mode context', () => {
      render(<ViewSwitcher currentView="brand" onViewChange={mockOnUpdateBrandState} />);
      
      const brandButton = screen.getByRole('button', { name: /🎯 Brand Tab/i });
      
      // Should have active state classes
      expect(brandButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });
});