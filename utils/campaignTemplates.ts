import { Campaign, AdGroup, MatchType } from '../types';

export interface CampaignTemplate {
  name: string;
  description: string;
  category: 'Sponsored Products' | 'Sponsored Brands' | 'Sponsored Display';
  suggestedDailyBudget?: number;
  adGroups: {
    name: string;
    defaultMatchType?: MatchType;
    defaultBid?: number;
    budgetPercent?: number; // Percentage of total campaign budget
  }[];
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // Sponsored Products Templates
  {
    name: 'SP - Auto Targeting',
    description: 'Sponsored Products with automatic targeting for discovery',
    category: 'Sponsored Products',
    suggestedDailyBudget: 25,
    adGroups: [
      { name: 'Close Match', budgetPercent: 40 },
      { name: 'Loose Match', budgetPercent: 30 },
      { name: 'Substitutes', budgetPercent: 20 },
      { name: 'Complements', budgetPercent: 10 },
    ],
  },
  {
    name: 'SP - Manual Broad',
    description: 'Broad match keywords for maximum reach and discovery',
    category: 'Sponsored Products',
    suggestedDailyBudget: 30,
    adGroups: [
      { name: 'High Volume Keywords', defaultMatchType: 'Broad', defaultBid: 1.5, budgetPercent: 50 },
      { name: 'Mid Volume Keywords', defaultMatchType: 'Broad', defaultBid: 1.0, budgetPercent: 35 },
      { name: 'Low Volume Keywords', defaultMatchType: 'Broad', defaultBid: 0.75, budgetPercent: 15 },
    ],
  },
  {
    name: 'SP - Manual Phrase',
    description: 'Phrase match keywords for controlled targeting',
    category: 'Sponsored Products',
    suggestedDailyBudget: 30,
    adGroups: [
      { name: 'Core Keywords', defaultMatchType: 'Phrase', defaultBid: 1.25, budgetPercent: 60 },
      { name: 'Opportunity Keywords', defaultMatchType: 'Phrase', defaultBid: 1.0, budgetPercent: 40 },
    ],
  },
  {
    name: 'SP - Manual Exact',
    description: 'Exact match keywords for precision targeting and best performers',
    category: 'Sponsored Products',
    suggestedDailyBudget: 40,
    adGroups: [
      { name: 'Top Converters', defaultMatchType: 'Exact', defaultBid: 2.0, budgetPercent: 70 },
      { name: 'Testing Keywords', defaultMatchType: 'Exact', defaultBid: 1.0, budgetPercent: 30 },
    ],
  },
  {
    name: 'SP - Branded Defense',
    description: 'Protect your brand terms from competitors',
    category: 'Sponsored Products',
    suggestedDailyBudget: 20,
    adGroups: [
      { name: 'Brand - Exact', defaultMatchType: 'Exact', defaultBid: 2.5, budgetPercent: 60 },
      { name: 'Brand - Phrase', defaultMatchType: 'Phrase', defaultBid: 2.0, budgetPercent: 40 },
    ],
  },
  {
    name: 'SP - Competitor Conquest',
    description: 'Target competitor brand terms to win share',
    category: 'Sponsored Products',
    suggestedDailyBudget: 35,
    adGroups: [
      { name: 'Tier 1 Competitors', defaultMatchType: 'Phrase', defaultBid: 1.75, budgetPercent: 50 },
      { name: 'Tier 2 Competitors', defaultMatchType: 'Phrase', defaultBid: 1.25, budgetPercent: 35 },
      { name: 'Tier 3 Competitors', defaultMatchType: 'Broad', defaultBid: 0.75, budgetPercent: 15 },
    ],
  },
  {
    name: 'SP - Product Launch',
    description: 'Aggressive campaign structure for new product launches',
    category: 'Sponsored Products',
    suggestedDailyBudget: 50,
    adGroups: [
      { name: 'Core Product Terms', defaultMatchType: 'Phrase', defaultBid: 2.0, budgetPercent: 40 },
      { name: 'Category Terms', defaultMatchType: 'Broad', defaultBid: 1.5, budgetPercent: 30 },
      { name: 'Discovery', defaultMatchType: 'Broad', defaultBid: 1.0, budgetPercent: 30 },
    ],
  },

