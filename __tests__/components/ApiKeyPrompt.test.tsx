import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApiKeyPrompt } from '../../components/ApiKeyPrompt';

describe('ApiKeyPrompt', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ApiKeyPrompt
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByText('🔑 API Key Required')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('🔑 API Key Required')).toBeInTheDocument();
      expect(screen.getByText(/To use AI-powered keyword research/i)).toBeInTheDocument();
    });

    it('should render all instructional steps', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/Visit/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in with your Google account/i)).toBeInTheDocument();
      expect(screen.getByText(/Click "Get API Key"/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy the key and paste it below/i)).toBeInTheDocument();
    });

    it('should render Google AI Studio link', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const link = screen.getByRole('link', { name: /Google AI Studio/i });
      expect(link).toHaveAttribute('href', 'https://aistudio.google.com/app/apikey');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Input Field', () => {
    it('should render API key input field', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should update input value when typing', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test-api-key' } });

      expect(input.value).toBe('test-api-key');
    });

    it('should toggle password visibility when eye icon is clicked', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      const toggleButton = screen.getAllByRole('button').find(btn => 
        btn.textContent === '👁️' || btn.textContent === '🙈'
      );

      expect(input).toHaveAttribute('type', 'password');

      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Buttons', () => {
    it('should render Skip and Save buttons', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByRole('button', { name: /Skip for Now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save & Continue/i })).toBeInTheDocument();
    });

    it('should disable Save button when input is empty', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable Save button when input has value', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      fireEvent.change(input, { target: { value: 'test-api-key' } });

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getAllByRole('button')[0]; // First button is the X close button
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Skip button is clicked', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const skipButton = screen.getByRole('button', { name: /Skip for Now/i });
      fireEvent.click(skipButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSave with trimmed value when Save is clicked', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      fireEvent.change(input, { target: { value: '  test-api-key  ' } });

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith('test-api-key');
    });

    it('should call onClose after successful save', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      fireEvent.change(input, { target: { value: 'test-api-key' } });

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onSave when input is empty', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should handle Enter key press in input field', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      fireEvent.change(input, { target: { value: 'test-api-key' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockOnSave).toHaveBeenCalledWith('test-api-key');
    });

    it('should not save on Enter when input is empty', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i);
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Information Sections', () => {
    it('should display "Why do I need this?" section', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/Why do I need this?/i)).toBeInTheDocument();
      expect(screen.getByText(/The Google Gemini API powers all AI features/i)).toBeInTheDocument();
    });

    it('should display "How to get your API key" section', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/How to get your API key:/i)).toBeInTheDocument();
    });

    it('should display privacy and security note', () => {
      render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/Privacy & Security:/i)).toBeInTheDocument();
      expect(screen.getByText(/Your API key is stored locally/i)).toBeInTheDocument();
    });
  });

  describe('Input Clearing', () => {
    it('should clear input value after successful save', () => {
      const { rerender } = render(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Gemini API key/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test-api-key' } });

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      // Simulate closing and reopening
      rerender(
        <ApiKeyPrompt
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      rerender(
        <ApiKeyPrompt
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const newInput = screen.getByPlaceholderText(/Enter your Gemini API key/i) as HTMLInputElement;
      expect(newInput.value).toBe('');
    });
  });
});
