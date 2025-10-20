import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CampaignManager } from '../../components/CampaignManager';
import type { ComponentProps } from 'react';
import type { Campaign, KeywordData } from '../../types';
import { CAMPAIGN_TEMPLATES } from '../../utils/campaignTemplates';

describe('CampaignManager', () => {
  const noop = () => {};
  const mockOnCampaignsChange = vi.fn();
  const mockOnAssignKeywords = vi.fn();

  const sampleKeywords: KeywordData[] = [
    {
      keyword: 'wireless headphones',
      type: 'Broad',
      category: 'Core',
      searchVolume: '10,000',
      competition: 'High',
      relevance: 9,
      source: 'AI',
    },
  ];

  const makeCampaign = (overrides?: Partial<Campaign>): Campaign => ({
    id: 'campaign-1',
    name: 'Test Campaign',
    dailyBudget: 90,
    adGroups: [
      {
        id: 'ag-1',
        name: 'Ad Group 1',
        keywords: [],
        defaultBid: 1,
        defaultMatchType: 'Broad',
        bidModifiers: { topOfSearch: 0, productPages: 0 },
        negativeKeywords: [],
      },
      {
        id: 'ag-2',
        name: 'Ad Group 2',
        keywords: [],
        defaultBid: 1,
        defaultMatchType: 'Broad',
        bidModifiers: { topOfSearch: 0, productPages: 0 },
        negativeKeywords: [],
      },
      {
        id: 'ag-3',
        name: 'Ad Group 3',
        keywords: [],
        defaultBid: 1,
        defaultMatchType: 'Broad',
        bidModifiers: { topOfSearch: 0, productPages: 0 },
        negativeKeywords: [],
      },
    ],
    negativeKeywords: [],
    ...overrides,
  });

  const renderCM = (props?: Partial<ComponentProps<typeof CampaignManager>>) => {
    return render(
      <CampaignManager
        campaigns={props?.campaigns ?? []}
        onCampaignsChange={props?.onCampaignsChange ?? mockOnCampaignsChange}
        onAssignKeywords={props?.onAssignKeywords ?? mockOnAssignKeywords}
        allKeywords={props?.allKeywords ?? sampleKeywords}
        activeBrandName={props?.activeBrandName ?? 'BrandX'}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering basics', () => {
    it('shows empty state when no campaigns', () => {
      renderCM();
      expect(screen.getByText(/No campaigns yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /New Campaign/i })).toBeInTheDocument();
      expect(screen.queryByText(/Export/i)).not.toBeInTheDocument();
    });

    it('shows Export button when campaigns exist', () => {
      renderCM({ campaigns: [makeCampaign()] });
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });
  });

  describe('Create campaign modal', () => {
    it('opens modal and pre-fills from template', () => {
      renderCM();
      fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));

      // Template select is present
      const select = screen.getByRole('combobox');
      // pick a known template index (Manual Phrase)
      const idx = CAMPAIGN_TEMPLATES.findIndex((t) => t.name.includes('Manual Phrase'));
      expect(idx).toBeGreaterThanOrEqual(0);

      fireEvent.change(select, { target: { value: String(idx) } });

      // Name field is auto-filled
      const nameInput = screen.getByPlaceholderText(/Enter campaign name/i) as HTMLInputElement;
      expect(nameInput.value).toBe(CAMPAIGN_TEMPLATES[idx].name);

      // Budget field is auto-filled if template suggests
      const budgetInput = screen.getByPlaceholderText(/Enter daily budget/i) as HTMLInputElement;
      if (CAMPAIGN_TEMPLATES[idx].suggestedDailyBudget) {
        expect(budgetInput.value).toBe(String(CAMPAIGN_TEMPLATES[idx].suggestedDailyBudget));
      }
    });

    it('creates campaign from template and calls onCampaignsChange with new item', () => {
      renderCM();
      fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));

      const idx = CAMPAIGN_TEMPLATES.findIndex((t) => t.name.includes('Manual Exact'));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: String(idx) } });

      fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));
      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);

      const arg = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(arg).toHaveLength(1);
      const created = arg[0];
      expect(created.name).toBe(CAMPAIGN_TEMPLATES[idx].name);
      expect(created.adGroups.length).toBe(CAMPAIGN_TEMPLATES[idx].adGroups.length);
    });

    it('prevents creating a campaign with empty name', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(noop as any);
      renderCM();
      fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));
      // Ensure empty
      const nameInput = screen.getByPlaceholderText(/Enter campaign name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: '   ' } });

      fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));
      expect(alertSpy).toHaveBeenCalled();
      expect(mockOnCampaignsChange).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  describe('Campaign row actions', () => {
    it('expands/collapses campaign to show ad groups', () => {
      renderCM({ campaigns: [makeCampaign()] });
      // button contains campaign name text
      const expandBtn = screen.getByRole('button', { name: /Test Campaign/i });
      fireEvent.click(expandBtn);

      expect(screen.getByText(/Drag keywords here or use the assign button/i)).toBeInTheDocument();

      // collapse
      fireEvent.click(expandBtn);
      expect(screen.queryByText(/Drag keywords here/i)).not.toBeInTheDocument();
    });

    it('adds an ad group', () => {
      renderCM({ campaigns: [makeCampaign()] });
      const addBtn = screen.getByTitle(/Add ad group/i);
      fireEvent.click(addBtn);

      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(updated[0].adGroups.length).toBe(4);
    });

    it('deletes a campaign after confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderCM({ campaigns: [makeCampaign()] });
      fireEvent.click(screen.getByTitle(/Delete campaign/i));
      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(updated).toHaveLength(0);
      confirmSpy.mockRestore();
    });

    it('distributes budget evenly across ad groups', () => {
      const c = makeCampaign({ dailyBudget: 90 });
      renderCM({ campaigns: [c] });

      // open edit mode
      fireEvent.click(screen.getByTitle(/Edit budget/i));
      // click Distribute
      fireEvent.click(screen.getByRole('button', { name: /Distribute/i }));

      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      const updatedCampaign = updated[0];
      const budgets = updatedCampaign.adGroups.map((ag) => ag.budget ?? 0);
      expect(budgets.every((b) => Math.abs(b - 30) < 0.0001)).toBe(true);
    });
  });

  describe('Ad group editing', () => {
    it('edits ad group settings (bid, match type, modifiers)', () => {
      const c = makeCampaign();
      renderCM({ campaigns: [c] });

      // expand campaign
      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));

      // open ad group settings
      const agHeader = screen.getByText(/Ad Group 1 \(0\)/i);
      const agContainer = agHeader.closest('div')!.parentElement!.parentElement!; // container with buttons
      const editButton = within(agContainer).getByTitle(/Edit ad group settings/i);
      fireEvent.click(editButton);

      // change default bid
      const bidInput = screen.getByLabelText(/Default Bid/i) as HTMLInputElement;
      fireEvent.change(bidInput, { target: { value: '2.25' } });

      // change match type
      const matchSelect = screen.getByLabelText(/Match Type/i);
      fireEvent.change(matchSelect, { target: { value: 'Exact' } });

      // change modifiers
      const tosInput = screen.getByLabelText(/Top of Search/i) as HTMLInputElement;
      fireEvent.change(tosInput, { target: { value: '35' } });

      const ppInput = screen.getByLabelText(/Product Pages/i) as HTMLInputElement;
      fireEvent.change(ppInput, { target: { value: '10' } });

      // Expect multiple updates triggered
      expect(mockOnCampaignsChange).toHaveBeenCalled();
    });

    it('deletes an ad group after confirmation', () => {
      const c = makeCampaign();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));

      const deleteAgBtn = screen.getAllByTitle(/Delete ad group/i)[0];
      fireEvent.click(deleteAgBtn);

      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(updated[0].adGroups.length).toBe(c.adGroups.length - 1);
      confirmSpy.mockRestore();
    });
  });

  describe('Negative keyword management', () => {
    it('adds a campaign-level negative keyword', () => {
      const c = makeCampaign();
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));
      fireEvent.click(screen.getByRole('button', { name: /Negative Keywords/i }));

      const campaignSection = screen.getByText(/Campaign Negative Keywords/i).closest('div');
      expect(campaignSection).toBeTruthy();
      const scoped = within(campaignSection!);
      fireEvent.change(scoped.getByPlaceholderText(/Add negative keyword/i), {
        target: { value: 'cheap' },
      });
      fireEvent.click(scoped.getByRole('button', { name: /^Add$/i }));

      expect(mockOnCampaignsChange).toHaveBeenCalled();
      const updated = mockOnCampaignsChange.mock.calls[
        mockOnCampaignsChange.mock.calls.length - 1
      ][0] as Campaign[];
      expect(updated[0].negativeKeywords).toHaveLength(1);
      expect(updated[0].negativeKeywords?.[0].keyword).toBe('cheap');
    });

    it('adds an ad group negative keyword via bulk input', () => {
      const c = makeCampaign();
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));
      fireEvent.click(screen.getByRole('button', { name: /Negative Keywords/i }));

      const adGroupSection = screen.getByText(/Ad Group Negative Keywords/i).closest('div');
      expect(adGroupSection).toBeTruthy();
      const scoped = within(adGroupSection!);
      const bulkTextarea = scoped.getAllByPlaceholderText(/Enter one keyword per line/i)[0];
      fireEvent.change(bulkTextarea, { target: { value: 'duplicate\nconflict' } });
      fireEvent.click(scoped.getAllByRole('button', { name: /Add from List/i })[0]);

      expect(mockOnCampaignsChange).toHaveBeenCalled();
      const updated = mockOnCampaignsChange.mock.calls[
        mockOnCampaignsChange.mock.calls.length - 1
      ][0] as Campaign[];
      const firstAdGroup = updated[0].adGroups[0];
      expect(firstAdGroup.negativeKeywords).toHaveLength(2);
      expect(firstAdGroup.negativeKeywords?.map((n) => n.keyword)).toEqual([
        'duplicate',
        'conflict',
      ]);
    });
  });

  describe('Drag-and-drop assignment', () => {
    it('handles dropping keywords on an ad group', () => {
      const c = makeCampaign();
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));

      const dropHint = screen.getByText(/Drag keywords here or use the assign button/i);
      const dropZone = dropHint.closest('.border') ?? dropHint.parentElement!;

      const data = {
        getData: vi.fn().mockReturnValue(JSON.stringify(['kw1', 'kw2'])),
        dropEffect: '',
        setData: vi.fn(),
      };

      fireEvent.drop(dropZone, {
        dataTransfer: data as any,
        preventDefault: () => {},
        stopPropagation: () => {},
      });

      expect(mockOnAssignKeywords).toHaveBeenCalledWith('campaign-1', 'ag-1', ['kw1', 'kw2']);
    });
  });

  describe('Export CSV', () => {
    it('exports a CSV with the correct filename', () => {
      const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
        if (tag === 'a') {
          return {
            set href(v: string) {},
            get href() {
              return '';
            },
            set download(v: string) {
              (this as any)._download = v;
            },
            get download() {
              return (this as any)._download;
            },
            click: vi.fn(),
          } as any;
        }
        return document.createElement(tag);
      });

      const c = makeCampaign({
        adGroups: [
          {
            id: 'ag-1',
            name: 'AG1',
            keywords: ['kw1', 'kw2'],
            defaultBid: 1,
            defaultMatchType: 'Broad',
            bidModifiers: { topOfSearch: 0, productPages: 0 },
          },
        ],
      });

      renderCM({ campaigns: [c], activeBrandName: 'BrandX' });
      fireEvent.click(screen.getByRole('button', { name: /Export/i }));

      expect(urlSpy).toHaveBeenCalled();
      // anchor was created and given a filename
      const anchor = createElSpy.mock.results.find((r) => (r.value as any)?.click)?.value as any;
      expect(anchor.download).toBe('BrandX_campaign_plan.csv');

      revokeSpy.mockRestore();
      urlSpy.mockRestore();
      createElSpy.mockRestore();
    });
  });
});
