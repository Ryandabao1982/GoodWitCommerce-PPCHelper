import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GuidedTour, TourStep } from '../../components/GuidedTour';

describe('GuidedTour', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();
  const mockActionOnClick = vi.fn();

  const mockSteps: TourStep[] = [
    {
      title: 'Step 1',
      content: 'Welcome to the tour',
      position: 'center',
    },
    {
      title: 'Step 2',
      content: 'This is an important feature',
      target: '[data-tour="feature"]',
      position: 'bottom',
    },
    {
      title: 'Step 3',
      content: 'Try this action',
      position: 'center',
      action: {
        label: 'Click Me',
        onClick: mockActionOnClick,
      },
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={false}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the tour')).toBeInTheDocument();
    });

    it('should show current step number', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });

    it('should show progress indicators', () => {
      const { container } = render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
      expect(dots.length).toBe(3);
    });
  });

  describe('Navigation', () => {
    it('should show Next button on first step', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });

    it('should show Finish button on last step', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Navigate to last step
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByRole('button', { name: /Finish/i })).toBeInTheDocument();
    });

    it('should advance to next step when Next is clicked', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });

    it('should go back to previous step when Previous is clicked', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Go to step 2
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 2')).toBeInTheDocument();

      // Go back to step 1
      const previousButton = screen.getByRole('button', { name: /Previous/i });
      fireEvent.click(previousButton);
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    it('should disable Previous button on first step', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const previousButton = screen.getByRole('button', { name: /Previous/i });
      expect(previousButton).toBeDisabled();
    });
  });

  describe('Actions', () => {
    it('should call onComplete when Finish is clicked', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Navigate to last step
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Click Finish
      const finishButton = screen.getByRole('button', { name: /Finish/i });
      fireEvent.click(finishButton);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Skip is clicked', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const skipButton = screen.getByRole('button', { name: /Skip/i });
      fireEvent.click(skipButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button (X) is clicked', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const closeButton = screen.getByLabelText('Close tour');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should render and call action button when action is provided', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      // Navigate to step with action
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const actionButton = screen.getByRole('button', { name: /Click Me/i });
      expect(actionButton).toBeInTheDocument();

      fireEvent.click(actionButton);
      expect(mockActionOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Display', () => {
    it('should display the correct title for each step', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('Step 2')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('should display the correct content for each step', () => {
      render(
        <GuidedTour
          steps={mockSteps}
          isOpen={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Welcome to the tour')).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('This is an important feature')).toBeInTheDocument();
    });
  });
});
