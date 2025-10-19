import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render the footer component', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should display the copyright message', () => {
      render(<Footer />);
      
      expect(screen.getByText(/© 2024 Amazon PPC Keyword Genius/i)).toBeInTheDocument();
      expect(screen.getByText(/Made with ❤️ for Amazon sellers/i)).toBeInTheDocument();
    });

    it('should display the version information', () => {
      render(<Footer />);
      
      expect(screen.getByText(/Version 1\.4\.0/i)).toBeInTheDocument();
    });

    it('should display powered by Gemini AI message', () => {
      render(<Footer />);
      
      expect(screen.getByText(/Powered by Google Gemini AI/i)).toBeInTheDocument();
    });

    it('should apply correct styling classes', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white', 'dark:bg-gray-800');
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive flexbox classes', () => {
      render(<Footer />);
      
      const contentContainer = screen.getByText(/© 2024 Amazon PPC Keyword Genius/i).closest('div');
      expect(contentContainer).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });
  });
});