/**
 * Planner Service - Campaign assignment recommendations based on rollout phases
 * Maps intent + category + lifecycle to appropriate campaign structure
 */

import type {
  KeywordIntent,
  KeywordCategory,
  LifecycleState,
  CampaignType,
  TargetingType,
  CampaignTheme,
  MatchType,
  Portfolio,
} from '../types';

export interface CampaignRecommendation {
  campaignType: CampaignType;
  targeting: TargetingType;
  theme: CampaignTheme;
  portfolio: Portfolio;
  phase: number;
  matchType: MatchType;
  campaignName: string;
  adGroupSuggestion: string;
  reasoning: string;
}

/**
 * Suggest campaign assignment based on keyword properties and lifecycle
 */
export function suggestCampaignAssignment(
  intent: KeywordIntent,
  category: KeywordCategory,
  lifecycleState: LifecycleState,
  keywordText?: string
): CampaignRecommendation {
  // Phase 1: Discovery & Test - AUTO/BROAD/PHRASE research
  if (lifecycleState === 'Discovery' || lifecycleState === 'Test') {
    if (category === 'Brand' || category === 'Branded') {
      return {
        campaignType: 'SP',
        targeting: 'PHRASE',
        theme: 'BRANDED',
        portfolio: 'Launch',
        phase: 1,
        matchType: 'PHRASE',
        campaignName: 'SP_PHRASE_BRANDED_Research',
        adGroupSuggestion: 'Brand Defense',
        reasoning: 'Branded keywords in discovery phase - phrase match for brand protection',
      };
    }

    if (category === 'Competitor') {
      return {
        campaignType: 'SP',
        targeting: 'BROAD',
        theme: 'COMP',
        portfolio: 'Launch',
        phase: 2,
        matchType: 'BROAD',
        campaignName: 'SP_BROAD_COMP_Research',
        adGroupSuggestion: 'Competitor Discovery',
        reasoning: 'Competitor keywords need broad match research first',
      };
    }

    // Generic/ProductCore in discovery
    return {
      campaignType: 'SP',
      targeting: 'AUTO',
      theme: 'RESEARCH',
      portfolio: 'Launch',
      phase: 1,
      matchType: 'BROAD',
      campaignName: 'SP_AUTO_Research',
      adGroupSuggestion: 'Auto Targeting',
      reasoning: 'Generic keywords in discovery - start with auto targeting',
    };
  }

  // Phase 2-3: Performance - Exact match for proven keywords
  if (lifecycleState === 'Performance') {
    if (category === 'Brand' || category === 'Branded') {
      if (intent === 'High') {
        return {
          campaignType: 'SB',
          targeting: 'EXACT',
          theme: 'BRANDED',
          portfolio: 'Optimize',
          phase: 2,
          matchType: 'EXACT',
          campaignName: 'SB_EXACT_BRANDED_Performance',
          adGroupSuggestion: 'Brand Exact',
          reasoning: 'High-intent branded keywords - SB exact for maximum visibility',
        };
      }
      return {
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'BRANDED',
        portfolio: 'Optimize',
        phase: 2,
        matchType: 'EXACT',
        campaignName: 'SP_EXACT_BRANDED_Performance',
        adGroupSuggestion: 'Brand Exact',
        reasoning: 'Branded keywords performing well - exact match SP',
      };
    }

    if (category === 'Competitor') {
      return {
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'COMP',
        portfolio: 'Optimize',
        phase: 2,
        matchType: 'EXACT',
        campaignName: 'SP_EXACT_COMP_Performance',
        adGroupSuggestion: 'Competitor Exact',
        reasoning: 'Competitor keywords showing results - move to exact match',
      };
    }

    if (category === 'Generic' || category === 'ProductCore') {
      return {
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'GENERIC',
        portfolio: 'Optimize',
        phase: 3,
        matchType: 'EXACT',
        campaignName: 'SP_EXACT_GENERIC_Performance',
        adGroupSuggestion: 'Generic Exact',
        reasoning: 'Generic keywords with proven performance - exact match',
      };
    }
  }

  // Phase 3: SKAG - Single Keyword Ad Groups for top performers
  if (lifecycleState === 'SKAG') {
    const cleanKeyword = keywordText?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) || 'TopKeyword';
    
    if (category === 'Brand' || category === 'Branded') {
      return {
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'BRANDED',
        portfolio: 'Scale',
        phase: 3,
        matchType: 'EXACT',
        campaignName: `SP_EXACT_SKAG_Brand_${cleanKeyword}`,
        adGroupSuggestion: cleanKeyword,
        reasoning: 'Top-performing brand keyword - dedicated SKAG for optimization',
      };
    }

    return {
      campaignType: 'SP',
      targeting: 'EXACT',
      theme: 'PERFORMANCE',
      portfolio: 'Scale',
      phase: 3,
      matchType: 'EXACT',
      campaignName: `SP_EXACT_SKAG_${cleanKeyword}`,
      adGroupSuggestion: cleanKeyword,
      reasoning: 'Top performer - isolated in SKAG for precise control',
    };
  }

  // Archived - shouldn't be assigned
  if (lifecycleState === 'Archived') {
    return {
      campaignType: 'SP',
      targeting: 'EXACT',
      theme: 'RESEARCH',
      portfolio: 'Maintain',
      phase: 1,
      matchType: 'EXACT',
      campaignName: 'ARCHIVED',
      adGroupSuggestion: 'Do Not Assign',
      reasoning: 'Keyword is archived - should not be assigned to campaigns',
    };
  }

  // Default fallback
  return {
    campaignType: 'SP',
    targeting: 'BROAD',
    theme: 'RESEARCH',
    portfolio: 'Launch',
    phase: 1,
    matchType: 'BROAD',
    campaignName: 'SP_BROAD_Research',
    adGroupSuggestion: 'Research',
    reasoning: 'Default research assignment',
  };
}

