/**
 * Planner Service - Campaign Assignment Recommendations
 * 
 * Provides intelligent recommendations for assigning keywords to campaigns
 * based on intent, category, performance, and campaign structure.
 */

import type {
  KeywordData,
  KeywordPerformance,
  Campaign,
  CampaignRecommendation,
  MatchType,
} from '../types';

/**
 * Get campaign recommendations for a keyword
 */
export function getCampaignRecommendations(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  campaigns: Campaign[]
): CampaignRecommendation[] {
  const recommendations: CampaignRecommendation[] = [];

  for (const campaign of campaigns) {
    const score = calculateCampaignFitScore(keyword, performance, campaign);
    
    if (score >= 50) { // Only recommend if score is 50 or higher
      const recommendation = buildRecommendation(keyword, performance, campaign, score);
      recommendations.push(recommendation);
    }
  }

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Calculate how well a keyword fits a campaign
 */
function calculateCampaignFitScore(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  campaign: Campaign
): number {
  let score = 0;

  // Get campaign type from name or metadata
  const campaignType = extractCampaignType(campaign.name);
  
  // Score based on keyword category and campaign type alignment
  score += scoreCategoryAlignment(keyword.category, campaignType);

  // Score based on keyword type and campaign structure
  score += scoreTypeAlignment(keyword.type, campaignType);

  // Score based on performance (if available)
  if (performance) {
    score += scorePerformanceAlignment(performance, campaignType);
  }

  // Score based on search volume
  score += scoreSearchVolumeAlignment(keyword.searchVolume, campaignType);

  // Bonus for exact name matches
  if (campaignType.includes('branded') && keyword.category === 'Branded') {
    score += 20;
  }

  return Math.min(100, score);
}

/**
 * Extract campaign type from campaign name
 */
function extractCampaignType(campaignName: string): string {
  const name = campaignName.toLowerCase();
  
  // Common campaign type patterns
  if (name.includes('auto')) return 'auto';
  if (name.includes('exact')) return 'exact';
  if (name.includes('phrase')) return 'phrase';
  if (name.includes('broad')) return 'broad';
  if (name.includes('branded')) return 'branded';
  if (name.includes('competitor')) return 'competitor';
  if (name.includes('category')) return 'category';
  if (name.includes('skag')) return 'skag';
  if (name.includes('research')) return 'research';
  if (name.includes('test')) return 'test';
  if (name.includes('performance')) return 'performance';
  if (name.includes('discovery')) return 'discovery';
  
  return 'general';
}

/**
 * Score alignment between keyword category and campaign type
 */
function scoreCategoryAlignment(category: string, campaignType: string): number {
  const alignmentScores: Record<string, Record<string, number>> = {
    'Branded': {
      branded: 40,
      exact: 30,
      phrase: 25,
      performance: 20,
      skag: 35,
      general: 15,
    },
    'Core': {
      exact: 35,
      phrase: 30,
      performance: 35,
      skag: 30,
      category: 25,
      general: 20,
    },
    'Opportunity': {
      broad: 35,
      research: 40,
      discovery: 40,
      test: 35,
      auto: 30,
      general: 20,
    },
    'Low-hanging Fruit': {
      phrase: 35,
      exact: 30,
      broad: 25,
      test: 30,
      general: 20,
    },
    'Complementary': {
      broad: 30,
      phrase: 35,
      category: 30,
      general: 25,
    },
  };

  return alignmentScores[category]?.[campaignType] || 10;
}

/**
 * Score alignment between keyword type and campaign type
 */
function scoreTypeAlignment(type: string, campaignType: string): number {
  const typeScores: Record<string, Record<string, number>> = {
    'Exact': {
      exact: 20,
      skag: 20,
      performance: 15,
      branded: 15,
    },
    'Phrase': {
      phrase: 20,
      performance: 15,
      category: 15,
    },
    'Broad': {
      broad: 20,
      research: 15,
      discovery: 15,
      auto: 10,
    },
    'Long-tail': {
      phrase: 15,
      exact: 15,
      test: 15,
      research: 10,
    },
  };

  return typeScores[type]?.[campaignType] || 5;
}

/**
 * Score alignment based on performance data
 */
function scorePerformanceAlignment(
  performance: KeywordPerformance,
  campaignType: string
): number {
  let score = 0;

  // High performers go to performance/SKAG campaigns
  if (performance.lifecycleStage === 'Performance' || performance.lifecycleStage === 'SKAG') {
    if (campaignType === 'performance' || campaignType === 'skag' || campaignType === 'exact') {
      score += 20;
    }
  }

  // Testing keywords go to research/test campaigns
  if (performance.lifecycleStage === 'Discovery' || performance.lifecycleStage === 'Test') {
    if (campaignType === 'research' || campaignType === 'test' || campaignType === 'discovery') {
      score += 20;
    }
  }

  // Good RAG status
  if (performance.ragStatus === 'Green') {
    if (campaignType === 'performance' || campaignType === 'skag') {
      score += 10;
    }
  }

  return score;
}

/**
 * Score alignment based on search volume
 */
function scoreSearchVolumeAlignment(searchVolume: string, campaignType: string): number {
  // High volume keywords fit better in exact/phrase campaigns
  const isHighVolume = searchVolume.includes('50k') || searchVolume.includes('100k');
  const isMediumVolume = searchVolume.includes('10k') || searchVolume.includes('20k');
  
  if (isHighVolume) {
    if (campaignType === 'exact' || campaignType === 'phrase' || campaignType === 'performance') {
      return 10;
    }
  }
  
  if (isMediumVolume) {
    if (campaignType === 'phrase' || campaignType === 'broad') {
      return 10;
    }
  }

  return 5;
}

/**
 * Build a complete recommendation object
 */
function buildRecommendation(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  campaign: Campaign,
  score: number
): CampaignRecommendation {
  const campaignType = extractCampaignType(campaign.name);
  
  // Suggest match type based on campaign type and keyword
  const suggestedMatchType = suggestMatchType(keyword, campaignType);
  
  // Suggest bid (basic recommendation)
  const suggestedBid = performance?.suggestedBid || undefined;
  
  // Suggest ad group
  const suggestedAdGroup = suggestAdGroup(keyword, campaign);
  
  // Build reason
  const reason = buildRecommendationReason(keyword, performance, campaignType, score);

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    score,
    reason,
    suggestedAdGroup,
    suggestedBid,
    suggestedMatchType,
  };
}

