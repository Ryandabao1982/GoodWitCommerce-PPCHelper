import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import '@testing-library/jest-dom';
import { CampaignManager } from '../../components/CampaignManager';
import type { Campaign, KeywordData } from '../../types';
import { CAMPAIGN_TEMPLATES } from '../../utils/campaignTemplates';

describe('CampaignManager', () => {
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
      },
      {
        id: 'ag-2',
        name: 'Ad Group 2',
        keywords: [],
        defaultBid: 1,
        defaultMatchType: 'Broad',
        bidModifiers: { topOfSearch: 0, productPages: 0 },
      },
      {
        id: 'ag-3',
        name: 'Ad Group 3',
        keywords: [],
        defaultBid: 1,
        defaultMatchType: 'Broad',
        bidModifiers: { topOfSearch: 0, productPages: 0 },
      },
    ],
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
      renderCM({ campaigns: [makeCampaign()] });
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
      renderCM({ campaigns: [makeCampaign()] });
      fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));

      const idx = CAMPAIGN_TEMPLATES.findIndex((t) => t.name.includes('Manual Exact'));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: String(idx) } });

      const budgetInput = screen.getByPlaceholderText(/Enter daily budget/i) as HTMLInputElement;
      fireEvent.change(budgetInput, { target: { value: '45.5' } });
      const asinInput = screen.getByPlaceholderText(/B08N5WRWNW/i) as HTMLInputElement;
      fireEvent.change(asinInput, { target: { value: 'b07pgl2n7j' } });

      const createBtn = screen.getByRole('button', { name: /Create Campaign/i });
      expect(createBtn).not.toBeDisabled();

      fireEvent.click(createBtn);
      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);

      const arg = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(arg).toHaveLength(2);
      const created = arg[1];
      expect(created.name).toBe(CAMPAIGN_TEMPLATES[idx].name);
      expect(created.adGroups.length).toBe(CAMPAIGN_TEMPLATES[idx].adGroups.length);
      expect(created.asin).toBe('B07PGL2N7J');
      expect(created.adGroups[0].asin).toBe('B07PGL2N7J');
    });

    it('shows inline validation and disables submit until form is valid', () => {
      renderCM({ campaigns: [makeCampaign()] });
      fireEvent.click(screen.getByRole('button', { name: /New Campaign/i }));

      const createBtn = screen.getByRole('button', { name: /Create Campaign/i });
      expect(createBtn).toBeDisabled();

      const nameInput = screen.getByPlaceholderText(/Enter campaign name/i) as HTMLInputElement;
      const budgetInput = screen.getByPlaceholderText(/Enter daily budget/i) as HTMLInputElement;
      const asinInput = screen.getByPlaceholderText(/B08N5WRWNW/i) as HTMLInputElement;
      const adGroupInput = screen.getByPlaceholderText(/Main Keywords/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: ' ' } });
      expect(screen.getByText(/Campaign name is required/i)).toBeInTheDocument();
      expect(createBtn).toBeDisabled();

      fireEvent.change(nameInput, { target: { value: 'Spring Launch' } });
      expect(screen.queryByText(/Campaign name is required/i)).not.toBeInTheDocument();

      fireEvent.change(budgetInput, { target: { value: '-5' } });
      expect(screen.getByText(/Enter a valid positive daily budget/i)).toBeInTheDocument();
      expect(createBtn).toBeDisabled();
      fireEvent.change(budgetInput, { target: { value: '35' } });

      fireEvent.change(adGroupInput, { target: { value: '' } });
      expect(screen.getByText(/Ad group name is required/i)).toBeInTheDocument();
      fireEvent.change(adGroupInput, { target: { value: 'Primary Keywords' } });

      fireEvent.change(asinInput, { target: { value: '123' } });
      expect(screen.getByText(/Invalid ASIN format/i)).toBeInTheDocument();
      expect(createBtn).toBeDisabled();

      fireEvent.change(asinInput, { target: { value: 'B08N5WRWNW' } });
      expect(screen.queryByText(/Invalid ASIN format/i)).not.toBeInTheDocument();
      expect(createBtn).not.toBeDisabled();
    });
  });

  describe('Campaign row actions', () => {
    it('expands/collapses campaign to show ad groups', () => {
      renderCM({ campaigns: [makeCampaign()] });
      // button contains campaign name text
      const expandBtn = screen.getByRole('button', { name: /Test Campaign/i });
      fireEvent.click(expandBtn);

      expect(
        screen.getAllByText(/Drag keywords here or use the assign button/i).length
      ).toBeGreaterThan(0);

      // collapse
      fireEvent.click(expandBtn);
      expect(
        screen.queryByText(/Drag keywords here or use the assign button/i)
      ).not.toBeInTheDocument();
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
      renderCM({ campaigns: [makeCampaign()] });
      fireEvent.click(screen.getByTitle(/Delete campaign/i));
      const dialog = screen.getByRole('dialog', { name: /Delete Campaign/i });
      fireEvent.click(within(dialog).getByRole('button', { name: /Delete Campaign/i }));

      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(updated).toHaveLength(0);
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
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));

      const deleteAgBtn = screen.getAllByTitle(/Delete ad group/i)[0];
      fireEvent.click(deleteAgBtn);

      const adGroupDialog = screen.getByRole('dialog', { name: /Delete Ad Group/i });
      fireEvent.click(within(adGroupDialog).getByRole('button', { name: /Delete Ad Group/i }));

      expect(mockOnCampaignsChange).toHaveBeenCalledTimes(1);
      const updated = mockOnCampaignsChange.mock.calls[0][0] as Campaign[];
      expect(updated[0].adGroups.length).toBe(c.adGroups.length - 1);
    });
  });

  describe('Drag-and-drop assignment', () => {
    it('handles dropping keywords on an ad group', () => {
      const c = makeCampaign();
      renderCM({ campaigns: [c] });

      fireEvent.click(screen.getByRole('button', { name: /Test Campaign/i }));

      const dropHint = screen.getAllByText(/Drag keywords here or use the assign button/i)[0];
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
      const originalCreate = (URL as any).createObjectURL;
      const originalRevoke = (URL as any).revokeObjectURL;
      const urlMock = vi.fn().mockReturnValue('blob:fake');
      const revokeMock = vi.fn();
      (URL as any).createObjectURL = urlMock;
      (URL as any).revokeObjectURL = revokeMock;
      const originalCreateElement = document.createElement;
      const createdAnchors: any[] = [];
      const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
        if (tag === 'a') {
          const anchorMock = {
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
          createdAnchors.push(anchorMock);
          return anchorMock;
        }
        return originalCreateElement.call(document, tag);
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

      expect(urlMock).toHaveBeenCalled();
      // anchor was created and given a filename
      const anchor = createdAnchors.at(-1);
      expect(anchor.download).toBe('BrandX_campaign_plan.csv');
      expect(revokeMock).toHaveBeenCalled();

      createElSpy.mockRestore();
      if (originalCreate) {
        (URL as any).createObjectURL = originalCreate;
      } else {
        delete (URL as any).createObjectURL;
      }
      if (originalRevoke) {
        (URL as any).revokeObjectURL = originalRevoke;
      } else {
        delete (URL as any).revokeObjectURL;
      }
    });
  });
});
