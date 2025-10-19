/**
 * Cannibalization Detector Service
 * 
 * Detects when keywords are competing with each other and cannibalizing performance.
 * This includes:
 * - Keywords in multiple campaigns
 * - Overlapping broad/phrase/exact match variations
 * - Similar keywords with poor combined performance
 */

import type {
  KeywordPerformance,
  KeywordData,
  CannibalizationAlert,
} from '../types';

/**
 * Cannibalization detection result
 */
export interface CannibalizationResult {
  keyword1: string;
  keyword2: string;
  keyword1Id: string;
  keyword2Id: string;
  campaign1Id?: string;
  campaign2Id?: string;
  score: number;
  reason: string;
  suggestedAction: string;
}

/**
 * Detect cannibalization between keywords
 */
export function detectCannibalization(
  performances: KeywordPerformance[],
  keywords: KeywordData[],
  campaignAssignments: Map<string, string> // keywordId -> campaignId
): CannibalizationResult[] {
  const results: CannibalizationResult[] = [];

  // Create keyword lookup
  const keywordLookup = new Map(keywords.map((k) => [k.keyword, k]));

  // Check each pair of keywords
  for (let i = 0; i < performances.length; i++) {
    for (let j = i + 1; j < performances.length; j++) {
      const perf1 = performances[i];
      const perf2 = performances[j];

      const kw1 = keywordLookup.get(perf1.keywordId);
      const kw2 = keywordLookup.get(perf2.keywordId);

      if (!kw1 || !kw2) continue;

      // Check for cannibalization
      const cannibalization = checkPairCannibalization(
        perf1,
        perf2,
        kw1,
        kw2,
        campaignAssignments.get(perf1.keywordId),
        campaignAssignments.get(perf2.keywordId)
      );

      if (cannibalization) {
        results.push(cannibalization);
      }
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Check if a pair of keywords is cannibalizing
 */
function checkPairCannibalization(
  perf1: KeywordPerformance,
  perf2: KeywordPerformance,
  kw1: KeywordData,
  kw2: KeywordData,
  campaign1Id?: string,
  campaign2Id?: string
): CannibalizationResult | null {
  let score = 0;
  const reasons: string[] = [];

  // Rule 1: Same keyword in different campaigns
  if (kw1.keyword === kw2.keyword && campaign1Id && campaign2Id && campaign1Id !== campaign2Id) {
    score += 90;
    reasons.push('Exact same keyword in multiple campaigns');
  }

  // Rule 2: Broad/Phrase/Exact overlap
  const overlap = checkMatchTypeOverlap(kw1.keyword, kw2.keyword);
  if (overlap) {
    score += 70;
    reasons.push(`Match type overlap: ${overlap}`);
  }

  // Rule 3: Very similar keywords with poor combined performance
  const similarity = calculateSimilarity(kw1.keyword, kw2.keyword);
  if (similarity > 0.8) {
    score += 40;
    reasons.push(`High keyword similarity (${(similarity * 100).toFixed(0)}%)`);

    // Check if combined performance is worse than expected
    const combinedAcos = ((perf1.spend + perf2.spend) / (perf1.sales + perf2.sales)) * 100;
    const avgIndividualAcos = (perf1.acos + perf2.acos) / 2;
    
    if (combinedAcos > avgIndividualAcos * 1.2) {
      score += 20;
      reasons.push('Combined performance worse than individual');
    }
  }

  // Rule 4: Competing for same impressions (low CTR on both)
  if (perf1.ctr < 0.5 && perf2.ctr < 0.5 && similarity > 0.6) {
    score += 30;
    reasons.push('Both keywords have low CTR - may be competing');
  }

  // Rule 5: Same campaign, different match types causing issues
  if (campaign1Id === campaign2Id && overlap) {
    score += 50;
    reasons.push('Same campaign with overlapping match types');
  }

  // Only report if score is significant
  if (score >= 50) {
    return {
      keyword1: kw1.keyword,
      keyword2: kw2.keyword,
      keyword1Id: perf1.keywordId,
      keyword2Id: perf2.keywordId,
      campaign1Id,
      campaign2Id,
      score: Math.min(100, score),
      reason: reasons.join('; '),
      suggestedAction: generateSuggestedAction(score, reasons, campaign1Id, campaign2Id),
    };
  }

  return null;
}

/**
 * Check if match types overlap
 */
function checkMatchTypeOverlap(keyword1: string, keyword2: string): string | null {
  const kw1Lower = keyword1.toLowerCase();
  const kw2Lower = keyword2.toLowerCase();

  // Exact match contains exact match
  if (kw1Lower === kw2Lower) {
    return 'exact duplicate';
  }

  // Phrase contains exact
  if (kw1Lower.includes(kw2Lower) || kw2Lower.includes(kw1Lower)) {
    return 'phrase contains exact';
  }

  // Broad could match phrase
  const kw1Words = kw1Lower.split(' ');
  const kw2Words = kw2Lower.split(' ');
  const commonWords = kw1Words.filter((w) => kw2Words.includes(w));

  if (commonWords.length >= Math.min(kw1Words.length, kw2Words.length) * 0.7) {
    return 'broad/phrase overlap';
  }

  return null;
}

/**
 * Calculate similarity between two keywords (0-1)
 */
function calculateSimilarity(keyword1: string, keyword2: string): number {
  const kw1Lower = keyword1.toLowerCase();
  const kw2Lower = keyword2.toLowerCase();

  // Exact match
  if (kw1Lower === kw2Lower) return 1.0;

  // Levenshtein-based similarity
  const distance = levenshteinDistance(kw1Lower, kw2Lower);
  const maxLength = Math.max(kw1Lower.length, kw2Lower.length);
  const similarity = 1 - distance / maxLength;

  return similarity;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Generate suggested action
 */
function generateSuggestedAction(
  score: number,
  reasons: string[],
  campaign1Id?: string,
  campaign2Id?: string
): string {
  // High severity
  if (score >= 80) {
    if (campaign1Id && campaign2Id && campaign1Id !== campaign2Id) {
      return 'Remove keyword from lower-performing campaign or add as negative in one campaign';
    }
    return 'Consolidate into single keyword with best match type';
  }

  // Medium severity
  if (score >= 60) {
    if (reasons.some((r) => r.includes('match type'))) {
      return 'Review match type strategy - consider removing broad match or adding negatives';
    }
    return 'Monitor performance closely and consider consolidating if issues persist';
  }

  // Lower severity
  return 'Add cross-negatives between campaigns or adjust bids to differentiate';
}

/**
 * Find self-cannibalization (same keyword in multiple places)
 */
export function findSelfCannibalization(
  keywords: KeywordData[],
  campaignAssignments: Map<string, string[]> // keywordId -> campaignIds[]
): CannibalizationResult[] {
  const results: CannibalizationResult[] = [];
  const keywordMap = new Map<string, KeywordData[]>();

  // Group by keyword text
  for (const kw of keywords) {
    const key = kw.keyword.toLowerCase();
    if (!keywordMap.has(key)) {
      keywordMap.set(key, []);
    }
    keywordMap.get(key)!.push(kw);
  }

  // Check for duplicates
  for (const [keywordText, kwList] of keywordMap.entries()) {
    if (kwList.length > 1) {
      // Check if in different campaigns
      for (let i = 0; i < kwList.length; i++) {
        for (let j = i + 1; j < kwList.length; j++) {
          const kw1 = kwList[i];
          const kw2 = kwList[j];
          const campaigns1 = campaignAssignments.get(kw1.keyword) || [];
          const campaigns2 = campaignAssignments.get(kw2.keyword) || [];

          // Check if in different campaigns
          const differentCampaigns = campaigns1.some((c1) => 
            campaigns2.some((c2) => c1 !== c2)
          );

          if (differentCampaigns) {
            results.push({
              keyword1: kw1.keyword,
              keyword2: kw2.keyword,
              keyword1Id: kw1.keyword,
              keyword2Id: kw2.keyword,
              campaign1Id: campaigns1[0],
              campaign2Id: campaigns2[0],
              score: 100,
              reason: 'Exact duplicate keyword in multiple campaigns',
              suggestedAction: 'Remove from lower-performing campaign and add as negative',
            });
          }
        }
      }
    }
  }

  return results;
}

/**
 * Detect broad match cannibalization
 */
export function detectBroadMatchCannibalization(
  keywords: KeywordData[],
  performances: KeywordPerformance[]
): CannibalizationResult[] {
  const results: CannibalizationResult[] = [];
  const broadKeywords = keywords.filter((k) => k.type === 'Broad');

  for (const broad of broadKeywords) {
    // Find more specific keywords that might be cannibalized by this broad match
    const moreSpecific = keywords.filter(
      (k) =>
        k.keyword !== broad.keyword &&
        (k.type === 'Phrase' || k.type === 'Exact') &&
        k.keyword.toLowerCase().includes(broad.keyword.toLowerCase())
    );

    for (const specific of moreSpecific) {
      const broadPerf = performances.find((p) => p.keywordId === broad.keyword);
      const specificPerf = performances.find((p) => p.keywordId === specific.keyword);

      if (!broadPerf || !specificPerf) continue;

      // Check if broad match is stealing impressions from more specific match
      if (broadPerf.impressions > specificPerf.impressions * 2 && broadPerf.ctr < specificPerf.ctr) {
        results.push({
          keyword1: broad.keyword,
          keyword2: specific.keyword,
          keyword1Id: broad.keyword,
          keyword2Id: specific.keyword,
          score: 70,
          reason: 'Broad match may be stealing impressions from more specific match',
          suggestedAction: `Add "${specific.keyword}" as negative exact to broad match campaign`,
        });
      }
    }
  }

  return results;
}

/**
 * Get summary of cannibalization issues
 */
export function getCannibalizationSummary(results: CannibalizationResult[]): {
  total: number;
  severe: number;
  moderate: number;
  mild: number;
  totalWastedSpend: number;
} {
  return {
    total: results.length,
    severe: results.filter((r) => r.score >= 80).length,
    moderate: results.filter((r) => r.score >= 60 && r.score < 80).length,
    mild: results.filter((r) => r.score < 60).length,
    totalWastedSpend: 0, // Would need spend data to calculate
  };
}
