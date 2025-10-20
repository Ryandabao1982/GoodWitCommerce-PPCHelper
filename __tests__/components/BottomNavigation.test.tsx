import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNavigation } from '../../components/BottomNavigation';

describe('BottomNavigation', () => {
  const mockOnViewChange = vi.fn();
  const defaultProps = {
    hasActiveBrand: true,
    hasKeywords: true,
  };

  const renderNavigation = (props?: Partial<React.ComponentProps<typeof BottomNavigation>>) =>
    render(
      <BottomNavigation
        currentView="research"
        onViewChange={mockOnViewChange}
        hasActiveBrand={defaultProps.hasActiveBrand}
        hasKeywords={defaultProps.hasKeywords}
        {...props}
      />
    );

  it('renders all navigation items', () => {
    renderNavigation();

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keywords' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campaigns' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Brand' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('highlights the current active view', () => {
    renderNavigation({ currentView: 'bank' });

    const keywordsButton = screen.getByRole('button', { name: 'Keywords' });
    expect(keywordsButton).toHaveClass('text-blue-600');
  });

  it('calls onViewChange when a button is clicked', () => {
    renderNavigation();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('settings');
  });

  it('has proper ARIA attributes', () => {
    renderNavigation({ currentView: 'planner' });

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();

    const campaignsButton = screen.getByRole('button', { name: 'Campaigns' });
    expect(campaignsButton).toHaveAttribute('aria-current', 'page');
  });

  it('displays icons for each navigation item', () => {
    renderNavigation();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6); // Dashboard, Keywords, Campaigns, Brand, SOPs, Settings

    // Check that each button has text content
    buttons.forEach((button) => {
      expect(button.textContent).toBeTruthy();
    });
  });

  it('allows switching between different views', () => {
    const { rerender } = render(
      <BottomNavigation
        currentView="research"
        onViewChange={mockOnViewChange}
        hasActiveBrand={defaultProps.hasActiveBrand}
        hasKeywords={defaultProps.hasKeywords}
      />
    );

    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('text-blue-600');

    // Simulate view change
    rerender(
      <BottomNavigation
        currentView="settings"
        onViewChange={mockOnViewChange}
        hasActiveBrand={defaultProps.hasActiveBrand}
        hasKeywords={defaultProps.hasKeywords}
      />
    );

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveClass('text-blue-600');
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveClass('text-gray-600');
  });

  it('disables brand-dependent items when there is no active brand', () => {
    renderNavigation({ hasActiveBrand: false, hasKeywords: false });

    expect(screen.getByRole('button', { name: 'Keywords' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Campaigns' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Brand' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'SOPs' })).toBeDisabled();
  });

  it('disables planner when keywords are missing', () => {
    renderNavigation({ hasKeywords: false });

    expect(screen.getByRole('button', { name: 'Campaigns' })).toBeDisabled();
  });
});
