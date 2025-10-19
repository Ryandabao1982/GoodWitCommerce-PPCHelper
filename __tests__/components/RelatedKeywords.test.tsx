import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RelatedKeywords } from '../../components/RelatedKeywords';

describe('RelatedKeywords', () => {
  const mockOnKeywordSelect = vi.fn();
  const mockKeywords = [
    'wireless headphones',
    'bluetooth headphones',
    'noise cancelling headphones',
    'gaming headset',
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when keywords array is empty', () => {
      const { container } = render(
        <RelatedKeywords keywords={[]} onKeywordSelect={mockOnKeywordSelect} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render component when keywords are provided', () => {
      render(<RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(screen.getByText(/Related Keyword Ideas/i)).toBeInTheDocument();
    });

    it('should render all keyword buttons', () => {
      render(<RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      mockKeywords.forEach(keyword => {
        expect(screen.getByRole('button', { name: keyword })).toBeInTheDocument();
      });
    });

    it('should display the lightbulb icon', () => {
      render(<RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const heading = screen.getByText(/Related Keyword Ideas/i);
      const svg = heading.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      const { container } = render(
        <RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
    });
  });

  describe('User Interactions', () => {
    it('should call onKeywordSelect with correct keyword when clicked', () => {
      render(<RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      const firstButton = screen.getByRole('button', { name: mockKeywords[0] });
      fireEvent.click(firstButton);
      
      expect(mockOnKeywordSelect).toHaveBeenCalledWith(mockKeywords[0]);
      expect(mockOnKeywordSelect).toHaveBeenCalledTimes(1);
    });

    it('should handle clicks on multiple different keywords', () => {
      render(<RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      mockKeywords.forEach((keyword, index) => {
        const button = screen.getByRole('button', { name: keyword });
        fireEvent.click(button);
        expect(mockOnKeywordSelect).toHaveBeenNthCalledWith(index + 1, keyword);
      });
      
      expect(mockOnKeywordSelect).toHaveBeenCalledTimes(mockKeywords.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single keyword', () => {
      const singleKeyword = ['single keyword'];
      render(<RelatedKeywords keywords={singleKeyword} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(screen.getByRole('button', { name: singleKeyword[0] })).toBeInTheDocument();
    });

    it('should handle keywords with special characters', () => {
      const specialKeywords = ['keyword-with-dash', 'keyword with spaces', "keyword's apostrophe"];
      render(<RelatedKeywords keywords={specialKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      specialKeywords.forEach(keyword => {
        expect(screen.getByRole('button', { name: keyword })).toBeInTheDocument();
      });
    });

    it('should handle many keywords', () => {
      const manyKeywords = Array.from({ length: 20 }, (_, i) => `keyword ${i + 1}`);
      render(<RelatedKeywords keywords={manyKeywords} onKeywordSelect={mockOnKeywordSelect} />);
      
      expect(screen.getAllByRole('button')).toHaveLength(20);
    });
  });

  describe('Layout', () => {
    it('should use flexbox for keyword layout', () => {
      const { container } = render(
        <RelatedKeywords keywords={mockKeywords} onKeywordSelect={mockOnKeywordSelect} />
      );
      
      const keywordContainer = container.querySelector('.flex.flex-wrap');
      expect(keywordContainer).toBeInTheDocument();
    });
  });
});