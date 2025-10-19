import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollToTopButton } from '../../components/ScrollToTopButton';

describe('ScrollToTopButton', () => {
  describe('visibility', () => {
    it('should render when isVisible is true', () => {
      const mockOnClick = vi.fn();
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: /scroll to top/i });
      expect(button).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      const mockOnClick = vi.fn();
      render(<ScrollToTopButton isVisible={false} onClick={mockOnClick} />);
      
      const button = screen.queryByRole('button', { name: /scroll to top/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should return null when not visible', () => {
      const mockOnClick = vi.fn();
      const { container } = render(<ScrollToTopButton isVisible={false} onClick={mockOnClick} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: /scroll to top/i });
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked repeatedly', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: /scroll to top/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('styling and accessibility', () => {
    it('should have proper aria-label', () => {
      const mockOnClick = vi.fn();
      render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: 'Scroll to top' });
      expect(button).toBeInTheDocument();
    });

    it('should have fixed positioning classes', () => {
      const mockOnClick = vi.fn();
      const { container } = render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = container.querySelector('.fixed');
      expect(button).toBeInTheDocument();
    });

    it('should have rounded styling', () => {
      const mockOnClick = vi.fn();
      const { container } = render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const button = container.querySelector('.rounded-full');
      expect(button).toBeInTheDocument();
    });

    it('should contain an SVG icon', () => {
      const mockOnClick = vi.fn();
      const { container } = render(<ScrollToTopButton isVisible={true} onClick={mockOnClick} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});