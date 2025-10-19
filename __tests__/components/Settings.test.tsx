import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '../../components/Settings';
import { ApiSettings } from '../../types';

describe('Settings', () => {
  const mockOnApiSettingsChange = vi.fn();
  const mockOnSaveSettings = vi.fn();
  const mockOnResetSettings = vi.fn();

  const defaultApiSettings: ApiSettings = {
    geminiApiKey: 'test-gemini-key',
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-supabase-key'
  };

  beforeEach(() => {
    mockOnApiSettingsChange.mockClear();
    mockOnSaveSettings.mockClear();
    mockOnResetSettings.mockClear();
    vi.clearAllTimers();
  });

  describe('rendering', () => {
    it('should render settings title', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText('API Settings')).toBeInTheDocument();
    });

    it('should render Gemini API section', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/Google Gemini API Configuration/)).toBeInTheDocument();
    });

    it('should render Supabase section', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/Supabase Configuration/)).toBeInTheDocument();
    });

    it('should render Gemini API key input', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByLabelText('Gemini API Key')).toBeInTheDocument();
    });

    it('should render Supabase URL input', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByLabelText('Supabase URL')).toBeInTheDocument();
    });

    it('should render Supabase anon key input', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByLabelText('Supabase Anon Key')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByRole('button', { name: /reset to default/i })).toBeInTheDocument();
    });

    it('should render info box', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByText(/API keys are stored locally/)).toBeInTheDocument();
    });

    it('should render links to get API keys', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByRole('link', { name: /google ai studio/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /supabase dashboard/i })).toBeInTheDocument();
    });
  });

  describe('input visibility toggle', () => {
    it('should hide Gemini API key by default', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Gemini API Key') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should toggle Gemini API key visibility', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Gemini API Key') as HTMLInputElement;
      const toggleButton = screen.getAllByRole('button', { name: /show api key/i })[0];
      
      expect(input.type).toBe('password');
      
      await user.click(toggleButton);
      expect(input.type).toBe('text');
      
      await user.click(toggleButton);
      expect(input.type).toBe('password');
    });

    it('should hide Supabase key by default', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase Anon Key') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should toggle Supabase key visibility', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase Anon Key') as HTMLInputElement;
      const toggleButton = screen.getAllByRole('button', { name: /show api key/i })[1];
      
      expect(input.type).toBe('password');
      
      await user.click(toggleButton);
      expect(input.type).toBe('text');
    });
  });

  describe('input changes', () => {
    it('should call onApiSettingsChange when Gemini key changes', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Gemini API Key');
      await user.clear(input);
      await user.type(input, 'new-key');
      
      expect(mockOnApiSettingsChange).toHaveBeenCalledWith({ geminiApiKey: expect.any(String) });
    });

    it('should call onApiSettingsChange when Supabase URL changes', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase URL');
      await user.clear(input);
      await user.type(input, 'https://new.supabase.co');
      
      expect(mockOnApiSettingsChange).toHaveBeenCalled();
    });

    it('should call onApiSettingsChange when Supabase key changes', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase Anon Key');
      await user.clear(input);
      await user.type(input, 'new-supabase-key');
      
      expect(mockOnApiSettingsChange).toHaveBeenCalled();
    });
  });

  describe('save functionality', () => {
    it('should call onSaveSettings when save button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);
      
      expect(mockOnSaveSettings).toHaveBeenCalledTimes(1);
    });

    it('should show saved confirmation after saving', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);
      
      expect(screen.getByText(/saved!/i)).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('reset functionality', () => {
    it('should show confirmation dialog when reset is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const resetButton = screen.getByRole('button', { name: /reset to default/i });
      await user.click(resetButton);
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnResetSettings).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should call onResetSettings when confirmed', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const resetButton = screen.getByRole('button', { name: /reset to default/i });
      await user.click(resetButton);
      
      expect(mockOnResetSettings).toHaveBeenCalledTimes(1);
      
      confirmSpy.mockRestore();
    });

    it('should not call onResetSettings when cancelled', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const resetButton = screen.getByRole('button', { name: /reset to default/i });
      await user.click(resetButton);
      
      expect(mockOnResetSettings).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });
  });

  describe('input values', () => {
    it('should display current Gemini API key value', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Gemini API Key') as HTMLInputElement;
      expect(input.value).toBe('test-gemini-key');
    });

    it('should display current Supabase URL value', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase URL') as HTMLInputElement;
      expect(input.value).toBe('https://test.supabase.co');
    });

    it('should display current Supabase key value', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      const input = screen.getByLabelText('Supabase Anon Key') as HTMLInputElement;
      expect(input.value).toBe('test-supabase-key');
    });
  });

  describe('placeholders', () => {
    it('should have appropriate placeholders', () => {
      render(
        <Settings
          apiSettings={defaultApiSettings}
          onApiSettingsChange={mockOnApiSettingsChange}
          onSaveSettings={mockOnSaveSettings}
          onResetSettings={mockOnResetSettings}
        />
      );
      
      expect(screen.getByPlaceholderText(/enter your gemini api key/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/https:\/\/your-project\.supabase\.co/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your supabase anon key/i)).toBeInTheDocument();
    });
  });
});