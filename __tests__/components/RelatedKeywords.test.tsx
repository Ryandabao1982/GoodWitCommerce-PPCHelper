import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelatedKeywords } from '../../components/RelatedKeywords';

describe('RelatedKeywords', () => {
  const mockOnKeywordSelect = vi.fn();
  const sampleKeywords = ['wireless headphones', 'bluetooth earbuds', 'noise canceling headphones'];

  beforeEach(() => {
    mockOnKeywordSelect.mockClear();
  });

  describe('rendering', () => {
    it('should render with keywords', () => {
      render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(screen.getByText(/Related Keyword Ideas/)).toBeInTheDocument();
    });

    it('should render all keywords as buttons', () => {
      render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      sampleKeywords.forEach(keyword => {
        expect(screen.getByText(keyword)).toBeInTheDocument();
      });
    });

    it('should not render when keywords array is empty', () => {
      const { container } = render(<RelatedKeywords keywords={[]} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should return null for empty keywords', () => {
      const result = render(<RelatedKeywords keywords={[]} onKeywordSelect={mockOnKeywordSelect} />);
      expect(result.container.innerHTML).toBe('');
    });

    it('should render with single keyword', () => {
      render(<RelatedKeywords keywords={['single keyword']} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(screen.getByText('single keyword')).toBeInTheDocument();
    });

    it('should render with many keywords', () => {
      const manyKeywords = Array.from({ length: 20 }, (_, i) => `keyword ${i + 1}`);
      render(<RelatedKeywords keywords={manyKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      manyKeywords.forEach(keyword => {
        expect(screen.getByText(keyword)).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should call onKeywordSelect when keyword is clicked', async () => {
      const user = userEvent.setup();
      render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const button = screen.getByText('wireless headphones');
      await user.click(button);
      
      expect(mockOnKeywordSelect).toHaveBeenCalledWith('wireless headphones');
    });

    it('should call onKeywordSelect with correct keyword', async () => {
      const user = userEvent.setup();
      render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      for (const keyword of sampleKeywords) {
        mockOnKeywordSelect.mockClear();
        const button = screen.getByText(keyword);
        await user.click(button);
        
        expect(mockOnKeywordSelect).toHaveBeenCalledWith(keyword);
        expect(mockOnKeywordSelect).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle multiple clicks on same keyword', async () => {
      const user = userEvent.setup();
      render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const button = screen.getByText('bluetooth earbuds');
      await user.click(button);
      await user.click(button);
      
      expect(mockOnKeywordSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('styling and UI', () => {
    it('should have proper container styling', () => {
      const { container } = render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const wrapper = container.querySelector('.bg-blue-50');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have lightbulb icon in header', () => {
      const { container } = render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should use flex-wrap for responsive layout', () => {
      const { container } = render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const flexContainer = container.querySelector('.flex.flex-wrap');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should support dark mode classes', () => {
      const { container } = render(<RelatedKeywords keywords={sampleKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const darkModeElement = container.querySelector('.dark\\:bg-blue-900\\/20');
      expect(darkModeElement).toBeInTheDocument();
    });
  });
});