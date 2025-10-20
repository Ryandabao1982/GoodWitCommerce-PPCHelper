import React, { useMemo, useState } from 'react';
import {
  Campaign,
  AdGroup,
  KeywordData,
  MatchType,
  PlannerNegativeKeyword as NegativeKeyword,
  NegativeMatchType,
} from '../types';
import { CAMPAIGN_TEMPLATES, createCampaignFromTemplate } from '../utils/campaignTemplates';
import { EmptyState } from './EmptyState';
import {
  buildNegativeKeywordCSV,
  parseNegativeKeywordCSV,
  parseNegativeKeywordInput,
  syncNegativeKeywordsToSupabase,
  DEFAULT_NEGATIVE_MATCH_TYPE,
} from '../utils/negativeKeywordIO';

interface CampaignManagerProps {
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  allKeywords: KeywordData[];
  activeBrandName: string;
}

type CampaignTab = 'structure' | 'negatives';
type NegativeScope = { type: 'campaign' } | { type: 'adGroup'; adGroupId: string };

const sanitizeNegativeKeyword = (value: string) => value.trim().replace(/\s+/g, ' ');

const ensureAdGroupDefaults = (adGroup: AdGroup): AdGroup => ({
  ...adGroup,
  negativeKeywords: adGroup.negativeKeywords ?? [],
  bidModifiers: adGroup.bidModifiers ?? { topOfSearch: 0, productPages: 0 },
});

const ensureCampaignDefaults = (campaign: Campaign): Campaign => ({
  ...campaign,
  negativeKeywords: campaign.negativeKeywords ?? [],
  adGroups: campaign.adGroups.map(ensureAdGroupDefaults),
});

