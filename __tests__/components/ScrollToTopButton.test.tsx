import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollToTopButton } from '../../components/ScrollToTopButton';

describe('ScrollToTopButton', () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isVisible is false', () => {
      render(<ScrollToTopButton isVisible={false} onClick={mockOnClick} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render when isVisible is true', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
    });

    it('should have correct styling classes when visible', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-8', 'right-8', 'bg-blue-600');
    });

    it('should display the up arrow icon', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick handler when button is clicked', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked repeatedly', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByLabelText(/scroll to top/i);
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});