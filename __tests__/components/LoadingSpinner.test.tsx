import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Fetching keywords..." />);
    expect(screen.getByText('Fetching keywords...')).toBeInTheDocument();
  });

  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<LoadingSpinner message="Test" />);
    const spinnerContainer = container.querySelector('.flex.flex-col.items-center.justify-center');
    expect(spinnerContainer).toBeInTheDocument();
  });

  it('should render different messages for different instances', () => {
    const { rerender } = render(<LoadingSpinner message="First" />);
    expect(screen.getByText('First')).toBeInTheDocument();
    
    rerender(<LoadingSpinner message="Second" />);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByText('First')).not.toBeInTheDocument();
  });
});