const generateNegativeKeywordId = () =>
  `neg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const scopeKey = (campaignId: string, scope: NegativeScope) =>
  scope.type === 'campaign' ? `${campaignId}::campaign` : `${campaignId}::${scope.adGroupId}`;

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9_-]+/gi, '_');

interface FileReaderLike {
  result: string | ArrayBuffer | null;
  onload: null | (() => void);
  readAsText(file: File): void;
}

type FileReaderConstructorLike = new () => FileReaderLike;

const downloadCSV = (fileName: string, csv: string) => {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  onCampaignsChange,
  onAssignKeywords,
  allKeywords,
  activeBrandName,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number>(-1);
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [campaignAsin, setCampaignAsin] = useState<string>('');
  const [adGroupName, setAdGroupName] = useState<string>('Ad Group 1');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [editingAdGroup, setEditingAdGroup] = useState<{
    campaignId: string;
    adGroupId: string;
  } | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, CampaignTab>>({});
  const [newNegativeDrafts, setNewNegativeDrafts] = useState<
    Record<string, { keyword: string; matchType: NegativeMatchType; note: string }>
  >({});
  const [bulkNegativeDrafts, setBulkNegativeDrafts] = useState<
    Record<string, { text: string; matchType: NegativeMatchType }>
  >({});
  const [syncingTarget, setSyncingTarget] = useState<string | null>(null);

  const normalizedCampaigns = useMemo(() => campaigns.map(ensureCampaignDefaults), [campaigns]);

  const commitCampaigns = (next: Campaign[]) => {
    onCampaignsChange(next.map(ensureCampaignDefaults));
  };

  const getActiveTab = (campaignId: string): CampaignTab => activeTabs[campaignId] ?? 'structure';

  const setCampaignTab = (campaignId: string, tab: CampaignTab) => {
    setActiveTabs((prev) => ({ ...prev, [campaignId]: tab }));
  };

  const getNewDraft = (key: string) =>
    newNegativeDrafts[key] ?? { keyword: '', matchType: DEFAULT_NEGATIVE_MATCH_TYPE, note: '' };

  const setNewDraft = (
    key: string,
    draft: { keyword: string; matchType: NegativeMatchType; note: string }
  ) => {
    setNewNegativeDrafts((prev) => ({ ...prev, [key]: draft }));
  };

  const getBulkDraft = (key: string) =>
    bulkNegativeDrafts[key] ?? { text: '', matchType: DEFAULT_NEGATIVE_MATCH_TYPE };

  const setBulkDraft = (key: string, draft: { text: string; matchType: NegativeMatchType }) => {
    setBulkNegativeDrafts((prev) => ({ ...prev, [key]: draft }));
  };

  const applyNegativeKeywordUpdates = (
    campaignId: string,
    scope: NegativeScope,
    updater: (keywords: NegativeKeyword[]) => NegativeKeyword[]
  ) => {
    const updatedCampaigns = normalizedCampaigns.map((campaign) => {
      if (campaign.id !== campaignId) {
        return campaign;
      }

      if (scope.type === 'campaign') {
        return {
          ...campaign,
          negativeKeywords: updater(campaign.negativeKeywords ?? []),
        };
      }

      return {
        ...campaign,
        adGroups: campaign.adGroups.map((adGroup) =>
          adGroup.id === scope.adGroupId
            ? { ...adGroup, negativeKeywords: updater(adGroup.negativeKeywords ?? []) }
            : adGroup
        ),
      };
    });

    commitCampaigns(updatedCampaigns);
  };

  const addNegativeKeywordEntries = (
    campaignId: string,
    scope: NegativeScope,
    entries: { keyword: string; matchType: NegativeMatchType; note?: string }[],
    source: NegativeKeyword['source']
  ): boolean => {
    const sanitizedEntries = entries
      .map((entry) => ({
        keyword: sanitizeNegativeKeyword(entry.keyword),
        matchType: entry.matchType,
        note: entry.note?.trim() || undefined,
      }))
      .filter((entry) => entry.keyword.length > 0);

    if (sanitizedEntries.length === 0) {
      alert('Please provide at least one valid negative keyword.');
      return false;
    }

    let addedCount = 0;

    applyNegativeKeywordUpdates(campaignId, scope, (keywords) => {
      const existing = new Set(keywords.map((neg) => neg.keyword.toLowerCase()));
      const toAdd: NegativeKeyword[] = [];

      sanitizedEntries.forEach((entry) => {
        const lower = entry.keyword.toLowerCase();
        if (existing.has(lower)) {
          return;
        }
        existing.add(lower);
        toAdd.push({
          id: generateNegativeKeywordId(),
          keyword: entry.keyword,
          matchType: entry.matchType,
          note: entry.note,
          source,
          createdAt: new Date().toISOString(),
        });
      });

      addedCount = toAdd.length;
      return toAdd.length > 0 ? [...keywords, ...toAdd] : keywords;
    });

    if (addedCount === 0) {
      alert('No new negative keywords were added. They may already exist in this scope.');
      return false;
    }

    return true;
  };

  const handleAddNegativeKeyword = (campaignId: string, scope: NegativeScope) => {
    const key = scopeKey(campaignId, scope);
    const draft = getNewDraft(key);

    const added = addNegativeKeywordEntries(
      campaignId,
      scope,
      [
        {
          keyword: draft.keyword,
          matchType: draft.matchType,
          note: draft.note,
        },
      ],
      'manual'
    );

    if (added) {
      setNewDraft(key, { keyword: '', matchType: draft.matchType, note: '' });
    }
  };

  const handleBulkAddNegativeKeywords = (campaignId: string, scope: NegativeScope) => {
    const key = scopeKey(campaignId, scope);
    const bulk = getBulkDraft(key);
    const parsed = parseNegativeKeywordInput(bulk.text, bulk.matchType);

    const added = addNegativeKeywordEntries(campaignId, scope, parsed, 'imported');

    if (added) {
      setBulkDraft(key, { text: '', matchType: bulk.matchType });
    }
  };

  const handleImportNegativeKeywords = (campaignId: string, scope: NegativeScope, file: File) => {
    const fileReaderGlobal =
      typeof globalThis !== 'undefined' && 'FileReader' in globalThis
        ? (globalThis as Record<string, unknown>).FileReader
        : undefined;

    if (typeof fileReaderGlobal !== 'function') {
      console.warn('FileReader API is not available in this environment.');
      return;
    }
    const reader = new (fileReaderGlobal as FileReaderConstructorLike)();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseNegativeKeywordCSV(text);
      addNegativeKeywordEntries(campaignId, scope, parsed, 'imported');
    };
    reader.readAsText(file);
  };

  const handleUpdateNegativeKeyword = (
    campaignId: string,
    scope: NegativeScope,
    keywordId: string,
    updates: Partial<NegativeKeyword>
  ) => {
    applyNegativeKeywordUpdates(campaignId, scope, (keywords) => {
      const current = keywords.find((neg) => neg.id === keywordId);
      if (!current) {
        return keywords;
      }

      const nextKeyword =
        updates.keyword != null ? sanitizeNegativeKeyword(updates.keyword) : current.keyword;

      if (nextKeyword.length === 0) {
        alert('Negative keyword text cannot be empty.');
        return keywords;
      }

      if (
        updates.keyword &&
        keywords.some(
          (neg) => neg.id !== keywordId && neg.keyword.toLowerCase() === nextKeyword.toLowerCase()
        )
      ) {
        alert('Another negative keyword with this value already exists in this scope.');
        return keywords;
      }

      return keywords.map((neg) =>
        neg.id === keywordId
          ? {
              ...neg,
              ...updates,
              keyword: nextKeyword,
              updatedAt: new Date().toISOString(),
            }
          : neg
      );
    });
  };

  const handleRemoveNegativeKeyword = (
    campaignId: string,
    scope: NegativeScope,
    keywordId: string
  ) => {
    applyNegativeKeywordUpdates(campaignId, scope, (keywords) =>
      keywords.filter((neg) => neg.id !== keywordId)
    );
  };

  const handleClearNegativeKeywords = (campaignId: string, scope: NegativeScope) => {
    if (!window.confirm('Are you sure you want to remove all negative keywords for this scope?')) {
      return;
    }
    applyNegativeKeywordUpdates(campaignId, scope, () => []);
  };

  const handleExportNegativeKeywords = (campaign: Campaign) => {
    const scopedRows = [
      {
        scope: `${campaign.name} (Campaign)`,
        keywords: campaign.negativeKeywords ?? [],
      },
      ...campaign.adGroups.map((adGroup) => ({
        scope: `${campaign.name} > ${adGroup.name}`,
        keywords: adGroup.negativeKeywords ?? [],
      })),
    ]
      .filter((item) => item.keywords.length > 0)
      .flatMap((item) =>
        item.keywords.map((keyword) => ({
          keyword: keyword.keyword,
          matchType: keyword.matchType,
          note: keyword.note,
          scope: item.scope,
        }))
      );

    if (scopedRows.length === 0) {
      alert('No negative keywords available to export for this campaign.');
      return;
    }

    const csv = buildNegativeKeywordCSV(scopedRows);
    downloadCSV(`${sanitizeFileName(campaign.name)}_negative_keywords.csv`, csv);
  };

  const handleImportFromInput = (
    campaignId: string,
    scope: NegativeScope,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    handleImportNegativeKeywords(campaignId, scope, file);
    event.target.value = '';
  };

  const handleSyncNegatives = async (
    campaign: Campaign,
    scope: NegativeScope,
    scopeLabel: string
  ) => {
    const key = scopeKey(campaign.id, scope);
    if (syncingTarget) {
      return;
    }

    const targetKeywords =
      scope.type === 'campaign'
        ? (campaign.negativeKeywords ?? [])
        : (campaign.adGroups.find((adGroup) => adGroup.id === scope.adGroupId)?.negativeKeywords ??
          []);

    if (!targetKeywords || targetKeywords.length === 0) {
      alert('No negative keywords to sync for this scope.');
      return;
    }

    try {
      setSyncingTarget(key);
      const synced = await syncNegativeKeywordsToSupabase({
        brandId: activeBrandName,
        campaignId: campaign.id,
        keywords: targetKeywords,
        reason: `Planner sync for ${scopeLabel}`,
      });

      if (!synced) {
        alert(
          'Supabase is not configured. Add Supabase credentials in Settings to enable syncing.'
        );
        return;
      }

      alert('Negative keywords synced to Supabase successfully.');
    } catch (error) {
      console.error('Failed to sync negative keywords', error);
      alert('Failed to sync negative keywords to Supabase. Check the console for details.');
    } finally {
      setSyncingTarget(null);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    const budgetValue = parseFloat(dailyBudget);
    if (!dailyBudget || isNaN(budgetValue) || budgetValue <= 0) {
      alert('Please enter a valid positive number for daily budget');
      return;
    }

    if (!campaignAsin.trim()) {
      alert('Please enter an ASIN for this campaign');
      return;
    }

    if (!adGroupName.trim()) {
      alert('Please enter an ad group name');
      return;
    }

    // Validate ASIN format
    const trimmedAsin = campaignAsin.trim().toUpperCase();
    if (!/^B[A-Z0-9]{9}$/.test(trimmedAsin)) {
      alert('Invalid ASIN format. Should be 10 characters starting with B (e.g., B08N5WRWNW)');
      return;
    }

    let newCampaign: Campaign;

    if (selectedTemplate >= 0 && selectedTemplate < CAMPAIGN_TEMPLATES.length) {
      // Create from template
      const template = CAMPAIGN_TEMPLATES[selectedTemplate];
      const budget = parseFloat(dailyBudget);
      newCampaign = createCampaignFromTemplate(template, newCampaignName.trim(), budget);
      // Update ASIN and ad group name
      newCampaign.asin = trimmedAsin;
      if (newCampaign.adGroups.length > 0) {
        newCampaign.adGroups[0].name = adGroupName.trim();
        newCampaign.adGroups[0].asin = trimmedAsin;
        newCampaign.adGroups[0].negativeKeywords = newCampaign.adGroups[0].negativeKeywords ?? [];
      }
    } else {
      // Create custom campaign
      newCampaign = {
        id: `campaign-${Date.now()}`,
        name: newCampaignName.trim(),
        dailyBudget: parseFloat(dailyBudget),
        asin: trimmedAsin,
        adGroups: [
          {
            id: `adgroup-${Date.now()}`,
            name: adGroupName.trim(),
            keywords: [],
            defaultBid: 1.0,
            defaultMatchType: 'Broad',
            bidModifiers: { topOfSearch: 50, productPages: 0 },
            asin: trimmedAsin,
            negativeKeywords: [],
          },
        ],
        negativeKeywords: [],
      };
    }

    commitCampaigns([...normalizedCampaigns, ensureCampaignDefaults(newCampaign)]);
    setNewCampaignName('');
    setSelectedTemplate(-1);
    setDailyBudget('');
    setCampaignAsin('');
    setAdGroupName('Ad Group 1');
    setShowCreateModal(false);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      commitCampaigns(normalizedCampaigns.filter((c) => c.id !== campaignId));
    }
  };

  const handleAddAdGroup = (campaignId: string) => {
    const campaign = normalizedCampaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const newAdGroup: AdGroup = {
      id: `adgroup-${Date.now()}`,
      name: `Ad Group ${campaign.adGroups.length + 1}`,
      keywords: [],
      defaultBid: 1.0,
      defaultMatchType: 'Broad',
      bidModifiers: { topOfSearch: 50, productPages: 0 },
      negativeKeywords: [],
    };

    const updatedCampaigns = normalizedCampaigns.map((c) =>
      c.id === campaignId ? { ...c, adGroups: [...c.adGroups, newAdGroup] } : c
    );

    commitCampaigns(updatedCampaigns);
  };

  const handleDeleteAdGroup = (campaignId: string, adGroupId: string) => {
    if (window.confirm('Are you sure you want to delete this ad group?')) {
      const updatedCampaigns = normalizedCampaigns.map((c) =>
        c.id === campaignId ? { ...c, adGroups: c.adGroups.filter((ag) => ag.id !== adGroupId) } : c
      );
      commitCampaigns(updatedCampaigns);
    }
  };

  const handleUpdateCampaignBudget = (campaignId: string, budget: number) => {
    const updatedCampaigns = normalizedCampaigns.map((c) =>
      c.id === campaignId ? { ...c, dailyBudget: budget } : c
    );
    commitCampaigns(updatedCampaigns);
  };

  const handleUpdateAdGroup = (
    campaignId: string,
    adGroupId: string,
    updates: Partial<AdGroup>
  ) => {
    const updatedCampaigns = normalizedCampaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          adGroups: c.adGroups.map((ag) =>
            ag.id === adGroupId
              ? {
                  ...ag,
                  ...updates,
                  negativeKeywords: updates.negativeKeywords ?? ag.negativeKeywords ?? [],
                }
              : ag
          ),
        };
      }
      return c;
    });
    commitCampaigns(updatedCampaigns);
  };

  const handleDistributeBudget = (campaignId: string) => {
    const campaign = normalizedCampaigns.find((c) => c.id === campaignId);
    if (!campaign || campaign.dailyBudget == null || campaign.adGroups.length === 0) return;

    const budgetPerAdGroup = campaign.dailyBudget / campaign.adGroups.length;
    const updatedCampaigns = normalizedCampaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          adGroups: c.adGroups.map((ag) => ({ ...ag, budget: budgetPerAdGroup })),
        };
      }
      return c;
    });
    commitCampaigns(updatedCampaigns);
  };

  const handleDrop = (e: React.DragEvent, campaignId: string, adGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const keywordsData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (Array.isArray(keywordsData) && keywordsData.length > 0) {
        onAssignKeywords(campaignId, adGroupId, keywordsData);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const toggleCampaign = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const handleExportCampaign = () => {
    const csvContent = [
      [
        'Campaign Name',
        'Daily Budget',
        'Ad Group Name',
        'Ad Group Budget',
        'Keyword Text',
        'Match Type',
        'Bid',
        'Top of Search %',
        'Product Pages %',
        'Status',
      ].join(','),
      ...normalizedCampaigns.flatMap((campaign) =>
        campaign.adGroups.flatMap((adGroup) =>
          adGroup.keywords.length > 0
            ? adGroup.keywords.map((keyword) =>
                [
                  campaign.name,
                  campaign.dailyBudget || '',
                  adGroup.name,
                  adGroup.budget?.toFixed(2) || '',
                  keyword,
                  adGroup.defaultMatchType || 'Broad',
                  adGroup.defaultBid?.toFixed(2) || '',
                  adGroup.bidModifiers?.topOfSearch || 0,
                  adGroup.bidModifiers?.productPages || 0,
                  'Enabled',
                ].join(',')
              )
            : [
                [
                  campaign.name,
                  campaign.dailyBudget || '',
                  adGroup.name,
                  adGroup.budget?.toFixed(2) || '',
                  '',
                  adGroup.defaultMatchType || 'Broad',
                  adGroup.defaultBid?.toFixed(2) || '',
                  adGroup.bidModifiers?.topOfSearch || 0,
                  adGroup.bidModifiers?.productPages || 0,
                  'Enabled',
                ].join(','),
              ]
        )
      ),
    ].join('\n');

    // Add UTF-8 BOM for proper Excel compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBrandName}_campaign_plan.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show empty state if no campaigns
  if (normalizedCampaigns.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Campaign Manager
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ➕ New Campaign
          </button>
        </div>
        <EmptyState
          type="no-campaigns"
          onPrimaryAction={() => setShowCreateModal(true)}
          onSecondaryAction={() => {
            // Could show templates modal or guide
            alert(
              'Campaign templates help you create optimized structures based on Amazon PPC best practices. Click "New Campaign" to get started!'
            );
          }}
        />

        {/* Campaign Creation Modal - still needed for empty state */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New Campaign
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="e.g., Headphones - Exact Match"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={activeBrandName}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Campaign is automatically linked to active brand
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Daily Budget <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(e.target.value)}
                        placeholder="e.g., 50.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product ASIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={campaignAsin}
                      onChange={(e) => setCampaignAsin(e.target.value)}
                      placeholder="e.g., B08N5WRWNW"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      10-character Amazon product identifier (starts with B)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Ad Group Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={adGroupName}
                      onChange={(e) => setAdGroupName(e.target.value)}
                      placeholder="e.g., Main Keywords"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template (Optional)
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={-1}>Custom (Blank)</option>
                      {CAMPAIGN_TEMPLATES.map((template, index) => (
                        <option key={index} value={index}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pre-configured campaign structures or create custom
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            Total Campaigns
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {normalizedCampaigns.length}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-800 dark:text-green-300 font-medium">Ad Groups</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {normalizedCampaigns.reduce((sum, c) => sum + c.adGroups.length, 0)}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">
            Assigned Keywords
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {normalizedCampaigns.reduce(
              (sum, c) => sum + c.adGroups.reduce((s, ag) => s + ag.keywords.length, 0),
              0
            )}
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-sm text-orange-800 dark:text-orange-300 font-medium">
            Available Keywords
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
            {allKeywords.length}
          </div>
        </div>
      </div>

      {/* Campaign Planner Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Campaign Planner Tips
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>
            • Use templates to create optimized campaign structures based on Amazon best practices
          </li>
          <li>• Drag keywords from the Keyword Bank directly onto ad groups</li>
          <li>• Set different match types and bids for each ad group to test performance</li>
          <li>• Export campaigns to CSV for easy bulk upload to Amazon</li>
        </ul>
      </div>

      {/* Main Campaign Manager */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Campaign Structure
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Build and organize your Amazon PPC campaigns
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {normalizedCampaigns.length > 0 && (
              <button
                onClick={handleExportCampaign}
                className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                📥 Export
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
            >
              ➕ New Campaign
            </button>
          </div>
        </div>

        {normalizedCampaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="mb-4">No campaigns yet. Create your first campaign to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {normalizedCampaigns.map((campaign) => {
              const campaignScope: NegativeScope = { type: 'campaign' };
              const campaignScopeKey = scopeKey(campaign.id, campaignScope);
              const campaignDraft = getNewDraft(campaignScopeKey);
              const campaignBulk = getBulkDraft(campaignScopeKey);
              const isSyncingCampaign = syncingTarget === campaignScopeKey;
              const activeTab = getActiveTab(campaign.id);

              return (
                <div
                  key={campaign.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <button
                      onClick={() => toggleCampaign(campaign.id)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedCampaigns.has(campaign.id) ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </span>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {campaign.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0)}{' '}
                            keywords
                          </span>
                          {campaign.dailyBudget && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ${campaign.dailyBudget.toFixed(2)}/day
                            </span>
                          )}
                          {campaign.asin && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">
                              {campaign.asin}
                            </span>
                          )}
                          {campaign.negativeKeywords?.length ? (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-xs">
                              {campaign.negativeKeywords.length} negatives
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-2 items-center">
                      {editingCampaign === campaign.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Budget"
                            value={campaign.dailyBudget ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateCampaignBudget(
                                campaign.id,
                                val === '' ? undefined : parseFloat(val)
                              );
                            }}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              handleDistributeBudget(campaign.id);
                              setEditingCampaign(null);
                            }}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                            title="Distribute budget evenly to ad groups"
                          >
                            Distribute
                          </button>
                          <button
                            onClick={() => setEditingCampaign(null)}
                            className="p-1 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCampaign(campaign.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Edit budget"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleAddAdGroup(campaign.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Add ad group"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete campaign"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {expandedCampaigns.has(campaign.id) && (
                    <div className="p-4 space-y-4">
                      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                        <button
                          onClick={() => setCampaignTab(campaign.id, 'structure')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'structure' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          Structure
                        </button>
                        <button
                          onClick={() => setCampaignTab(campaign.id, 'negatives')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'negatives' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          Negative Keywords
                        </button>
                      </div>

                      {activeTab === 'structure' ? (
                        <div className="space-y-3">
                          {campaign.adGroups.map((adGroup) => (
                            <div
                              key={adGroup.id}
                              onDrop={(e) => handleDrop(e, campaign.id, adGroup.id)}
                              onDragOver={handleDragOver}
                              className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {adGroup.name} ({adGroup.keywords.length})
                                    </span>
                                    {adGroup.asin && (
                                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-mono">
                                        {adGroup.asin}
                                      </span>
                                    )}
                                    <button
                                      onClick={() =>
                                        setEditingAdGroup(
                                          editingAdGroup?.adGroupId === adGroup.id
                                            ? null
                                            : { campaignId: campaign.id, adGroupId: adGroup.id }
                                        )
                                      }
                                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      title="Edit ad group settings"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  {editingAdGroup?.campaignId === campaign.id &&
                                  editingAdGroup?.adGroupId === adGroup.id ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                      <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">
                                          Default Bid ($)
                                        </label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={adGroup.defaultBid || ''}
                                          onChange={(e) =>
                                            handleUpdateAdGroup(campaign.id, adGroup.id, {
                                              defaultBid:
                                                e.target.value === ''
                                                  ? undefined
                                                  : parseFloat(e.target.value),
                                            })
                                          }
                                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">
                                          Match Type
                                        </label>
                                        <select
                                          value={adGroup.defaultMatchType || 'Broad'}
                                          onChange={(e) =>
                                            handleUpdateAdGroup(campaign.id, adGroup.id, {
                                              defaultMatchType: e.target.value as MatchType,
                                            })
                                          }
                                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                        >
                                          <option value="Broad">Broad</option>
                                          <option value="Phrase">Phrase</option>
                                          <option value="Exact">Exact</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">
                                          Top of Search %
                                        </label>
                                        <input
                                          type="number"
                                          step="5"
                                          min="-100"
                                          max="900"
                                          value={adGroup.bidModifiers?.topOfSearch || 0}
                                          onChange={(e) =>
                                            handleUpdateAdGroup(campaign.id, adGroup.id, {
                                              bidModifiers: {
                                                ...adGroup.bidModifiers,
                                                topOfSearch: parseInt(e.target.value) || 0,
                                              },
                                            })
                                          }
                                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">
                                          Product Pages %
                                        </label>
                                        <input
                                          type="number"
                                          step="5"
                                          min="-100"
                                          max="900"
                                          value={adGroup.bidModifiers?.productPages || 0}
                                          onChange={(e) =>
                                            handleUpdateAdGroup(campaign.id, adGroup.id, {
                                              bidModifiers: {
                                                ...adGroup.bidModifiers,
                                                productPages: parseInt(e.target.value) || 0,
                                              },
                                            })
                                          }
                                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                                      {adGroup.defaultBid && (
                                        <span>Bid: ${adGroup.defaultBid.toFixed(2)}</span>
                                      )}
                                      {adGroup.defaultMatchType && (
                                        <span>Match: {adGroup.defaultMatchType}</span>
                                      )}
                                      {adGroup.budget && (
                                        <span className="text-green-600 dark:text-green-400">
                                          Budget: ${adGroup.budget.toFixed(2)}
                                        </span>
                                      )}
                                      {adGroup.bidModifiers?.topOfSearch !== 0 && (
                                        <span>
                                          ToS: {adGroup.bidModifiers?.topOfSearch > 0 ? '+' : ''}
                                          {adGroup.bidModifiers?.topOfSearch}%
                                        </span>
                                      )}
                                      {adGroup.bidModifiers?.productPages !== 0 && (
                                        <span>
                                          PP: {adGroup.bidModifiers?.productPages > 0 ? '+' : ''}
                                          {adGroup.bidModifiers?.productPages}%
                                        </span>
                                      )}
                                      {adGroup.negativeKeywords?.length ? (
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                                          {adGroup.negativeKeywords.length} negatives
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteAdGroup(campaign.id, adGroup.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete ad group"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {adGroup.keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {adGroup.keywords.map((kw, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  Drag keywords here or use the assign button
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Campaign Negative Keywords
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Manage negatives applied across this campaign. (
                                  {campaign.negativeKeywords?.length ?? 0} total)
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleExportNegativeKeywords(campaign)}
                                  className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                  Export
                                </button>
                                <label className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                  Import
                                  <input
                                    type="file"
                                    accept=".csv,.txt"
                                    className="sr-only"
                                    onChange={(event) =>
                                      handleImportFromInput(campaign.id, campaignScope, event)
                                    }
                                  />
                                </label>
                                <button
                                  onClick={() =>
                                    handleClearNegativeKeywords(campaign.id, campaignScope)
                                  }
                                  className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                                  disabled={(campaign.negativeKeywords?.length ?? 0) === 0}
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() =>
                                    handleSyncNegatives(
                                      campaign,
                                      campaignScope,
                                      `${campaign.name} (Campaign)`
                                    )
                                  }
                                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
                                  disabled={isSyncingCampaign}
                                >
                                  {isSyncingCampaign ? 'Syncing…' : 'Sync to Supabase'}
                                </button>
                              </div>
                            </div>

                            {campaign.negativeKeywords && campaign.negativeKeywords.length > 0 ? (
                              <div className="space-y-2">
                                {campaign.negativeKeywords.map((negative) => (
                                  <div
                                    key={negative.id}
                                    className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,auto] items-center"
                                  >
                                    <input
                                      value={negative.keyword}
                                      onChange={(e) =>
                                        handleUpdateNegativeKeyword(
                                          campaign.id,
                                          campaignScope,
                                          negative.id,
                                          { keyword: e.target.value }
                                        )
                                      }
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    />
                                    <select
                                      value={negative.matchType}
                                      onChange={(e) =>
                                        handleUpdateNegativeKeyword(
                                          campaign.id,
                                          campaignScope,
                                          negative.id,
                                          { matchType: e.target.value as NegativeMatchType }
                                        )
                                      }
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    >
                                      <option value="Negative Phrase">Negative Phrase</option>
                                      <option value="Negative Exact">Negative Exact</option>
                                    </select>
                                    <input
                                      value={negative.note ?? ''}
                                      placeholder="Note (optional)"
                                      onChange={(e) =>
                                        handleUpdateNegativeKeyword(
                                          campaign.id,
                                          campaignScope,
                                          negative.id,
                                          { note: e.target.value }
                                        )
                                      }
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() =>
                                          handleRemoveNegativeKeyword(
                                            campaign.id,
                                            campaignScope,
                                            negative.id
                                          )
                                        }
                                        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                No campaign-level negative keywords yet.
                              </p>
                            )}

                            <div className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,auto] items-center">
                              <input
                                value={campaignDraft.keyword}
                                onChange={(e) =>
                                  setNewDraft(campaignScopeKey, {
                                    ...campaignDraft,
                                    keyword: e.target.value,
                                  })
                                }
                                placeholder="Add negative keyword"
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                              />
                              <select
                                value={campaignDraft.matchType}
                                onChange={(e) =>
                                  setNewDraft(campaignScopeKey, {
                                    ...campaignDraft,
                                    matchType: e.target.value as NegativeMatchType,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                              >
                                <option value="Negative Phrase">Negative Phrase</option>
                                <option value="Negative Exact">Negative Exact</option>
                              </select>
                              <input
                                value={campaignDraft.note}
                                onChange={(e) =>
                                  setNewDraft(campaignScopeKey, {
                                    ...campaignDraft,
                                    note: e.target.value,
                                  })
                                }
                                placeholder="Note (optional)"
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() =>
                                    handleAddNegativeKeyword(campaign.id, campaignScope)
                                  }
                                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Bulk add from list
                              </label>
                              <textarea
                                value={campaignBulk.text}
                                onChange={(e) =>
                                  setBulkDraft(campaignScopeKey, {
                                    ...campaignBulk,
                                    text: e.target.value,
                                  })
                                }
                                placeholder="Enter one keyword per line or separate with commas"
                                className="w-full min-h-[80px] px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                              />
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Match Type
                                  </span>
                                  <select
                                    value={campaignBulk.matchType}
                                    onChange={(e) =>
                                      setBulkDraft(campaignScopeKey, {
                                        ...campaignBulk,
                                        matchType: e.target.value as NegativeMatchType,
                                      })
                                    }
                                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                  >
                                    <option value="Negative Phrase">Negative Phrase</option>
                                    <option value="Negative Exact">Negative Exact</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() =>
                                    handleBulkAddNegativeKeywords(campaign.id, campaignScope)
                                  }
                                  className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                  Add from List
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Ad Group Negative Keywords
                            </h4>
                            {campaign.adGroups.map((adGroup) => {
                              const adGroupScope: NegativeScope = {
                                type: 'adGroup',
                                adGroupId: adGroup.id,
                              };
                              const adGroupKey = scopeKey(campaign.id, adGroupScope);
                              const adGroupDraft = getNewDraft(adGroupKey);
                              const adGroupBulk = getBulkDraft(adGroupKey);
                              const isSyncingAdGroup = syncingTarget === adGroupKey;

                              return (
                                <div
                                  key={adGroup.id}
                                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {adGroup.name}
                                      </h5>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {adGroup.negativeKeywords?.length || 0} negative keywords
                                        attached to this ad group.
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <label className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        Import
                                        <input
                                          type="file"
                                          accept=".csv,.txt"
                                          className="sr-only"
                                          onChange={(event) =>
                                            handleImportFromInput(campaign.id, adGroupScope, event)
                                          }
                                        />
                                      </label>
                                      <button
                                        onClick={() =>
                                          handleClearNegativeKeywords(campaign.id, adGroupScope)
                                        }
                                        className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                                        disabled={(adGroup.negativeKeywords?.length ?? 0) === 0}
                                      >
                                        Clear
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSyncNegatives(
                                            campaign,
                                            adGroupScope,
                                            `${campaign.name} › ${adGroup.name}`
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
                                        disabled={isSyncingAdGroup}
                                      >
                                        {isSyncingAdGroup ? 'Syncing…' : 'Sync to Supabase'}
                                      </button>
                                    </div>
                                  </div>

                                  {adGroup.negativeKeywords &&
                                  adGroup.negativeKeywords.length > 0 ? (
                                    <div className="space-y-2">
                                      {adGroup.negativeKeywords.map((negative) => (
                                        <div
                                          key={negative.id}
                                          className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,auto] items-center"
                                        >
                                          <input
                                            value={negative.keyword}
                                            onChange={(e) =>
                                              handleUpdateNegativeKeyword(
                                                campaign.id,
                                                adGroupScope,
                                                negative.id,
                                                { keyword: e.target.value }
                                              )
                                            }
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                          />
                                          <select
                                            value={negative.matchType}
                                            onChange={(e) =>
                                              handleUpdateNegativeKeyword(
                                                campaign.id,
                                                adGroupScope,
                                                negative.id,
                                                { matchType: e.target.value as NegativeMatchType }
                                              )
                                            }
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                          >
                                            <option value="Negative Phrase">Negative Phrase</option>
                                            <option value="Negative Exact">Negative Exact</option>
                                          </select>
                                          <input
                                            value={negative.note ?? ''}
                                            placeholder="Note (optional)"
                                            onChange={(e) =>
                                              handleUpdateNegativeKeyword(
                                                campaign.id,
                                                adGroupScope,
                                                negative.id,
                                                { note: e.target.value }
                                              )
                                            }
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                          />
                                          <div className="flex justify-end">
                                            <button
                                              onClick={() =>
                                                handleRemoveNegativeKeyword(
                                                  campaign.id,
                                                  adGroupScope,
                                                  negative.id
                                                )
                                              }
                                              className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      No negatives for this ad group yet.
                                    </p>
                                  )}

                                  <div className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,auto] items-center">
                                    <input
                                      value={adGroupDraft.keyword}
                                      onChange={(e) =>
                                        setNewDraft(adGroupKey, {
                                          ...adGroupDraft,
                                          keyword: e.target.value,
                                        })
                                      }
                                      placeholder="Add negative keyword"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    />
                                    <select
                                      value={adGroupDraft.matchType}
                                      onChange={(e) =>
                                        setNewDraft(adGroupKey, {
                                          ...adGroupDraft,
                                          matchType: e.target.value as NegativeMatchType,
                                        })
                                      }
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    >
                                      <option value="Negative Phrase">Negative Phrase</option>
                                      <option value="Negative Exact">Negative Exact</option>
                                    </select>
                                    <input
                                      value={adGroupDraft.note}
                                      onChange={(e) =>
                                        setNewDraft(adGroupKey, {
                                          ...adGroupDraft,
                                          note: e.target.value,
                                        })
                                      }
                                      placeholder="Note (optional)"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() =>
                                          handleAddNegativeKeyword(campaign.id, adGroupScope)
                                        }
                                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      Bulk add from list
                                    </label>
                                    <textarea
                                      value={adGroupBulk.text}
                                      onChange={(e) =>
                                        setBulkDraft(adGroupKey, {
                                          ...adGroupBulk,
                                          text: e.target.value,
                                        })
                                      }
                                      placeholder="Enter one keyword per line or separate with commas"
                                      className="w-full min-h-[80px] px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                    />
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          Match Type
                                        </span>
                                        <select
                                          value={adGroupBulk.matchType}
                                          onChange={(e) =>
                                            setBulkDraft(adGroupKey, {
                                              ...adGroupBulk,
                                              matchType: e.target.value as NegativeMatchType,
                                            })
                                          }
                                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                                        >
                                          <option value="Negative Phrase">Negative Phrase</option>
                                          <option value="Negative Exact">Negative Exact</option>
                                        </select>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleBulkAddNegativeKeywords(campaign.id, adGroupScope)
                                        }
                                        className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                      >
                                        Add from List
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Campaign
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      const templateIndex = parseInt(e.target.value);
                      setSelectedTemplate(templateIndex);
                      if (templateIndex >= 0 && templateIndex < CAMPAIGN_TEMPLATES.length) {
                        const template = CAMPAIGN_TEMPLATES[templateIndex];
                        setNewCampaignName(template.name);
                        if (template.suggestedDailyBudget) {
                          setDailyBudget(template.suggestedDailyBudget.toString());
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="-1">Custom campaign...</option>
                    {CAMPAIGN_TEMPLATES.map((template, idx) => (
                      <option key={idx} value={idx}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate >= 0 && selectedTemplate < CAMPAIGN_TEMPLATES.length && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Category:</strong> {CAMPAIGN_TEMPLATES[selectedTemplate].category}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Ad Groups:</strong>{' '}
                        {CAMPAIGN_TEMPLATES[selectedTemplate].adGroups.length}
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {CAMPAIGN_TEMPLATES[selectedTemplate].adGroups.map((ag, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-700"
                          >
                            <span>{ag.name}</span>
                            <span className="flex gap-2">
                              {ag.defaultMatchType && (
                                <span className="text-blue-600 dark:text-blue-400">
                                  {ag.defaultMatchType}
                                </span>
                              )}
                              {ag.defaultBid && (
                                <span className="text-green-600 dark:text-green-400">
                                  ${ag.defaultBid}
                                </span>
                              )}
                              {ag.budgetPercent && (
                                <span className="text-purple-600 dark:text-purple-400">
                                  {ag.budgetPercent}%
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Enter campaign name..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    placeholder="Enter daily budget..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Budget will be distributed to ad groups based on template percentages
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(-1);
                    setNewCampaignName('');
                    setDailyBudget('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
