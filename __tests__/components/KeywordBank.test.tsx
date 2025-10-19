import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeywordBank } from '../../components/KeywordBank';
import type { KeywordData, Campaign } from '../../types';

describe('KeywordBank', () => {
  const mockOnCampaignsChange = vi.fn();
  const mockOnAssignKeywords = vi.fn();
  const mockOnDeleteSelected = vi.fn();
  const mockOnUnassignSelected = vi.fn();
  const mockOnToggleSelect = vi.fn();
  const mockOnToggleSelectAll = vi.fn();
  const mockOnDragStart = vi.fn();

  const keywords: KeywordData[] = [
    { keyword: 'wireless headphones', type: 'Broad', category: 'Core', searchVolume: '10,000', competition: 'High', relevance: 9, source: 'AI' },
    { keyword: 'gaming mouse', type: 'Exact', category: 'Opportunity', searchVolume: '2,000', competition: 'Low', relevance: 7, source: 'Web' },
    { keyword: 'bluetooth speaker', type: 'Phrase', category: 'Core', searchVolume: '5,000', competition: 'Medium', relevance: 8, source: 'AI' },
  ];

  const campaigns: Campaign[] = [
    {
      id: 'c1',
      name: 'Campaign 1',
      adGroups: [
        { id: 'ag1', name: 'Ad Group 1', keywords: [], defaultBid: 1, defaultMatchType: 'Broad', bidModifiers: { topOfSearch: 0, productPages: 0 } },
      ],
    },
  ];

  const renderKB = (props?: Partial<React.ComponentProps<typeof KeywordBank>>) =>
    render(
      <KeywordBank
        keywords={props?.keywords ?? keywords}
        searchedKeywords={props?.searchedKeywords ?? ['wireless headphones']}
        campaigns={props?.campaigns ?? campaigns}
        onCampaignsChange={props?.onCampaignsChange ?? mockOnCampaignsChange}
        onAssignKeywords={props?.onAssignKeywords ?? mockOnAssignKeywords}
        onDeleteSelected={props?.onDeleteSelected ?? mockOnDeleteSelected}
        onUnassignSelected={props?.onUnassignSelected ?? mockOnUnassignSelected}
        activeBrandName={props?.activeBrandName ?? 'BrandX'}
        selectedKeywords={props?.selectedKeywords ?? new Set<string>()}
        onToggleSelect={props?.onToggleSelect ?? mockOnToggleSelect}
        onToggleSelectAll={props?.onToggleSelectAll ?? mockOnToggleSelectAll}
        onDragStart={props?.onDragStart ?? mockOnDragStart}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & filtering', () => {
    it('renders heading and export button', () => {
      renderKB();
      expect(screen.getByText(/Keyword Bank/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    it('filters keywords by text', () => {
      renderKB();
      const filter = screen.getByPlaceholderText(/Filter keywords/i);
      fireEvent.change(filter, { target: { value: 'gaming' } });

      // Only "gaming mouse" remains
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
      expect(screen.getByText(/gaming mouse/i)).toBeInTheDocument();
      expect(screen.queryByText(/wireless headphones/i)).not.toBeInTheDocument();
    });

    it('shows message when no keywords match filter', () => {
      renderKB();
      const filter = screen.getByPlaceholderText(/Filter keywords/i);
      fireEvent.change(filter, { target: { value: 'zzz' } });

      expect(screen.getByText(/No keywords match your filter/i)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('toggles Select All checkbox', () => {
      renderKB();
      // Desktop view header checkbox
      const selectAll = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAll);
      expect(mockOnToggleSelectAll).toHaveBeenCalledWith(true);
    });

    it('toggles a row checkbox', () => {
      renderKB();
      // Row checkbox (second checkbox)
      const rowCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(rowCheckbox);
      // We cannot know which keyword because of order; ensure handler was called
      expect(mockOnToggleSelect).toHaveBeenCalled();
    });

    it('shows bulk action buttons when items are selected', () => {
      renderKB({ selectedKeywords: new Set(['wireless headphones', 'gaming mouse']) });
      expect(screen.getByRole('button', { name: /Assign \(2\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unassign \(2\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete \(2\)/i })).toBeInTheDocument();
    });
  });

  describe('Assign flow', () => {
    it('prompts user to create a campaign if none exist', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      renderKB({ campaigns: [], selectedKeywords: new Set(['kw']) });

      fireEvent.click(screen.getByRole('button', { name: /Assign/i }));
      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('opens modal and assigns to selected campaign & ad group', () => {
      renderKB({ selectedKeywords: new Set(['wireless headphones', 'gaming mouse']) });

      fireEvent.click(screen.getByRole('button', { name: /Assign \(2\)/i }));

      // Select campaign
      const selects = screen.getAllByRole('combobox');
      const campaignSelect = selects[0];
      fireEvent.change(campaignSelect, { target: { value: 'c1' } });

      // Select ad group
      const adGroupSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(adGroupSelect, { target: { value: 'ag1' } });

      // Confirm
      const confirmBtn = screen.getByRole('button', { name: /^Assign$/i });
      fireEvent.click(confirmBtn);

      expect(mockOnAssignKeywords).toHaveBeenCalledWith('c1', 'ag1', expect.arrayContaining(['wireless headphones', 'gaming mouse']));
    });
  });

  describe('Drag-and-drop', () => {
    it('starts drag with keyword payload', () => {
      renderKB();
      // find a row
      const row = screen.getByText(/wireless headphones/i).closest('tr')!;
      expect(row).toHaveAttribute('draggable', 'true');

      const dataTransfer = { setData: vi.fn(), dropEffect: '' };
      fireEvent.dragStart(row, { dataTransfer: dataTransfer as any });

      expect(mockOnDragStart).toHaveBeenCalled();
    });
  });

  describe('Export CSV', () => {
    it('exports keyword CSV with correct filename', () => {
      const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
        if (tag === 'a') {
          return {
            set href(v: string) {},
            get href() { return ''; },
            set download(v: string) { (this as any)._download = v; },
            get download() { return (this as any)._download; },
            click: vi.fn(),
          } as any;
        }
        return document.createElement(tag);
      });

      renderKB({ activeBrandName: 'BrandX' });
      fireEvent.click(screen.getByRole('button', { name: /Export/i }));

      const anchor = (createElSpy.mock.results.find(r => (r.value as any)?.click)?.value) as any;
      expect(anchor.download).toBe('BrandX_keywords.csv');

      urlSpy.mockRestore();
      revokeSpy.mockRestore();
      createElSpy.mockRestore();
    });
  });

  describe('Empty states', () => {
    it('shows empty bank message when no keywords', () => {
      renderKB({ keywords: [] });
      expect(screen.getByText(/No keywords in bank yet/i)).toBeInTheDocument();
    });
  });
});