/**
 * Get all campaign shells for a given phase
 */
export function getCampaignShellsForPhase(phase: number): CampaignRecommendation[] {
  const shells: CampaignRecommendation[] = [];

  switch (phase) {
    case 1:
      // Phase 1: AUTO/BROAD/PHRASE + SP_BRANDED
      shells.push({
        campaignType: 'SP',
        targeting: 'AUTO',
        theme: 'RESEARCH',
        portfolio: 'Launch',
        phase: 1,
        matchType: 'BROAD',
        campaignName: 'SP_AUTO_Research',
        adGroupSuggestion: 'Auto Targeting',
        reasoning: 'Auto targeting for keyword discovery',
      });
      shells.push({
        campaignType: 'SP',
        targeting: 'BROAD',
        theme: 'RESEARCH',
        portfolio: 'Launch',
        phase: 1,
        matchType: 'BROAD',
        campaignName: 'SP_BROAD_Research',
        adGroupSuggestion: 'Broad Research',
        reasoning: 'Broad match for initial testing',
      });
      shells.push({
        campaignType: 'SP',
        targeting: 'PHRASE',
        theme: 'BRANDED',
        portfolio: 'Launch',
        phase: 1,
        matchType: 'PHRASE',
        campaignName: 'SP_PHRASE_BRANDED_Defense',
        adGroupSuggestion: 'Brand Defense',
        reasoning: 'Brand protection from day 1',
      });
      break;

    case 2:
      // Phase 2: SP_EXACT_COMP, SP_PT_COMP, SB_EXACT_BRANDED
      shells.push({
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'COMP',
        portfolio: 'Optimize',
        phase: 2,
        matchType: 'EXACT',
        campaignName: 'SP_EXACT_COMP_Performance',
        adGroupSuggestion: 'Competitor Exact',
        reasoning: 'Exact match competitor targeting',
      });
      shells.push({
        campaignType: 'SP',
        targeting: 'PT',
        theme: 'COMP',
        portfolio: 'Optimize',
        phase: 2,
        matchType: 'EXACT',
        campaignName: 'SP_PT_COMP_Performance',
        adGroupSuggestion: 'Competitor PT',
        reasoning: 'Product targeting for competitor ASINs',
      });
      shells.push({
        campaignType: 'SB',
        targeting: 'EXACT',
        theme: 'BRANDED',
        portfolio: 'Optimize',
        phase: 2,
        matchType: 'EXACT',
        campaignName: 'SB_EXACT_BRANDED_Performance',
        adGroupSuggestion: 'Brand SB',
        reasoning: 'Sponsored Brands for brand awareness',
      });
      break;

    case 3:
      // Phase 3: SP_EXACT_SKAG, SP_PT_CATEGORY, SP_PT_CROSSSELL, SB expansion
      shells.push({
        campaignType: 'SP',
        targeting: 'EXACT',
        theme: 'PERFORMANCE',
        portfolio: 'Scale',
        phase: 3,
        matchType: 'EXACT',
        campaignName: 'SP_EXACT_SKAG_Template',
        adGroupSuggestion: 'SKAG',
        reasoning: 'Single keyword ad groups for top performers',
      });
      shells.push({
        campaignType: 'SP',
        targeting: 'PT',
        theme: 'CATEGORY',
        portfolio: 'Scale',
        phase: 3,
        matchType: 'EXACT',
        campaignName: 'SP_PT_CATEGORY_Expansion',
        adGroupSuggestion: 'Category PT',
        reasoning: 'Category product targeting',
      });
      shells.push({
        campaignType: 'SP',
        targeting: 'PT',
        theme: 'CROSSSELL',
        portfolio: 'Scale',
        phase: 3,
        matchType: 'EXACT',
        campaignName: 'SP_PT_CROSSSELL_Expansion',
        adGroupSuggestion: 'Crosssell PT',
        reasoning: 'Cross-sell opportunities',
      });
      shells.push({
        campaignType: 'SB',
        targeting: 'EXACT',
        theme: 'GENERIC',
        portfolio: 'Scale',
        phase: 3,
        matchType: 'EXACT',
        campaignName: 'SB_EXACT_GENERIC_Expansion',
        adGroupSuggestion: 'Generic SB',
        reasoning: 'Sponsored Brands for generic terms',
      });
      break;

    case 4:
      // Phase 4: SD remarketing and audiences
      shells.push({
        campaignType: 'SD',
        targeting: 'PT',
        theme: 'REMARKETING',
        portfolio: 'Maintain',
        phase: 4,
        matchType: 'EXACT',
        campaignName: 'SD_REMARKETING_Audiences',
        adGroupSuggestion: 'Remarketing',
        reasoning: 'Sponsored Display for remarketing',
      });
      shells.push({
        campaignType: 'SD',
        targeting: 'PT',
        theme: 'CATEGORY',
        portfolio: 'Maintain',
        phase: 4,
        matchType: 'EXACT',
        campaignName: 'SD_AUDIENCES_Category',
        adGroupSuggestion: 'Audience Targeting',
        reasoning: 'SD audience expansion',
      });
      break;

    case 5:
      // Phase 5: Store/Bundle/Event campaigns
      shells.push({
        campaignType: 'SB',
        targeting: 'EXACT',
        theme: 'VIDEO',
        portfolio: 'Maintain',
        phase: 5,
        matchType: 'EXACT',
        campaignName: 'SB_VIDEO_Store',
        adGroupSuggestion: 'Video Ads',
        reasoning: 'Sponsored Brands Video',
      });
      break;
  }

  return shells;
}

