/**
 * Opportunity Scorer Service
 * 
 * Calculates opportunity scores for keywords based on performance,
 * search volume, competition, and potential for growth.
 */

import type {
  KeywordPerformance,
  KeywordData,
  BrandSettings,
} from '../types';

/**
 * Calculate opportunity score for a keyword (0-100)
 */
export function calculateOpportunityScore(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  settings: BrandSettings
): number {
  let score = 0;

  // Component 1: Performance Score (0-40 points)
  if (performance) {
    score += calculatePerformanceScore(performance, settings);
  }

  // Component 2: Search Volume Score (0-25 points)
  score += calculateSearchVolumeScore(keyword.searchVolume);

  // Component 3: Competition Score (0-20 points)
  score += calculateCompetitionScore(keyword.competition);

  // Component 4: Relevance Score (0-15 points)
  score += calculateRelevanceScore(keyword.relevance);

  return Math.min(100, Math.round(score));
}

/**
 * Calculate performance-based score
 */
function calculatePerformanceScore(
  performance: KeywordPerformance,
  settings: BrandSettings
): number {
  let score = 0;

  // Has clicks - baseline score
  if (performance.clicks > 0) {
    score += 5;
  }

  // CTR performance (0-12 points)
  if (performance.impressions > 100) {
    const ctrRatio = performance.ctr / settings.targetCtr;
    if (ctrRatio >= 1.5) score += 12;
    else if (ctrRatio >= 1.2) score += 10;
    else if (ctrRatio >= 1.0) score += 8;
    else if (ctrRatio >= 0.8) score += 5;
    else if (ctrRatio >= 0.5) score += 2;
  }

  // CVR performance (0-12 points)
  if (performance.clicks > 10) {
    const cvrRatio = performance.cvr / settings.targetCvr;
    if (cvrRatio >= 1.5) score += 12;
    else if (cvrRatio >= 1.2) score += 10;
    else if (cvrRatio >= 1.0) score += 8;
    else if (cvrRatio >= 0.8) score += 5;
    else if (cvrRatio >= 0.5) score += 2;
  }

  // ACoS performance (0-8 points)
  if (performance.acos > 0) {
    const acosRatio = settings.targetAcos / performance.acos;
    if (acosRatio >= 1.5) score += 8;
    else if (acosRatio >= 1.2) score += 6;
    else if (acosRatio >= 1.0) score += 4;
    else if (acosRatio >= 0.8) score += 2;
  }

  // ROAS performance (0-3 points bonus)
  if (performance.roas >= settings.targetRoas * 1.2) {
    score += 3;
  }

  return Math.min(40, score);
}

/**
 * Calculate search volume score
 */
function calculateSearchVolumeScore(searchVolume: string): number {
  const volumeScores: Record<string, number> = {
    '100k+': 25,
    '50k-100k': 22,
    '20k-50k': 19,
    '10k-20k': 16,
    '5k-10k': 13,
    '1k-5k': 10,
    '<1k': 5,
    'Unknown': 8,
  };

  return volumeScores[searchVolume] || 8;
}

/**
 * Calculate competition score (lower competition = higher score)
 */
function calculateCompetitionScore(competition: string): number {
  const competitionScores: Record<string, number> = {
    'Low': 20,
    'Medium': 12,
    'High': 5,
  };

  return competitionScores[competition] || 10;
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(relevance: number): number {
  // Convert 1-10 scale to 0-15 points
  return Math.round((relevance / 10) * 15);
}

/**
 * Get opportunity tier for a score
 */
export function getOpportunityTier(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

/**
 * Calculate opportunity scores for multiple keywords
 */
export function calculateBatchOpportunityScores(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  settings: BrandSettings
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const keyword of keywords) {
    const performance = performances.get(keyword.keyword) || null;
    const score = calculateOpportunityScore(keyword, performance, settings);
    scores.set(keyword.keyword, score);
  }

  return scores;
}

/**
 * Find top opportunities
 */
export function findTopOpportunities(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  settings: BrandSettings,
  limit: number = 20
): Array<{
  keyword: KeywordData;
  performance: KeywordPerformance | null;
  opportunityScore: number;
  tier: 'High' | 'Medium' | 'Low';
}> {
  const opportunities = keywords.map((keyword) => {
    const performance = performances.get(keyword.keyword) || null;
    const opportunityScore = calculateOpportunityScore(keyword, performance, settings);
    const tier = getOpportunityTier(opportunityScore);

    return {
      keyword,
      performance,
      opportunityScore,
      tier,
    };
  });

  // Sort by score and limit
  return opportunities
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, limit);
}

/**
 * Find untapped opportunities (high volume, low/no data)
 */
export function findUntappedOpportunities(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  settings: BrandSettings
): KeywordData[] {
  return keywords.filter((keyword) => {
    const performance = performances.get(keyword.keyword);
    
    // High volume keywords
    const isHighVolume = keyword.searchVolume.includes('20k') || 
                        keyword.searchVolume.includes('50k') || 
                        keyword.searchVolume.includes('100k');

    // Little or no performance data
    const hasLowData = !performance || performance.clicks < 10;

    // Not too competitive
    const notTooCompetitive = keyword.competition !== 'High';

    // Good relevance
    const goodRelevance = keyword.relevance >= 6;

    return isHighVolume && hasLowData && notTooCompetitive && goodRelevance;
  });
}