/**
 * Suggest appropriate match type
 */
function suggestMatchType(keyword: KeywordData, campaignType: string): MatchType {
  // Campaign type overrides
  if (campaignType === 'exact' || campaignType === 'skag') return 'Exact';
  if (campaignType === 'phrase') return 'Phrase';
  if (campaignType === 'broad') return 'Broad';

  // Default based on keyword type
  if (keyword.type === 'Exact') return 'Exact';
  if (keyword.type === 'Phrase') return 'Phrase';
  if (keyword.type === 'Broad') return 'Broad';
  
  // Long-tail defaults to phrase
  return 'Phrase';
}

/**
 * Suggest ad group within campaign
 */
function suggestAdGroup(keyword: KeywordData, campaign: Campaign): string | undefined {
  // If campaign has ad groups, try to match by theme
  if (campaign.adGroups && campaign.adGroups.length > 0) {
    // Look for ad group with matching category or theme
    const matchingGroup = campaign.adGroups.find((ag) => {
      const name = ag.name.toLowerCase();
      const category = keyword.category.toLowerCase();
      return name.includes(category) || name.includes(keyword.keyword.toLowerCase());
    });

    if (matchingGroup) {
      return matchingGroup.name;
    }

    // Default to first ad group
    return campaign.adGroups[0].name;
  }

  return undefined;
}

/**
 * Build human-readable recommendation reason
 */