/**
 * Generate standard campaign name based on convention
 */
export function generateCampaignName(
  type: CampaignType,
  targeting: TargetingType,
  theme: CampaignTheme,
  brandCode?: string
): string {
  const parts = [type, targeting, theme];
  if (brandCode) {
    parts.unshift(brandCode);
  }
  return parts.join('_');
}

/**
 * Suggest which campaign to remove keyword from when promoting
 * (for cannibalization prevention)
 */
export function suggestNegativePlacement(
  fromCampaignTheme: CampaignTheme,
  fromTargeting: TargetingType,
  toCampaignTheme: CampaignTheme,
  toTargeting: TargetingType
): {
  shouldAddNegative: boolean;
  reason: string;
  matchType: 'NEG_PHRASE' | 'NEG_EXACT' | null;
} {
  // If promoting from research to performance/exact
  if (fromCampaignTheme === 'RESEARCH' && 
      (toCampaignTheme === 'PERFORMANCE' || toTargeting === 'EXACT')) {
    return {
      shouldAddNegative: true,
      reason: 'Prevent cannibalization between research and performance campaigns',
      matchType: 'NEG_PHRASE',
    };
  }

  // If promoting from broad/phrase to exact
  if ((fromTargeting === 'BROAD' || fromTargeting === 'PHRASE') && 
      toTargeting === 'EXACT') {
    return {
      shouldAddNegative: true,
      reason: 'Prevent overlap between broad/phrase and exact match',
      matchType: 'NEG_EXACT',
    };
  }

  return {
    shouldAddNegative: false,
    reason: 'No cannibalization risk detected',
    matchType: null,
  };
}
