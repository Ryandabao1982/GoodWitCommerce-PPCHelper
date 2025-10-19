import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WelcomeMessage } from '../../components/WelcomeMessage';

describe('WelcomeMessage', () => {
  describe('when no active brand', () => {
    it('should render welcome message', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand={null} onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Welcome to Amazon PPC Keyword Genius!/)).toBeInTheDocument();
    });

    it('should render create brand button', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand={null} onCreateBrandClick={mockOnCreateBrandClick} />);
      
      const button = screen.getByRole('button', { name: /Create Your First Brand/i });
      expect(button).toBeInTheDocument();
    });

    it('should call onCreateBrandClick when button is clicked', async () => {
      const mockOnCreateBrandClick = vi.fn();
      const user = userEvent.setup();
      
      render(<WelcomeMessage activeBrand={null} onCreateBrandClick={mockOnCreateBrandClick} />);
      
      const button = screen.getByRole('button', { name: /Create Your First Brand/i });
      await user.click(button);
      
      expect(mockOnCreateBrandClick).toHaveBeenCalledTimes(1);
    });

    it('should display getting started message', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand={null} onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Get started by creating your first brand workspace/)).toBeInTheDocument();
    });
  });

  describe('when active brand exists', () => {
    it('should render brand-specific welcome message', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="My Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Welcome to My Brand!/)).toBeInTheDocument();
    });

    it('should render compact message for dashboard', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(
        <WelcomeMessage 
          activeBrand="Test Brand" 
          onCreateBrandClick={mockOnCreateBrandClick}
          hasKeywords={false}
          currentView="research"
        />
      );
      
      expect(screen.getByText(/Welcome to Test Brand!/)).toBeInTheDocument();
      expect(screen.getByText(/Start your keyword research by entering a seed keyword below/)).toBeInTheDocument();
    });

    it('should not render create brand button', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      const button = screen.queryByRole('button', { name: /Create Your First Brand/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should hide welcome message for experienced users with keywords', () => {
      const mockOnCreateBrandClick = vi.fn();
      const { container } = render(
        <WelcomeMessage 
          activeBrand="Test Brand" 
          onCreateBrandClick={mockOnCreateBrandClick}
          hasKeywords={true}
          currentView="keywordBank"
        />
      );
      
      // Component should return null for experienced users on non-research views
      expect(container.firstChild).toBeNull();
    });

    it('should hide welcome message for experienced users on dashboard', () => {
      const mockOnCreateBrandClick = vi.fn();
      const { container } = render(
        <WelcomeMessage 
          activeBrand="Test Brand" 
          onCreateBrandClick={mockOnCreateBrandClick}
          hasKeywords={true}
          currentView="research"
        />
      );
      
      // Component should return null for experienced users
      expect(container.firstChild).toBeNull();
    });
  });

  describe('brand switching', () => {
    it('should update message when brand changes', () => {
      const mockOnCreateBrandClick = vi.fn();
      const { rerender } = render(
        <WelcomeMessage activeBrand={null} onCreateBrandClick={mockOnCreateBrandClick} />
      );
      
      expect(screen.getByText(/Welcome to Amazon PPC Keyword Genius!/)).toBeInTheDocument();
      
      rerender(<WelcomeMessage activeBrand="New Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Welcome to New Brand!/)).toBeInTheDocument();
      expect(screen.queryByText(/Welcome to Amazon PPC Keyword Genius!/)).not.toBeInTheDocument();
    });
  });
});
