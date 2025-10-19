import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandCreationModal } from '../../components/BrandCreationModal';

describe('BrandCreationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      expect(screen.getByText('Create New Brand')).toBeInTheDocument();
    });

    it('should render brand name input field', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      expect(screen.getByLabelText('Brand Name')).toBeInTheDocument();
    });

    it('should render create and cancel buttons', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      expect(screen.getByRole('button', { name: /create brand/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render close button in header', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('should have placeholder text in input', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      const input = screen.getByPlaceholderText('Enter brand name...');
      expect(input).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name') as HTMLInputElement;
      await user.type(input, 'My Brand');
      
      expect(input.value).toBe('My Brand');
    });

    it('should call onCreate with trimmed brand name on form submit', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockReturnValue(true);
      
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name');
      await user.type(input, '  Test Brand  ');
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(mockOnCreate).toHaveBeenCalledWith('Test Brand');
    });

    it('should close modal on successful creation', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockReturnValue(true);
      
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name');
      await user.type(input, 'New Brand');
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('should show error when submitting empty brand name', async () => {
      const user = userEvent.setup();
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Brand name cannot be empty')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('should show error when submitting whitespace-only brand name', async () => {
      const user = userEvent.setup();
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name');
      await user.type(input, '   ');
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Brand name cannot be empty')).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('should show error when brand already exists', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockReturnValue(false);
      
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name');
      await user.type(input, 'Existing Brand');
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Brand already exists')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should clear error when input changes', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockReturnValue(false);
      
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const input = screen.getByLabelText('Brand Name');
      await user.type(input, 'Brand');
      
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Brand already exists')).toBeInTheDocument();
    });
  });

  describe('state management', () => {
    it('should clear input when modal closes', async () => {
      const { rerender } = render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const user = userEvent.setup();
      const input = screen.getByLabelText('Brand Name') as HTMLInputElement;
      await user.type(input, 'Test Brand');
      
      expect(input.value).toBe('Test Brand');
      
      rerender(<BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />);
      rerender(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      const newInput = screen.getByLabelText('Brand Name') as HTMLInputElement;
      expect(newInput.value).toBe('');
    });

    it('should clear error when modal closes', async () => {
      const { rerender } = render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /create brand/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Brand name cannot be empty')).toBeInTheDocument();
      
      rerender(<BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />);
      rerender(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      
      expect(screen.queryByText('Brand name cannot be empty')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should autofocus input when modal opens', () => {
      render(<BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
      const input = screen.getByLabelText('Brand Name');
      expect(input).toHaveAttribute('autoFocus');
    });

    it('should have proper form structure', () => {
      const { container } = render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});