function buildRecommendationReason(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  campaignType: string,
  score: number
): string {
  const reasons: string[] = [];

  // Category alignment
  if (keyword.category === 'Branded' && campaignType.includes('branded')) {
    reasons.push('Perfect fit for branded campaign');
  } else if (keyword.category === 'Core' && campaignType.includes('performance')) {
    reasons.push('Core keyword fits performance campaign');
  } else if (keyword.category === 'Opportunity' && (campaignType.includes('research') || campaignType.includes('discovery'))) {
    reasons.push('Discovery opportunity in research campaign');
  }

  // Performance alignment
  if (performance) {
    if (performance.lifecycleStage === 'Performance' || performance.lifecycleStage === 'SKAG') {
      reasons.push('Proven performer ready for dedicated campaign');
    }
    if (performance.ragStatus === 'Green') {
      reasons.push('Strong health metrics');
    }
  }

  // Search volume
  const isHighVolume = keyword.searchVolume.includes('50k') || keyword.searchVolume.includes('100k');
  if (isHighVolume) {
    reasons.push('High search volume potential');
  }

  // Competition
  if (keyword.competition === 'Low') {
    reasons.push('Low competition advantage');
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push(`Good fit based on keyword characteristics (${score}% match)`);
  }

  return reasons.join('; ');
}

/**
 * Get batch recommendations for multiple keywords
 */
export function getBatchCampaignRecommendations(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  campaigns: Campaign[]
): Map<string, CampaignRecommendation[]> {
  const allRecommendations = new Map<string, CampaignRecommendation[]>();

  for (const keyword of keywords) {
    const performance = performances.get(keyword.keyword) || null;
    const recommendations = getCampaignRecommendations(keyword, performance, campaigns);
    allRecommendations.set(keyword.keyword, recommendations);
  }

  return allRecommendations;
}

/**
 * Get optimal campaign structure suggestions
 */
export function suggestCampaignStructure(
  keywords: KeywordData[]
): {
  structure: string;
  campaigns: Array<{
    name: string;
    type: string;
    description: string;
    keywordCount: number;
  }>;
} {
  // Analyze keyword distribution
  const branded = keywords.filter((k) => k.category === 'Branded');
  const core = keywords.filter((k) => k.category === 'Core');
  const opportunity = keywords.filter((k) => k.category === 'Opportunity');
  const complementary = keywords.filter((k) => k.category === 'Complementary');

  const campaigns = [];

  // Branded campaign (if applicable)
  if (branded.length > 0) {
    campaigns.push({
      name: 'Branded - Exact',
      type: 'exact',
      description: 'Protect brand terms with exact match',
      keywordCount: branded.length,
    });
  }

  // Core performance campaigns
  if (core.length > 10) {
    campaigns.push({
      name: 'Core - Performance',
      type: 'performance',
      description: 'High-performing core keywords',
      keywordCount: Math.ceil(core.length / 2),
    });
    campaigns.push({
      name: 'Core - Test',
      type: 'test',
      description: 'Testing new core keywords',
      keywordCount: Math.floor(core.length / 2),
    });
  } else if (core.length > 0) {
    campaigns.push({
      name: 'Core Keywords',
      type: 'exact',
      description: 'All core keywords in exact match',
      keywordCount: core.length,
    });
  }

  // Discovery campaign
  if (opportunity.length > 0) {
    campaigns.push({
      name: 'Discovery - Research',
      type: 'research',
      description: 'Testing opportunity keywords',
      keywordCount: opportunity.length,
    });
  }

  // Category/Complementary campaign
  if (complementary.length > 0) {
    campaigns.push({
      name: 'Category - Broad',
      type: 'broad',
      description: 'Complementary category keywords',
      keywordCount: complementary.length,
    });
  }

  // Determine structure type
  let structure = 'balanced';
  if (campaigns.length <= 2) {
    structure = 'simple';
  } else if (campaigns.length >= 5) {
    structure = 'advanced';
  }

  return {
    structure,
    campaigns,
  };
}
