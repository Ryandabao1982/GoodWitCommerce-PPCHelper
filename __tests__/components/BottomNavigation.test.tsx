import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNavigation } from '../../components/BottomNavigation';
import type { ViewType } from '../../components/ViewSwitcher';

describe('BottomNavigation', () => {
  const mockOnViewChange = vi.fn();

  it('renders all navigation items', () => {
    render(<BottomNavigation currentView="research" onViewChange={mockOnViewChange} />);
    
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keywords' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campaigns' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Brand' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('highlights the current active view', () => {
    render(<BottomNavigation currentView="bank" onViewChange={mockOnViewChange} />);
    
    const keywordsButton = screen.getByRole('button', { name: 'Keywords' });
    expect(keywordsButton).toHaveClass('text-blue-600');
  });

  it('calls onViewChange when a button is clicked', () => {
    render(<BottomNavigation currentView="research" onViewChange={mockOnViewChange} />);
    
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsButton);
    
    expect(mockOnViewChange).toHaveBeenCalledWith('settings');
  });

  it('has proper ARIA attributes', () => {
    render(<BottomNavigation currentView="planner" onViewChange={mockOnViewChange} />);
    
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    
    const campaignsButton = screen.getByRole('button', { name: 'Campaigns' });
    expect(campaignsButton).toHaveAttribute('aria-current', 'page');
  });

  it('displays icons for each navigation item', () => {
    render(<BottomNavigation currentView="research" onViewChange={mockOnViewChange} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    
    // Check that each button has text content
    buttons.forEach(button => {
      expect(button.textContent).toBeTruthy();
    });
  });

  it('allows switching between different views', () => {
    const { rerender } = render(<BottomNavigation currentView="research" onViewChange={mockOnViewChange} />);
    
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('text-blue-600');
    
    // Simulate view change
    rerender(<BottomNavigation currentView="settings" onViewChange={mockOnViewChange} />);
    
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('text-blue-600');
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('text-gray-600');
  });
});