  // Sponsored Brands Templates
  {
    name: 'SB - Video Awareness',
    description: 'Video campaigns for brand awareness and engagement',
    category: 'Sponsored Brands',
    suggestedDailyBudget: 40,
    adGroups: [
      { name: 'Category Keywords', defaultMatchType: 'Phrase', defaultBid: 1.5, budgetPercent: 60 },
      { name: 'Interest Keywords', defaultMatchType: 'Broad', defaultBid: 1.25, budgetPercent: 40 },
    ],
  },
  {
    name: 'SB - Headline Search',
    description: 'Headline ads showcasing product portfolio',
    category: 'Sponsored Brands',
    suggestedDailyBudget: 35,
    adGroups: [
      { name: 'Brand Keywords', defaultMatchType: 'Exact', defaultBid: 2.0, budgetPercent: 50 },
      { name: 'Generic Keywords', defaultMatchType: 'Phrase', defaultBid: 1.5, budgetPercent: 50 },
    ],
  },
  {
    name: 'SB - Store Spotlight',
    description: 'Drive traffic to your Amazon Store',
    category: 'Sponsored Brands',
    suggestedDailyBudget: 30,
    adGroups: [
      { name: 'Collection Keywords', defaultMatchType: 'Phrase', defaultBid: 1.5, budgetPercent: 100 },
    ],
  },

  // Sponsored Display Templates
  {
    name: 'SD - Product Targeting',
    description: 'Target specific products and categories',
    category: 'Sponsored Display',
    suggestedDailyBudget: 25,
    adGroups: [
      { name: 'Competitor Products', budgetPercent: 60 },
      { name: 'Complementary Products', budgetPercent: 40 },
    ],
  },
  {
    name: 'SD - Audience Targeting',
    description: 'Reach audiences based on shopping behavior',
    category: 'Sponsored Display',
    suggestedDailyBudget: 30,
    adGroups: [
      { name: 'In-Market Audiences', budgetPercent: 50 },
      { name: 'Lifestyle Audiences', budgetPercent: 30 },
      { name: 'Interest Audiences', budgetPercent: 20 },
    ],
  },
  {
    name: 'SD - Remarketing',
    description: 'Re-engage customers who viewed your products',
    category: 'Sponsored Display',
    suggestedDailyBudget: 20,
    adGroups: [
      { name: 'Product Page Visitors', budgetPercent: 60 },
      { name: 'Brand Page Visitors', budgetPercent: 40 },
    ],
  },
  {
    name: 'SD - Cross-Sell',
    description: 'Promote related products to existing customers',
    category: 'Sponsored Display',
    suggestedDailyBudget: 20,
    adGroups: [
      { name: 'Past Purchasers', budgetPercent: 100 },
    ],
  },
];

export function createCampaignFromTemplate(
  template: CampaignTemplate,
  customName?: string,
  dailyBudget?: number
): Campaign {
  const timestamp = Date.now();
  const campaignName = customName || template.name;
  const budget = dailyBudget ?? template.suggestedDailyBudget;

  const adGroups: AdGroup[] = template.adGroups.map((agTemplate, index) => {
    const adGroupBudget = budget != null && agTemplate.budgetPercent != null
      ? (budget * agTemplate.budgetPercent) / 100
      : undefined;

    return {
      id: `adgroup-${timestamp}-${index}`,
      name: agTemplate.name,
      keywords: [],
      defaultBid: agTemplate.defaultBid,
      defaultMatchType: agTemplate.defaultMatchType,
      budget: adGroupBudget,
      bidModifiers: {
        topOfSearch: 50, // Default 50% boost for top of search
        productPages: 0, // Default 0% modifier for product pages
      },
    };
  });

  return {
    id: `campaign-${timestamp}`,
    name: campaignName,
    dailyBudget: budget,
    adGroups,
  };
}
