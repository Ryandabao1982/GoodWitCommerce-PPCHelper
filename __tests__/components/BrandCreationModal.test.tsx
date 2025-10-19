import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrandCreationModal } from '../../components/BrandCreationModal';

describe('BrandCreationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.queryByText(/Create New Brand/i)).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.getByText(/Create New Brand/i)).toBeInTheDocument();
    });

    it('should render brand name input field', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.getByLabelText(/Brand Name/i)).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.getByRole('button', { name: /Create Brand/i })).toBeInTheDocument();
    });

    it('should have close button in header', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const closeButtons = screen.getAllByRole('button', { name: /Close modal/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should have placeholder text in input', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByPlaceholderText(/Enter brand name\.\.\./i);
      expect(input).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('should update input value when typing', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'My New Brand' } });
      
      expect(input.value).toBe('My New Brand');
    });

    it('should clear input after opening modal', () => {
      const { rerender } = render(
        <BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      rerender(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should call onCreate with brand name on successful submission', () => {
      mockOnCreate.mockReturnValue(true);
      
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: 'Test Brand' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(mockOnCreate).toHaveBeenCalledWith('Test Brand');
    });

    it('should close modal after successful creation', () => {
      mockOnCreate.mockReturnValue(true);
      
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: 'Test Brand' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show error when brand name is empty', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(screen.getByText(/Brand name cannot be empty/i)).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('should show error when brand name is only whitespace', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: '   ' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(screen.getByText(/Brand name cannot be empty/i)).toBeInTheDocument();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('should show error when brand already exists', () => {
      mockOnCreate.mockReturnValue(false);
      
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: 'Existing Brand' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(screen.getByText(/Brand already exists/i)).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should trim whitespace from brand name', () => {
      mockOnCreate.mockReturnValue(true);
      
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: '  Trimmed Brand  ' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(mockOnCreate).toHaveBeenCalledWith('Trimmed Brand');
    });
  });

  describe('Form Submission via Enter Key', () => {
    it('should submit form when pressing Enter in input field', () => {
      mockOnCreate.mockReturnValue(true);
      
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: 'Test Brand' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(mockOnCreate).toHaveBeenCalledWith('Test Brand');
    });
  });

  describe('Cancel and Close Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const closeButton = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onCreate when closing', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should autofocus the input field when modal opens', () => {
      render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      expect(input).toHaveAttribute('autoFocus');
    });
  });

  describe('Error State Management', () => {
    it('should clear error when modal is reopened', () => {
      mockOnCreate.mockReturnValue(false);
      
      const { rerender } = render(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      const input = screen.getByLabelText(/Brand Name/i);
      fireEvent.change(input, { target: { value: 'Test' } });
      
      const createButton = screen.getByRole('button', { name: /Create Brand/i });
      fireEvent.click(createButton);
      
      expect(screen.getByText(/Brand already exists/i)).toBeInTheDocument();
      
      rerender(
        <BrandCreationModal isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      rerender(
        <BrandCreationModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
      );
      
      expect(screen.queryByText(/Brand already exists/i)).not.toBeInTheDocument();
    });
  });
});