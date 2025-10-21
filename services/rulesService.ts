/**
 * Rules Service - Lifecycle Management Decision Engine
 *
 * This service implements the automated decision logic for keyword lifecycle management,
 * including promotion, negation, pause decisions, and RAG status calculation.
 */

import type {
  KeywordPerformance,
  BrandSettings,
  LifecycleDecision,
  LifecycleStage,
  RAGStatus,
} from '../types';

/**
 * Evaluate a keyword's performance and determine lifecycle action
 */
export function evaluateLifecycleStage(
  performance: KeywordPerformance,
  settings: BrandSettings
): LifecycleDecision {
  const { clicks, acos, ctr, cvr, lifecycleStage } = performance;
  const { clicksToPromote, clicksToNegate, ctrPauseThreshold, targetAcos, cvrFactorMedian } =
    settings;

  // Rule 1: Promotion (Discovery -> Test -> Performance -> SKAG)
  if (clicks >= clicksToPromote) {
    if (acos > 0 && acos <= targetAcos && cvr > cvrFactorMedian) {
      // Strong performer - promote
      const nextStage = getNextLifecycleStage(lifecycleStage);
      if (nextStage !== lifecycleStage) {
        return {
          action: 'promote',
          toStage: nextStage,
          reason: `Strong performance: ${clicks} clicks, ${acos.toFixed(1)}% ACoS (target: ${targetAcos}%), ${cvr.toFixed(1)}% CVR`,
          confidence: 85,
        };
      }
    }
  }

  // Rule 2: Negation (poor performance with sufficient data)
  if (clicks >= clicksToNegate) {
    if (acos > targetAcos * 2 || cvr < cvrFactorMedian * 0.5) {
      return {
        action: 'negate',
        reason: `Poor performance: ${clicks} clicks, ${acos.toFixed(1)}% ACoS (target: ${targetAcos}%), ${cvr.toFixed(1)}% CVR`,
        confidence: 90,
      };
    }
  }

  // Rule 3: Pause (very low CTR indicating poor relevance)
  if (clicks > 5 && ctr < ctrPauseThreshold) {
    return {
      action: 'pause',
      reason: `Low CTR: ${ctr.toFixed(2)}% (threshold: ${ctrPauseThreshold}%)`,
      confidence: 75,
    };
  }

  // Rule 4: Maintain current stage
  return {
    action: 'maintain',
    reason: 'Insufficient data or within acceptable performance range',
    confidence: 50,
  };
}

/**
 * Get the next lifecycle stage for promotion
 */
function getNextLifecycleStage(currentStage: LifecycleStage): LifecycleStage {
  const stageProgression: Record<LifecycleStage, LifecycleStage> = {
    Discovery: 'Test',
    Test: 'Performance',
    Performance: 'SKAG',
    SKAG: 'SKAG', // Already at highest stage
    Archived: 'Archived', // Cannot promote archived keywords
  };
  return stageProgression[currentStage];
}

/**
 * Calculate RAG (Red/Amber/Green) status for a keyword
 */
export function calculateRAGStatus(
  performance: KeywordPerformance,
  settings: BrandSettings
): { status: RAGStatus; drivers: string[] } {
  const { spend, sales, acos, ctr, cvr, clicks } = performance;
  const { targetAcos, wastedSpendRedThreshold, targetCtr, targetCvr } = settings;

  const drivers: string[] = [];
  let redCount = 0;
  let amberCount = 0;

  // Check wasted spend (Red driver)
  const wastedSpend = sales === 0 ? spend : spend - sales / (targetAcos / 100);
  if (wastedSpend > wastedSpendRedThreshold) {
    drivers.push(`High wasted spend: $${wastedSpend.toFixed(2)}`);
    redCount++;
  }

  // Check ACoS performance
  if (acos > 0) {
    if (acos > targetAcos * 1.5) {
      drivers.push(`ACoS too high: ${acos.toFixed(1)}% (target: ${targetAcos}%)`);
      redCount++;
    } else if (acos > targetAcos * 1.2) {
      drivers.push(`ACoS above target: ${acos.toFixed(1)}% (target: ${targetAcos}%)`);
      amberCount++;
    }
  }

  // Check CTR
  if (clicks > 5) {
    if (ctr < targetCtr * 0.5) {
      drivers.push(`Low CTR: ${ctr.toFixed(2)}% (target: ${targetCtr}%)`);
      redCount++;
    } else if (ctr < targetCtr * 0.8) {
      drivers.push(`CTR below target: ${ctr.toFixed(2)}% (target: ${targetCtr}%)`);
      amberCount++;
    }
  }

  // Check CVR
  if (clicks > 10) {
    if (cvr < targetCvr * 0.5) {
      drivers.push(`Low conversion: ${cvr.toFixed(1)}% (target: ${targetCvr}%)`);
      redCount++;
    } else if (cvr < targetCvr * 0.8) {
      drivers.push(`CVR below target: ${cvr.toFixed(1)}% (target: ${targetCvr}%)`);
      amberCount++;
    }
  }

  // Determine overall status
  let status: RAGStatus;
  if (redCount >= 2) {
    status = 'Red';
  } else if (redCount === 1 || amberCount >= 2) {
    status = 'Amber';
  } else {
    status = 'Green';
    if (drivers.length === 0) {
      drivers.push('All metrics within target range');
    }
  }

  return { status, drivers };
}

