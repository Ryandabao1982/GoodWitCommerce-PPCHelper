/**
 * Rules Service - Pure functions for keyword lifecycle rules
 * Implements promotion, negation, pause, and alert logic based on thresholds
 */

import type {
  KeywordMetricsDaily,
  SettingsThresholds,
  KeywordCategory,
  AlertLevel,
  KeywordIntent,
} from '../types';

export interface PromotionDecision {
  shouldPromote: boolean;
  reason: string;
  targetState: 'Performance' | 'SKAG' | null;
}

export interface NegationDecision {
  shouldNegate: boolean;
  reason: string;
  matchType: 'NEG_PHRASE' | 'NEG_EXACT' | null;
}

export interface PauseDecision {
  shouldPause: boolean;
  reason: string;
}

export interface AlertDecision {
  level: AlertLevel;
  title: string;
  message: string;
}

export interface BidAdvice {
  baseBid: number;
  placementTos: number; // Percentage multiplier
  placementPp: number; // Percentage multiplier
  reason: string;
}

/**
 * Aggregate metrics from daily data for a time window
 */
export function aggregateMetrics(
  metrics: KeywordMetricsDaily[]
): {
  totalClicks: number;
  totalOrders: number;
  totalSpend: number;
  totalSales: number;
  avgCtr: number;
  avgCvr: number;
  avgAcos: number;
  impressions: number;
} {
  if (metrics.length === 0) {
    return {
      totalClicks: 0,
      totalOrders: 0,
      totalSpend: 0,
      totalSales: 0,
      avgCtr: 0,
      avgCvr: 0,
      avgAcos: 0,
      impressions: 0,
    };
  }

  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalOrders = metrics.reduce((sum, m) => sum + m.orders, 0);
  const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
  const totalSales = metrics.reduce((sum, m) => sum + m.sales, 0);
  const impressions = metrics.reduce((sum, m) => sum + m.impressions, 0);

  const avgCtr = impressions > 0 ? totalClicks / impressions : 0;
  const avgCvr = totalClicks > 0 ? totalOrders / totalClicks : 0;
  const avgAcos = totalSales > 0 ? totalSpend / totalSales : 0;

  return {
    totalClicks,
    totalOrders,
    totalSpend,
    totalSales,
    avgCtr,
    avgCvr,
    avgAcos,
    impressions,
  };
}

/**
 * Determine if a keyword should be promoted to Performance or SKAG
 */
export function shouldPromoteKeyword(
  metrics: KeywordMetricsDaily[],
  thresholds: SettingsThresholds,
  category: KeywordCategory,
  medianCvr: number = 0.05
): PromotionDecision {
  const agg = aggregateMetrics(metrics);

  // Determine if this is a competitive category
  const isCompetitive = category === 'Competitor';
  const clickThreshold = isCompetitive
    ? thresholds.clicksPromoteCompetitive
    : thresholds.clicksPromoteStandard;

  // Rule 1: Minimum clicks not met
  if (agg.totalClicks < clickThreshold) {
    return {
      shouldPromote: false,
      reason: `Insufficient clicks (${agg.totalClicks}/${clickThreshold})`,
      targetState: null,
    };
  }

  // Rule 2: Has at least 1 order
  if (agg.totalOrders >= 1) {
    return {
      shouldPromote: true,
      reason: `Met click threshold (${agg.totalClicks}) with ${agg.totalOrders} orders`,
      targetState: agg.totalOrders >= 3 ? 'SKAG' : 'Performance',
    };
  }

  // Rule 3: CVR graduation - CVR >= 0.8× median CVR
  const cvrThreshold = medianCvr * thresholds.cvrGraduationFactor;
  if (agg.avgCvr >= cvrThreshold) {
    return {
      shouldPromote: true,
      reason: `CVR ${(agg.avgCvr * 100).toFixed(2)}% >= ${(cvrThreshold * 100).toFixed(2)}% threshold`,
      targetState: 'Performance',
    };
  }

  return {
    shouldPromote: false,
    reason: `No orders and CVR ${(agg.avgCvr * 100).toFixed(2)}% below ${(cvrThreshold * 100).toFixed(2)}% threshold`,
    targetState: null,
  };
}

/**
 * Determine if a keyword should be negated
 */
export function shouldNegateKeyword(
  metrics: KeywordMetricsDaily[],
  thresholds: SettingsThresholds,
  category: KeywordCategory
): NegationDecision {
  const agg = aggregateMetrics(metrics);

  const isCompetitive = category === 'Competitor';
  const clickThreshold = isCompetitive
    ? thresholds.clicksNegateCompetitive
    : thresholds.clicksNegateStandard;

  // Rule: Clicks threshold met with 0 sales
  if (agg.totalClicks >= clickThreshold && agg.totalOrders === 0) {
    return {
      shouldNegate: true,
      reason: `${agg.totalClicks} clicks with no sales, spent $${agg.totalSpend.toFixed(2)}`,
      matchType: 'NEG_PHRASE',
    };
  }

  return {
    shouldNegate: false,
    reason: 'Does not meet negation criteria',
    matchType: null,
  };
}

/**
 * Determine if a keyword should be paused due to poor CTR
 */
