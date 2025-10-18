import React, { useState, useMemo } from 'react';
import type { Campaign, AdGroup, KeywordData } from '../types';
import { fetchCampaignProjections } from '../services/geminiService';
import { CampaignExportButton } from './CampaignExportButton';


interface CampaignManagerProps {
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  allKeywords: KeywordData[];
  activeBrandName: string;
}

// --- Campaign Templates ---
type CampaignTemplate = {
    type: string;
    label: string;
    description: string;
    generateAdGroups: (prefix: string) => AdGroup[];
};

const campaignTemplates: CampaignTemplate[] = [
    {
        type: 'custom',
        label: 'Manual - Custom',
        description: 'Create a blank campaign. You will need to add all ad groups manually.',
        generateAdGroups: () => [],
    },
    {
        type: 'sp_auto_research',
        label: 'SP - Auto Research',
        description: 'Discovery via broad auto targeting to capture new search terms.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Auto Research`, keywords: [] },
        ],
    },
    {
        type: 'sp_broad_research',
        label: 'SP - Broad Research',
        description: 'Keyword research at a broad match level to discover related queries.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Broad Research`, keywords: [] },
        ],
    },
    {
        type: 'sp_phrase_research',
        label: 'SP - Phrase Research',
        description: 'Keyword research at a phrase level to capture variations.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Phrase Research`, keywords: [] },
        ],
    },
    {
        type: 'sp_exact_performance',
        label: 'SP - Exact Performance',
        description: 'Performance driver for proven, curated winning keywords.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Exact Winners`, keywords: [] },
        ],
    },
    {
        type: 'sp_exact_skag',
        label: 'SP - Exact SKAG',
        description: 'Single Keyword Ad Group for highest-priority terms to control bids tightly.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - SKAG`, keywords: [] },
        ],
    },
    {
        type: 'sp_branded',
        label: 'SP - Branded Defense',
        description: 'Defensive branded campaigns using Exact and Phrase match.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Brand Exact`, keywords: [] },
            { id: `adgroup-${Date.now() + 1}`, name: `${prefix} - Brand Phrase`, keywords: [] },
        ],
    },
    {
        type: 'sp_pt_branded',
        label: 'SP - Product Targeting (Branded)',
        description: 'Defend brand catalog and boost attach rate by targeting own ASINs.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - PT - Own ASINs`, keywords: [] },
        ],
    },
     {
        type: 'sp_pt_crosssell',
        label: 'SP - Product Targeting (Cross-sell)',
        description: 'Cross-sell onto competitor or complementary ASINs.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - PT - Competitor ASINs`, keywords: [] },
            { id: `adgroup-${Date.now() + 1}`, name: `${prefix} - PT - Complementary`, keywords: [] },
        ],
    },
    {
        type: 'sb_exact_branded',
        label: 'SB - Branded (Exact/Phrase)',
        description: 'Branded awareness and consideration campaigns.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Brand Keywords`, keywords: [] },
        ],
    },
    {
        type: 'sb_broad_category',
        label: 'SB - Broad Category',
        description: 'Category-level awareness campaigns for broader reach.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Category Targeting`, keywords: [] },
        ],
    },
    {
        type: 'sb_video_awareness',
        label: 'SB - Video Awareness',
        description: 'Consideration and mid-funnel engagement with video ads.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Video Awareness`, keywords: [] },
        ],
    },
    {
        type: 'sd_remarketing_views',
        label: 'SD - Remarketing (Views)',
        description: "Retarget customers who viewed products but didn't buy.",
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Views Remarketing`, keywords: [] },
        ],
    },
    {
        type: 'sd_remarketing_cart',
        label: 'SD - Remarketing (Cart)',
        description: "Retarget customers who added to cart but didn't purchase.",
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Cart Remarketing`, keywords: [] },
        ],
    },
    {
        type: 'sd_remarketing_buyers',
        label: 'SD - Remarketing (Buyers)',
        description: 'Upsell or cross-sell products to past buyers.',
        generateAdGroups: (prefix: string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - Past Buyers Upsell`, keywords: [] },
        ],
    },
    {
        type: 'sd_audience_inmarket',
        label: 'SD - Audience Targeting',
        description: 'Targeting by interest, lifestyle, or shopping intent.',
        generateAdGroups: (prefix:string) => [
            { id: `adgroup-${Date.now()}`, name: `${prefix} - In-Market Audience`, keywords: [] },
            { id: `adgroup-${Date.now() + 1}`, name: `${prefix} - Lifestyle Audience`, keywords: [] },
        ],
    }
];
// --- End Campaign Templates ---

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</dt>
        <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</dd>
    </div>
);


const CampaignItem: React.FC<{
    campaign: Campaign;
    onUpdateCampaign: (campaign: Campaign) => void;
    onDeleteCampaign: (id: string) => void;
    onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
    allKeywords: KeywordData[];
    dragOverAdGroupId: string | null;
    setDragOverAdGroupId: (id: string | null) => void;
}> = ({ campaign, onUpdateCampaign, onDeleteCampaign, onAssignKeywords, allKeywords, dragOverAdGroupId, setDragOverAdGroupId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newAdGroupName, setNewAdGroupName] = useState('');
    const [isLoadingProjections, setIsLoadingProjections] = useState(false);
    const [budgetInput, setBudgetInput] = useState(campaign.totalBudget?.toString() || '');


    const handleAddAdGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newAdGroupName.trim()) return;

        const newAdGroup: AdGroup = {
            id: `adgroup-${Date.now()}`,
            name: newAdGroupName.trim(),
            keywords: [],
        };

        const updatedCampaign = {
            ...campaign,
            adGroups: [...campaign.adGroups, newAdGroup]
        };
        onUpdateCampaign(updatedCampaign);
        setNewAdGroupName('');
    };
    
    const handleDeleteAdGroup = (adGroupId: string) => {
        if (window.confirm("Are you sure you want to delete this ad group? All assigned keywords will be unassigned.")) {
            const updatedCampaign = {
                ...campaign,
                adGroups: campaign.adGroups.filter(ag => ag.id !== adGroupId),
            };
            onUpdateCampaign(updatedCampaign);
        }
    };
    
    const handleBudgetSave = () => {
        const newBudget = parseFloat(budgetInput);
        if (!isNaN(newBudget) && newBudget > 0) {
            onUpdateCampaign({ ...campaign, totalBudget: newBudget, projections: null }); // Reset projections on budget change
        } else {
            setBudgetInput(campaign.totalBudget?.toString() || '');
        }
    };

    const handleGenerateProjections = async () => {
        if (!campaign.totalBudget || campaign.totalBudget <= 0) {
            alert("Please set a total budget for the campaign before generating projections.");
            return;
        }
        setIsLoadingProjections(true);
        try {
            const projections = await fetchCampaignProjections(campaign, allKeywords);
            onUpdateCampaign({ ...campaign, projections });
        } catch (error: any) {
            console.error(error);
            alert(`Failed to generate projections: ${error.message}`);
        } finally {
            setIsLoadingProjections(false);
        }
    };

    const handleDrop = (e: React.DragEvent, adGroupId: string) => {
        e.preventDefault();
        setDragOverAdGroupId(null);
        try {
            const keywordsToAssign = JSON.parse(e.dataTransfer.getData('application/json'));
            if (Array.isArray(keywordsToAssign)) {
                onAssignKeywords(campaign.id, adGroupId, keywordsToAssign);
            }
        } catch (err) {
            console.error("Failed to parse dropped data:", err);
        }
    };
    
    const totalKeywords = useMemo(() => campaign.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0), [campaign.adGroups]);


    return (
         <li className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="truncate flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{campaign.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{campaign.adGroups.length} Ad Group{campaign.adGroups.length !== 1 && 's'} · {totalKeywords} Keyword{totalKeywords !== 1 && 's'}</p>
                </div>
                <div className="flex items-center">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete the campaign "${campaign.name}"? This cannot be undone.`)) {
                                onDeleteCampaign(campaign.id);
                            }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                        aria-label="Delete campaign"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                    <button aria-expanded={isExpanded} className="p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Ad Group Management */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {campaign.adGroups.map(ag => (
                            <div 
                                key={ag.id} 
                                onDragOver={(e) => { e.preventDefault(); setDragOverAdGroupId(ag.id); }}
                                onDragLeave={() => setDragOverAdGroupId(null)}
                                onDrop={(e) => handleDrop(e, ag.id)}
                                className={`flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded transition-all duration-200 ${dragOverAdGroupId === ag.id ? 'ring-2 ring-dashed ring-brand-primary bg-brand-primary/10' : ''}`}
                            >
                                <div>
                                    <p className="text-gray-700 dark:text-gray-300 truncate font-medium">{ag.name}</p>
                                    <p className="text-xs text-gray-500">{ag.keywords.length} keywords</p>
                                </div>
                                <button onClick={() => handleDeleteAdGroup(ag.id)} className="p-1 text-gray-400 hover:text-red-500" aria-label={`Delete ${ag.name}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8a1 1 0 011-1h1V6a1 1 0 012 0v1h2V6a1 1 0 112 0v1h1a1 1 0 011 1v2a1 1 0 01-1 1v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H6a1 1 0 01-1-1V8z" /><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddAdGroup} className="flex gap-2">
                        <input
                            type="text"
                            value={newAdGroupName}
                            onChange={(e) => setNewAdGroupName(e.target.value)}
                            placeholder="New Ad Group Name"
                            className="flex-1 w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <button type="submit" className="px-3 py-1.5 text-sm bg-brand-secondary text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-brand-secondary">Add</button>
                    </form>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                        <label htmlFor={`budget-${campaign.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400">Total Monthly Budget ($)</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                id={`budget-${campaign.id}`}
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                onBlur={handleBudgetSave}
                                placeholder="e.g., 1000"
                                min="1"
                                className="flex-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-none rounded-l-md focus:outline-none focus:ring-brand-primary"
                            />
                            <button onClick={handleBudgetSave} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                                Save
                            </button>
                        </div>
                         {campaign.projections ? (
                            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">AI Performance Projections</h4>
                                    <button onClick={() => onUpdateCampaign({ ...campaign, projections: null })} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Clear</button>
                                </div>
                                 <dl className="mt-2 grid grid-cols-2 gap-4">
                                    <Stat label="Est. Clicks" value={campaign.projections.estimatedClicks.toLocaleString()} />
                                    <Stat label="Est. CPC" value={`$${campaign.projections.estimatedCpc.toFixed(2)}`} />
                                </dl>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{campaign.projections.performanceSummary}</p>
                            </div>
                        ) : (
                            <button 
                                onClick={handleGenerateProjections}
                                disabled={isLoadingProjections || !campaign.totalBudget || campaign.totalBudget <= 0}
                                className="w-full flex items-center justify-center px-4 py-2 bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-md transition-colors duration-200 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                                    {isLoadingProjections ? 'Generating...' : 'Generate Projections'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
};


export const CampaignManager: React.FC<CampaignManagerProps> = ({ campaigns, onCampaignsChange, onAssignKeywords, allKeywords, activeBrandName }) => {
    const [campaignPrefix, setCampaignPrefix] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate>(campaignTemplates[1]); // Default to Auto Research
    const [dragOverAdGroupId, setDragOverAdGroupId] = useState<string | null>(null);

    const handleCreateCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignPrefix.trim()) {
            alert('Please enter a campaign name prefix.');
            return;
        }

        const campaignName = `${campaignPrefix} | ${selectedTemplate.label}`;
        
        if (campaigns.some(c => c.name.toLowerCase() === campaignName.toLowerCase())) {
            alert(`A campaign named "${campaignName}" already exists.`);
            return;
        }

        const newCampaign: Campaign = {
            id: `campaign-${Date.now()}`,
            name: campaignName,
            adGroups: selectedTemplate.generateAdGroups(campaignPrefix),
            projections: null,
        };

        onCampaignsChange([...campaigns, newCampaign]);
        setCampaignPrefix('');
    };
    
    const handleUpdateCampaign = (updatedCampaign: Campaign) => {
        onCampaignsChange(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    };

    const handleDeleteCampaign = (id: string) => {
        onCampaignsChange(campaigns.filter(c => c.id !== id));
    };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage your campaign structures.</p>
        </div>
        <CampaignExportButton 
            campaigns={campaigns} 
            allKeywords={allKeywords}
            disabled={campaigns.length === 0}
            activeBrandName={activeBrandName}
        />
      </div>


       <form onSubmit={handleCreateCampaign} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Create New Campaign</h3>
            <div>
                 <label htmlFor="template" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Campaign Template
                </label>
                <select 
                    id="template"
                    value={selectedTemplate.type}
                    onChange={(e) => setSelectedTemplate(campaignTemplates.find(t => t.type === e.target.value) || campaignTemplates[0])}
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    {campaignTemplates.map(template => (
                        <option key={template.type} value={template.type}>{template.label}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedTemplate.description}</p>
            </div>
             <div>
                <label htmlFor="prefix" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Campaign Name Prefix
                </label>
                <input
                    id="prefix"
                    type="text"
                    value={campaignPrefix}
                    onChange={(e) => setCampaignPrefix(e.target.value)}
                    placeholder="e.g., Your Product Name"
                    className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-brand-primary hover:bg-orange-500 text-gray-900 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-brand-primary">
                Create Campaign
            </button>
        </form>

      <div className="flex-1 min-h-0">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Existing Campaigns ({campaigns.length})</h3>
        {campaigns.length > 0 ? (
            <ul className="space-y-2 h-full overflow-y-auto pr-2">
                {campaigns.map(campaign => (
                    <CampaignItem 
                        key={campaign.id} 
                        campaign={campaign}
                        onUpdateCampaign={handleUpdateCampaign}
                        onDeleteCampaign={handleDeleteCampaign}
                        onAssignKeywords={onAssignKeywords}
                        allKeywords={allKeywords}
                        dragOverAdGroupId={dragOverAdGroupId}
                        setDragOverAdGroupId={setDragOverAdGroupId}
                    />
                ))}
            </ul>
        ) : (
            <p className="text-center text-sm text-gray-500 py-4">No campaigns created yet.</p>
        )}
      </div>
    </div>
  );
};