/**
 * Find quick wins (good performance, room to scale)
 */
export function findQuickWins(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  settings: BrandSettings
): Array<{
  keyword: KeywordData;
  performance: KeywordPerformance;
  reason: string;
}> {
  const quickWins: Array<{
    keyword: KeywordData;
    performance: KeywordPerformance;
    reason: string;
  }> = [];

  for (const keyword of keywords) {
    const performance = performances.get(keyword.keyword);
    if (!performance || performance.clicks < 10) continue;

    const reasons: string[] = [];

    // Good ACoS with room to increase bid
    if (performance.acos > 0 && performance.acos < settings.targetAcos * 0.7) {
      reasons.push('Excellent ACoS with room to increase bids');
    }

    // High CVR but low impressions
    if (performance.cvr > settings.targetCvr * 1.2 && performance.impressions < 1000) {
      reasons.push('High conversion rate but low impression share');
    }

    // Good CTR but low spend
    if (performance.ctr > settings.targetCtr * 1.2 && performance.spend < 20) {
      reasons.push('Strong CTR indicates good ad relevance');
    }

    // Low competition with good performance
    if (keyword.competition === 'Low' && performance.acos < settings.targetAcos) {
      reasons.push('Low competition market opportunity');
    }

    if (reasons.length > 0) {
      quickWins.push({
        keyword,
        performance,
        reason: reasons.join('; '),
      });
    }
  }

  return quickWins.sort((a, b) => b.performance.sales - a.performance.sales);
}

/**
 * Calculate potential additional sales
 */
export function calculatePotentialSales(
  keyword: KeywordData,
  performance: KeywordPerformance | null,
  settings: BrandSettings
): {
  currentMonthlySales: number;
  potentialMonthlySales: number;
  additionalSales: number;
  confidence: 'high' | 'medium' | 'low';
} {
  if (!performance || performance.clicks < 10) {
    return {
      currentMonthlySales: 0,
      potentialMonthlySales: 0,
      additionalSales: 0,
      confidence: 'low',
    };
  }

  const currentMonthlySales = performance.sales;

  // Estimate potential based on search volume and current performance
  let potentialMultiplier = 1.0;
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  // Good performance + high volume = high potential
  if (performance.cvr > settings.targetCvr && keyword.searchVolume.includes('50k')) {
    potentialMultiplier = 3.0;
    confidence = 'high';
  } else if (performance.cvr > settings.targetCvr * 0.8 && keyword.searchVolume.includes('20k')) {
    potentialMultiplier = 2.5;
    confidence = 'high';
  } else if (performance.cvr > settings.targetCvr * 0.6 && keyword.searchVolume.includes('10k')) {
    potentialMultiplier = 2.0;
    confidence = 'medium';
  } else {
    potentialMultiplier = 1.5;
    confidence = 'low';
  }

  // Adjust for competition
  if (keyword.competition === 'High') {
    potentialMultiplier *= 0.7;
  } else if (keyword.competition === 'Low') {
    potentialMultiplier *= 1.2;
  }

  const potentialMonthlySales = currentMonthlySales * potentialMultiplier;
  const additionalSales = potentialMonthlySales - currentMonthlySales;

  return {
    currentMonthlySales,
    potentialMonthlySales: Math.round(potentialMonthlySales * 100) / 100,
    additionalSales: Math.round(additionalSales * 100) / 100,
    confidence,
  };
}

/**
 * Get opportunity insights for a brand
 */
export function getOpportunityInsights(
  keywords: KeywordData[],
  performances: Map<string, KeywordPerformance>,
  settings: BrandSettings
): {
  topOpportunities: Array<{ keyword: KeywordData; score: number }>;
  untappedCount: number;
  quickWinsCount: number;
  totalPotentialSales: number;
  averageOpportunityScore: number;
} {
  const scores = calculateBatchOpportunityScores(keywords, performances, settings);
  
  const topOpportunities = keywords
    .map((k) => ({ keyword: k, score: scores.get(k.keyword) || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const untappedCount = findUntappedOpportunities(keywords, performances, settings).length;
  const quickWinsCount = findQuickWins(keywords, performances, settings).length;

  let totalPotentialSales = 0;
  for (const keyword of keywords) {
    const performance = performances.get(keyword.keyword) || null;
    const potential = calculatePotentialSales(keyword, performance, settings);
    totalPotentialSales += potential.additionalSales;
  }

  const totalScore = Array.from(scores.values()).reduce((sum, score) => sum + score, 0);
  const averageOpportunityScore = scores.size > 0 ? totalScore / scores.size : 0;

  return {
    topOpportunities,
    untappedCount,
    quickWinsCount,
    totalPotentialSales: Math.round(totalPotentialSales * 100) / 100,
    averageOpportunityScore: Math.round(averageOpportunityScore),
  };
}
