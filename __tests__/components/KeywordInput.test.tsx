import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeywordInput } from '../../components/KeywordInput';

describe('KeywordInput', () => {
  const mockSetSeedKeyword = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnToggleAdvancedSearch = vi.fn();
  const mockSetAdvancedKeywords = vi.fn();
  const mockSetMinVolume = vi.fn();
  const mockSetMaxVolume = vi.fn();
  const mockSetIsWebAnalysisEnabled = vi.fn();
  const mockSetBrandName = vi.fn();

  const defaultProps = {
    seedKeyword: '',
    setSeedKeyword: mockSetSeedKeyword,
    onSearch: mockOnSearch,
    isLoading: false,
    isBrandActive: true,
    isAdvancedSearchOpen: false,
    onToggleAdvancedSearch: mockOnToggleAdvancedSearch,
    advancedKeywords: '',
    setAdvancedKeywords: mockSetAdvancedKeywords,
    minVolume: '',
    setMinVolume: mockSetMinVolume,
    maxVolume: '',
    setMaxVolume: mockSetMaxVolume,
    isWebAnalysisEnabled: false,
    setIsWebAnalysisEnabled: mockSetIsWebAnalysisEnabled,
    brandName: '',
    setBrandName: mockSetBrandName,
  };

  beforeEach(() => {
    mockSetSeedKeyword.mockClear();
    mockOnSearch.mockClear();
    mockOnToggleAdvancedSearch.mockClear();
    mockSetAdvancedKeywords.mockClear();
    mockSetMinVolume.mockClear();
    mockSetMaxVolume.mockClear();
    mockSetIsWebAnalysisEnabled.mockClear();
    mockSetBrandName.mockClear();
  });

  describe('rendering', () => {
    it('should render seed keyword label', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.getByText('Seed Keyword')).toBeInTheDocument();
    });

    it('should render keyword input field', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.getByRole('textbox', { name: /seed keyword/i })).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render advanced options toggle', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /advanced options/i })).toBeInTheDocument();
    });

    it('should not show advanced options by default', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.queryByLabelText(/web analysis/i)).not.toBeInTheDocument();
    });

    it('should show advanced options when toggled', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      expect(screen.getByLabelText(/web analysis/i)).toBeInTheDocument();
    });

    it('should show placeholder when brand is active', () => {
      render(<KeywordInput {...defaultProps} />);
      expect(screen.getByPlaceholderText(/enter keyword/i)).toBeInTheDocument();
    });

    it('should show different placeholder when brand is inactive', () => {
      render(<KeywordInput {...defaultProps} isBrandActive={false} />);
      expect(screen.getByPlaceholderText(/create a brand first/i)).toBeInTheDocument();
    });
  });

  describe('basic interactions', () => {
    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox', { name: /seed keyword/i });
      await user.type(input, 'headphones');
      
      expect(mockSetAdvancedKeywords).toHaveBeenCalled();
    });

    it('should call onSearch when form is submitted', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} advancedKeywords="test" />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('should not call onSearch when input is empty', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} advancedKeywords="" />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeDisabled();
    });

    it('should toggle advanced options when clicked', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /advanced options/i });
      await user.click(toggleButton);
      
      expect(mockOnToggleAdvancedSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled states', () => {
    it('should disable input when brand is inactive', () => {
      render(<KeywordInput {...defaultProps} isBrandActive={false} />);
      
      const input = screen.getByRole('textbox', { name: /seed keyword/i });
      expect(input).toBeDisabled();
    });

    it('should disable input when loading', () => {
      render(<KeywordInput {...defaultProps} isLoading={true} />);
      
      const input = screen.getByRole('textbox', { name: /seed keyword/i });
      expect(input).toBeDisabled();
    });

    it('should disable search button when brand is inactive', () => {
      render(<KeywordInput {...defaultProps} isBrandActive={false} advancedKeywords="test" />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeDisabled();
    });

    it('should disable search button when loading', () => {
      render(<KeywordInput {...defaultProps} isLoading={true} advancedKeywords="test" />);
      
      const searchButton = screen.getByRole('button', { name: /searching/i });
      expect(searchButton).toBeDisabled();
    });

    it('should disable search button when input is empty', () => {
      render(<KeywordInput {...defaultProps} advancedKeywords="" />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeDisabled();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      render(<KeywordInput {...defaultProps} isLoading={true} advancedKeywords="test" />);
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it('should show search text when not loading', () => {
      render(<KeywordInput {...defaultProps} isLoading={false} advancedKeywords="test" />);
      const searchButton = screen.getByRole('button', { name: /^search$/i });
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('advanced options', () => {
    it('should render web analysis checkbox when advanced options open', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      expect(screen.getByLabelText(/enable web analysis/i)).toBeInTheDocument();
    });

    it('should render brand context input when advanced options open', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      expect(screen.getByLabelText(/brand context/i)).toBeInTheDocument();
    });

    it('should render min and max volume inputs when advanced options open', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      expect(screen.getByLabelText(/min volume/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/max volume/i)).toBeInTheDocument();
    });

    it('should call setIsWebAnalysisEnabled when checkbox is toggled', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      
      const checkbox = screen.getByLabelText(/enable web analysis/i);
      await user.click(checkbox);
      
      expect(mockSetIsWebAnalysisEnabled).toHaveBeenCalledWith(true);
    });

    it('should call setBrandName when brand input changes', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      
      const input = screen.getByLabelText(/brand context/i);
      await user.type(input, 'MyBrand');
      
      expect(mockSetBrandName).toHaveBeenCalled();
    });

    it('should call setMinVolume when min volume changes', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      
      const input = screen.getByLabelText(/min volume/i);
      await user.type(input, '1000');
      
      expect(mockSetMinVolume).toHaveBeenCalled();
    });

    it('should call setMaxVolume when max volume changes', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      
      const input = screen.getByLabelText(/max volume/i);
      await user.type(input, '10000');
      
      expect(mockSetMaxVolume).toHaveBeenCalled();
    });

    it('should disable advanced options inputs when brand is inactive', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} isBrandActive={false} />);
      
      expect(screen.getByLabelText(/brand context/i)).toBeDisabled();
      expect(screen.getByLabelText(/min volume/i)).toBeDisabled();
      expect(screen.getByLabelText(/max volume/i)).toBeDisabled();
    });

    it('should show correct web analysis description', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} />);
      expect(screen.getByText(/more keywords, slower/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} advancedKeywords="test" />);
      
      const form = screen.getByRole('textbox', { name: /seed keyword/i }).closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
      
      form?.dispatchEvent(submitEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call onSearch when loading', async () => {
      const user = userEvent.setup();
      render(<KeywordInput {...defaultProps} isLoading={true} advancedKeywords="test" />);
      
      const searchButton = screen.getByRole('button', { name: /searching/i });
      await user.click(searchButton);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('value display', () => {
    it('should display current advanced keywords value', () => {
      render(<KeywordInput {...defaultProps} advancedKeywords="test keyword" />);
      const input = screen.getByRole('textbox', { name: /seed keyword/i }) as HTMLInputElement;
      expect(input.value).toBe('test keyword');
    });

    it('should display current brand name value', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} brandName="My Brand" />);
      const input = screen.getByLabelText(/brand context/i) as HTMLInputElement;
      expect(input.value).toBe('My Brand');
    });

    it('should display current min volume value', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} minVolume="1000" />);
      const input = screen.getByLabelText(/min volume/i) as HTMLInputElement;
      expect(input.value).toBe('1000');
    });

    it('should display current max volume value', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} maxVolume="10000" />);
      const input = screen.getByLabelText(/max volume/i) as HTMLInputElement;
      expect(input.value).toBe('10000');
    });

    it('should show checkbox as checked when web analysis enabled', () => {
      render(<KeywordInput {...defaultProps} isAdvancedSearchOpen={true} isWebAnalysisEnabled={true} />);
      const checkbox = screen.getByLabelText(/enable web analysis/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });
});