import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Settings } from '../../components/Settings';
import type { ApiSettings } from '../../types';

describe('Settings', () => {
  const mockOnApiSettingsChange = vi.fn();
  const mockOnSaveSettings = vi.fn();
  const mockOnResetSettings = vi.fn();

  const defaultApiSettings: ApiSettings = {
    geminiApiKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
  };

  const populatedApiSettings: ApiSettings = {
    geminiApiKey: 'test-gemini-key',
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-supabase-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render API Settings heading', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/API Settings/i)).toBeInTheDocument();
    });

    it('should render Gemini API configuration section', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/Google Gemini API Configuration/i)).toBeInTheDocument();
    });

    it('should render Supabase configuration section', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/Supabase Configuration/i)).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Supabase URL/i)).toBeInTheDocument();
    });
  });

  describe('Gemini API Key Input', () => {
    it('should display Gemini API key as password by default', () => {
      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Gemini API Key/i);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should toggle Gemini API key visibility when show button is clicked', () => {
      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Gemini API Key/i);
      const toggleButtons = screen.getAllByLabelText(/key visibility/i);
      const geminiToggle = toggleButtons[0];
      
      expect(input).toHaveAttribute('type', 'password');
      
      fireEvent.click(geminiToggle);
      expect(input).toHaveAttribute('type', 'text');
      
      fireEvent.click(geminiToggle);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should call onApiSettingsChange when Gemini API key changes', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Gemini API Key/i);
      fireEvent.change(input, { target: { value: 'new-api-key' } });
      
      expect(mockOnApiSettingsChange).toHaveBeenCalledWith({ geminiApiKey: 'new-api-key' });
    });

    it('should display link to Google AI Studio', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const link = screen.getByRole('link', { name: /Google AI Studio/i });
      expect(link).toHaveAttribute('href', 'https://aistudio.google.com/app/apikey');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Supabase Configuration', () => {
    it('should call onApiSettingsChange when Supabase URL changes', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Supabase URL/i);
      fireEvent.change(input, { target: { value: 'https://new.supabase.co' } });
      
      expect(mockOnApiSettingsChange).toHaveBeenCalledWith({ supabaseUrl: 'https://new.supabase.co' });
    });
  });

  describe('Save and Reset Actions', () => {
    it('should call onSaveSettings when save action is triggered', () => {
      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      fireEvent.click(saveButton);

      expect(mockOnSaveSettings).toHaveBeenCalledWith(populatedApiSettings);
    });

    it('should show confirmation dialog before reset', () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );

      const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
      fireEvent.click(resetButton);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnResetSettings).not.toHaveBeenCalled();

      mockConfirm.mockRestore();
    });
  });

  describe('Field Values', () => {
    it('should display current Gemini API key value', () => {
      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Gemini API Key/i) as HTMLInputElement;
      expect(input.value).toBe(populatedApiSettings.geminiApiKey);
    });

    it('should display current Supabase URL value', () => {
      render(
        <Settings
          apiSettings={populatedApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText(/Supabase URL/i) as HTMLInputElement;
      expect(input.value).toBe(populatedApiSettings.supabaseUrl);
    });

    it('should handle empty values', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const geminiInput = screen.getByLabelText(/Gemini API Key/i) as HTMLInputElement;
      const supabaseInput = screen.getByLabelText(/Supabase URL/i) as HTMLInputElement;
      
      expect(geminiInput.value).toBe('');
      expect(supabaseInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Supabase URL/i)).toBeInTheDocument();
    });

    it('should have descriptive help text', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/Configure your API keys/i)).toBeInTheDocument();
    });
  });
});