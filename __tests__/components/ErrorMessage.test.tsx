import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '../../components/ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display "Error:" label', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Error:')).toBeInTheDocument();
  });

  it('should have alert role for accessibility', () => {
    render(<ErrorMessage message="Error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('should render with error styling', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    const errorDiv = container.querySelector('.bg-red-50');
    expect(errorDiv).toBeInTheDocument();
  });

  it('should render multiple different error messages', () => {
    const { rerender } = render(<ErrorMessage message="First error" />);
    expect(screen.getByText('First error')).toBeInTheDocument();
    
    rerender(<ErrorMessage message="Second error" />);
    expect(screen.getByText('Second error')).toBeInTheDocument();
    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });

  it('should render long error messages', () => {
    const longMessage = 'This is a very long error message that contains multiple sentences and detailed information about what went wrong in the application.';
    render(<ErrorMessage message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('should have proper structure with strong and span elements', () => {
    const { container } = render(<ErrorMessage message="Test" />);
    const strong = container.querySelector('strong');
    const span = container.querySelector('span');
    expect(strong).toBeInTheDocument();
    expect(span).toBeInTheDocument();
  });
});
