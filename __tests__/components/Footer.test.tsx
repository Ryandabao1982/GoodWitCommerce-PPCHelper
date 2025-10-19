import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  it('should render footer component', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should display copyright message', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 Amazon PPC Keyword Genius/)).toBeInTheDocument();
    expect(screen.getByText(/Made with ❤️ for Amazon sellers/)).toBeInTheDocument();
  });

  it('should display version information', () => {
    render(<Footer />);
    expect(screen.getByText(/Version 1.4.0/)).toBeInTheDocument();
  });

  it('should display powered by message', () => {
    render(<Footer />);
    expect(screen.getByText(/Powered by Google Gemini AI/)).toBeInTheDocument();
  });

  it('should have proper responsive layout classes', () => {
    const { container } = render(<Footer />);
    const contentDiv = container.querySelector('.flex.flex-col.md\\:flex-row');
    expect(contentDiv).toBeInTheDocument();
  });

  it('should have border styling', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('.border-t');
    expect(footer).toBeInTheDocument();
  });

  it('should support dark mode classes', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('.dark\\:bg-gray-800');
    expect(footer).toBeInTheDocument();
  });
});