export function shouldPauseKeyword(
  metrics: KeywordMetricsDaily[],
  thresholds: SettingsThresholds,
  minImpressions: number = 200
): PauseDecision {
  const agg = aggregateMetrics(metrics);

  if (agg.impressions < minImpressions) {
    return {
      shouldPause: false,
      reason: `Insufficient impressions (${agg.impressions}/${minImpressions})`,
    };
  }

  if (agg.avgCtr < thresholds.ctrPauseThreshold) {
    return {
      shouldPause: true,
      reason: `CTR ${(agg.avgCtr * 100).toFixed(3)}% below ${(thresholds.ctrPauseThreshold * 100).toFixed(1)}% threshold after ${agg.impressions} impressions`,
    };
  }

  return {
    shouldPause: false,
    reason: 'CTR is acceptable',
  };
}

/**
 * Generate RAG alert for a keyword
 */
export function generateKeywordAlert(
  metrics: KeywordMetricsDaily[],
  thresholds: SettingsThresholds,
  targetAcos: number = 0.25
): AlertDecision {
  const agg = aggregateMetrics(metrics);

  // RED: ACOS > 200% of target or wasted spend > threshold
  if (agg.totalSales > 0 && agg.avgAcos > targetAcos * 2) {
    return {
      level: 'RED',
      title: 'Critical ACOS',
      message: `ACOS ${(agg.avgAcos * 100).toFixed(1)}% is ${((agg.avgAcos / targetAcos) * 100).toFixed(0)}% of target. Spent $${agg.totalSpend.toFixed(2)}, sales $${agg.totalSales.toFixed(2)}`,
    };
  }

  if (agg.totalOrders === 0 && agg.totalSpend > thresholds.wastedSpendRed) {
    return {
      level: 'RED',
      title: 'Wasted Spend',
      message: `No sales after spending $${agg.totalSpend.toFixed(2)}`,
    };
  }

  // AMBER: Low CTR or CVR drop
  if (agg.impressions >= 200 && agg.avgCtr < thresholds.ctrPauseThreshold) {
    return {
      level: 'AMBER',
      title: 'Low CTR',
      message: `CTR ${(agg.avgCtr * 100).toFixed(3)}% after ${agg.impressions} impressions`,
    };
  }

  // GREEN: All good
  return {
    level: 'GREEN',
    title: 'Healthy',
    message: (agg.totalOrders > 0 && agg.totalSales > 0)
      ? `${agg.totalOrders} orders, ACOS ${(agg.avgAcos * 100).toFixed(1)}%`
      : `${agg.totalClicks} clicks, monitoring performance`,
  };
}

/**
 * Calculate bid advice based on intent and performance
 */
export function calculateBidAdvice(
  cpcMax: number,
  intent: KeywordIntent,
  metrics?: KeywordMetricsDaily[],
  targetAcos?: number
): BidAdvice {
  // Base multipliers by intent
  const intentMultipliers = {
    High: { base: 1.2, tos: 0.55, pp: 0.35 },
    Mid: { base: 1.0, tos: 0.35, pp: 0.25 },
    Low: { base: 0.8, tos: 0.25, pp: 0.15 },
  };

  const multiplier = intentMultipliers[intent];
  let baseBid = cpcMax * multiplier.base;
  let placementTos = multiplier.tos;
  let placementPp = multiplier.pp;
  let reason = `Base bid for ${intent} intent keyword`;

  // Performance nudges if metrics available
  if (metrics && metrics.length > 0 && targetAcos) {
    const agg = aggregateMetrics(metrics);

    // Strong performer: +10-20%
    if (agg.totalOrders >= 2 && agg.avgAcos < targetAcos * 0.5) {
      baseBid *= 1.15;
      placementTos += 0.1;
      placementPp += 0.05;
      reason += '; increased bid for strong performance';
    }
    // Poor performer: -10-20%
    else if (agg.totalSpend > 0 && agg.avgAcos > targetAcos * 1.5) {
      baseBid *= 0.85;
      placementTos = Math.max(0, placementTos - 0.1);
      placementPp = Math.max(0, placementPp - 0.05);
      reason += '; decreased bid due to high ACOS';
    }
  }

  // Never exceed cpc_max
  baseBid = Math.min(baseBid, cpcMax);

  return {
    baseBid: parseFloat(baseBid.toFixed(4)),
    placementTos: parseFloat(placementTos.toFixed(2)),
    placementPp: parseFloat(placementPp.toFixed(2)),
    reason,
  };
}

/**
 * Get default thresholds
 */
export function getDefaultThresholds(): SettingsThresholds {
  return {
    brandId: '',
    clicksPromoteStandard: 20,
    clicksNegateStandard: 15,
    clicksPromoteCompetitive: 30,
    clicksNegateCompetitive: 30,
    cvrGraduationFactor: 0.8,
    ctrPauseThreshold: 0.002, // 0.2%
    wastedSpendRed: 500,
  };
}

/**
 * Calculate opportunity score for keyword discovery
 */
export function calculateOpportunityScore(
  searchVolume: number,
  iqScore: number,
  competingProducts: number,
  cpcEstimate: number
): number {
  if (competingProducts === 0 || cpcEstimate === 0) {
    return 0;
  }

  const oppScore = (searchVolume * iqScore) / (competingProducts * cpcEstimate);
  return parseFloat(oppScore.toFixed(4));
}
