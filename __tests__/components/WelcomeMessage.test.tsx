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

    it('should render workflow steps', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText('1. Research')).toBeInTheDocument();
      expect(screen.getByText('2. Organize')).toBeInTheDocument();
      expect(screen.getByText('3. Plan')).toBeInTheDocument();
    });

    it('should not render create brand button', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      const button = screen.queryByRole('button', { name: /Create Your First Brand/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should display workflow step descriptions', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Enter keywords and get AI-powered suggestions/)).toBeInTheDocument();
      expect(screen.getByText(/Build your keyword bank and analyze results/)).toBeInTheDocument();
      expect(screen.getByText(/Create campaigns and export to Amazon/)).toBeInTheDocument();
    });

    it('should render emojis in workflow steps', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('should display instruction text', () => {
      const mockOnCreateBrandClick = vi.fn();
      render(<WelcomeMessage activeBrand="Test Brand" onCreateBrandClick={mockOnCreateBrandClick} />);
      
      expect(screen.getByText(/Start your keyword research by entering a seed keyword above/)).toBeInTheDocument();
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