/**
 * Check if a keyword should be automatically promoted
 */
export function shouldAutoPromote(
  performance: KeywordPerformance,
  settings: BrandSettings
): boolean {
  if (!settings.enableAutoPromotion) {
    return false;
  }

  const decision = evaluateLifecycleStage(performance, settings);
  return decision.action === 'promote' && decision.confidence >= 80;
}

/**
 * Check if a keyword should be automatically negated
 */
export function shouldAutoNegate(
  performance: KeywordPerformance,
  settings: BrandSettings
): boolean {
  if (!settings.enableAutoNegation) {
    return false;
  }

  const decision = evaluateLifecycleStage(performance, settings);
  return decision.action === 'negate' && decision.confidence >= 85;
}

/**
 * Check if a keyword should be automatically paused
 */
export function shouldAutoPause(performance: KeywordPerformance, settings: BrandSettings): boolean {
  if (!settings.enableAutoPause) {
    return false;
  }

  const decision = evaluateLifecycleStage(performance, settings);
  return decision.action === 'pause' && decision.confidence >= 70;
}

/**
 * Batch evaluate multiple keywords
 */
export function evaluateBatch(
  performances: KeywordPerformance[],
  settings: BrandSettings
): Map<string, LifecycleDecision> {
  const decisions = new Map<string, LifecycleDecision>();

  for (const performance of performances) {
    const decision = evaluateLifecycleStage(performance, settings);
    decisions.set(performance.keywordId, decision);
  }

  return decisions;
}

/**
 * Get keywords that need attention (Red or Amber status)
 */
export function getKeywordsNeedingAttention(
  performances: KeywordPerformance[],
  settings: BrandSettings
): KeywordPerformance[] {
  return performances.filter((perf) => {
    const { status } = calculateRAGStatus(perf, settings);
    return status === 'Red' || status === 'Amber';
  });
}

/**
 * Calculate median value from array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate portfolio-level CVR median for comparison
 */
export function calculatePortfolioCVRMedian(performances: KeywordPerformance[]): number {
  const cvrs = performances.filter((p) => p.clicks > 10 && p.cvr > 0).map((p) => p.cvr);

  return calculateMedian(cvrs);
}

/**
 * Get keywords ready for promotion
 */
export function getPromotionCandidates(
  performances: KeywordPerformance[],
  settings: BrandSettings
): KeywordPerformance[] {
  return performances.filter((perf) => {
    const decision = evaluateLifecycleStage(perf, settings);
    return decision.action === 'promote' && decision.confidence >= 75;
  });
}

/**
 * Get keywords that should be negated
 */
export function getNegationCandidates(
  performances: KeywordPerformance[],
  settings: BrandSettings
): KeywordPerformance[] {
  return performances.filter((perf) => {
    const decision = evaluateLifecycleStage(perf, settings);
    return decision.action === 'negate' && decision.confidence >= 80;
  });
}

/**
 * Get keywords that should be paused
 */
export function getPauseCandidates(
  performances: KeywordPerformance[],
  settings: BrandSettings
): KeywordPerformance[] {
  return performances.filter((perf) => {
    const decision = evaluateLifecycleStage(perf, settings);
    return decision.action === 'pause' && decision.confidence >= 70;
  });
}
