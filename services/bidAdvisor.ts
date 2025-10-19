/**
 * Bid Advisor Service
 * 
 * Provides intelligent bid recommendations based on performance data,
 * target ACoS, product price, and market conditions.
 */

import type {
  KeywordPerformance,
  BrandSettings,
  BidAdvisory,
} from '../types';

/**
 * Calculate maximum CPC based on target ACoS and product price
 * Formula: CPC_MAX = (Product Price * Target ACoS) / 100
 */
export function calculateCPCMax(
  productPrice: number,
  targetAcos: number,
  conversionRate: number = 10
): number {
  if (productPrice <= 0 || targetAcos <= 0) {
    return 0;
  }

  // Calculate CPC max using product price, target ACoS, and conversion rate as a fraction
  // Use conversionRate as a percentage (e.g., 10 for 10%), defaulting to 10 if undefined
  return productPrice * (targetAcos / 100) * ((conversionRate ?? 10) / 100);
}

/**
 * Get bid recommendation for a keyword
 */
export function getBidRecommendation(
  performance: KeywordPerformance,
  settings: BrandSettings
): BidAdvisory {
  const { clicks, acos, cpc, cvr, sales, spend } = performance;
  const { targetAcos, productPrice, isCompetitiveCategory } = settings;

  // Calculate CPC max
  const cpcMax = productPrice
    ? calculateCPCMax(productPrice, targetAcos, cvr || 10)
    : 0;

  // If no performance data, suggest starting bid
  if (clicks < 5) {
    const startingBid = cpcMax > 0 ? cpcMax * 0.6 : 0.5;
    return {
      currentBid: performance.currentBid,
      suggestedBid: Number(startingBid.toFixed(2)),
      cpcMax: Number(cpcMax.toFixed(2)),
      reasoning: 'Starting bid at 60% of CPC max for initial testing',
      expectedImpact: 'Will gather performance data to optimize further',
    };
  }

  // Calculate suggested bid based on performance
  let suggestedBid = cpc;
  let reasoning = '';
  let expectedImpact = '';

  // Strategy 1: ACoS-based adjustment
  if (acos > 0 && acos < targetAcos * 0.7) {
    // ACoS is well below target - increase bid to capture more volume
    const increasePercent = isCompetitiveCategory ? 15 : 20;
    suggestedBid = cpc * (1 + increasePercent / 100);
    reasoning = `ACoS (${acos.toFixed(1)}%) well below target (${targetAcos}%)`;
    expectedImpact = `Increase bid by ${increasePercent}% to gain more impressions and sales`;
  } else if (acos > targetAcos * 1.3) {
    // ACoS is well above target - decrease bid
    const decreasePercent = isCompetitiveCategory ? 15 : 20;
    suggestedBid = cpc * (1 - decreasePercent / 100);
    reasoning = `ACoS (${acos.toFixed(1)}%) exceeds target (${targetAcos}%)`;
    expectedImpact = `Decrease bid by ${decreasePercent}% to improve profitability`;
  } else if (acos > targetAcos * 1.1 && acos <= targetAcos * 1.3) {
    // ACoS slightly above target - small decrease
    suggestedBid = cpc * 0.95;
    reasoning = `ACoS (${acos.toFixed(1)}%) slightly above target (${targetAcos}%)`;
    expectedImpact = 'Small bid decrease to align with target ACoS';
  } else {
    // ACoS within acceptable range
    suggestedBid = cpc;
    reasoning = `ACoS (${acos.toFixed(1)}%) within target range (${targetAcos}%)`;
    expectedImpact = 'Maintain current bid for stable performance';
  }

  // Strategy 2: Ensure bid doesn't exceed CPC max
  if (cpcMax > 0 && suggestedBid > cpcMax) {
    suggestedBid = cpcMax * 0.95; // Stay 5% below max for safety
    reasoning += '. Capped at CPC max to maintain profitability';
  }

  // Strategy 3: Set minimum bid floor
  const minBid = 0.02; // Amazon's minimum
  if (suggestedBid < minBid) {
    suggestedBid = minBid;
    reasoning += `. Set to minimum bid ($${minBid})`;
  }

  // Strategy 4: Consider conversion rate
  if (clicks >= 20 && cvr > 0) {
    if (cvr > settings.targetCvr * 1.5) {
      // Exceptional conversion rate - can afford higher bids
      suggestedBid = Math.min(suggestedBid * 1.1, cpcMax);
      reasoning += '. High CVR allows for increased bid';
    } else if (cvr < settings.targetCvr * 0.5) {
      // Poor conversion - reduce bid
      suggestedBid = suggestedBid * 0.9;
      reasoning += '. Low CVR requires bid reduction';
    }
  }

  return {
    currentBid: performance.currentBid,
    suggestedBid: Number(suggestedBid.toFixed(2)),
    cpcMax: Number(cpcMax.toFixed(2)),
    reasoning: reasoning.trim(),
    expectedImpact: expectedImpact.trim(),
  };
}

/**
 * Calculate bid for a new keyword based on category and intent
 */
export function getInitialBid(
  keywordCategory: string,
  keywordIntent: string,
  settings: BrandSettings
): number {
  const { productPrice, targetAcos, isCompetitiveCategory } = settings;

  if (!productPrice || productPrice <= 0) {
    // Default starting bid if no price info
    return 0.5;
  }

  // Calculate base CPC max
  const cpcMax = calculateCPCMax(productPrice, targetAcos);

  // Adjust based on category
  let multiplier = 0.6; // Default starting at 60% of max

  switch (keywordCategory.toLowerCase()) {
    case 'branded':
      multiplier = 0.7; // Higher for branded terms (usually convert better)
      break;
    case 'core':
      multiplier = 0.65;
      break;
    case 'opportunity':
      multiplier = 0.55;
      break;
    case 'complementary':
      multiplier = 0.5;
      break;
    case 'low-hanging fruit':
      multiplier = 0.6;
      break;
  }

  // Adjust based on intent
  if (keywordIntent) {
    const intent = keywordIntent.toLowerCase();
    if (intent.includes('purchase') || intent.includes('buy')) {
      multiplier *= 1.1; // Boost for high-intent keywords
    } else if (intent.includes('research') || intent.includes('compare')) {
      multiplier *= 0.9; // Reduce for research keywords
    }
  }

  // Adjust for competitive categories
  if (isCompetitiveCategory) {
    multiplier *= 1.1;
  }

  const initialBid = cpcMax * multiplier;
  return Math.max(0.02, Number(initialBid.toFixed(2)));
}

/**
 * Batch calculate bid recommendations
 */
export function getBatchBidRecommendations(
  performances: KeywordPerformance[],
  settings: BrandSettings
): Map<string, BidAdvisory> {
  const recommendations = new Map<string, BidAdvisory>();

  for (const performance of performances) {
    const advisory = getBidRecommendation(performance, settings);
    recommendations.set(performance.keywordId, advisory);
  }

  return recommendations;
}

/**
 * Calculate potential ROI impact of bid change
 */
export function estimateBidChangeImpact(
  currentBid: number,
  suggestedBid: number,
  currentMetrics: {
    impressions: number;
    clicks: number;
    sales: number;
    acos: number;
  }
): {
  estimatedImpressionChange: number;
  estimatedClickChange: number;
  estimatedSpendChange: number;
  estimatedSalesChange: number;
  estimatedAcosChange: number;
} {
  const bidChangePercent = ((suggestedBid - currentBid) / currentBid) * 100;

  // Simplified impact model (in reality, this would be more sophisticated)
  // These are conservative estimates
  const impressionMultiplier = bidChangePercent > 0 ? 0.5 : 0.3;
  const clickMultiplier = bidChangePercent > 0 ? 0.4 : 0.4;
  const salesMultiplier = bidChangePercent > 0 ? 0.3 : 0.3;

  const estimatedImpressionChange = (bidChangePercent * impressionMultiplier);
  const estimatedClickChange = (bidChangePercent * clickMultiplier);
  const estimatedSpendChange = (bidChangePercent * (1 + clickMultiplier));
  const estimatedSalesChange = (bidChangePercent * salesMultiplier);

  // Calculate new ACoS
  const newSpend = currentMetrics.clicks * suggestedBid;
  const newSales = currentMetrics.sales * (1 + estimatedSalesChange / 100);
  const estimatedNewAcos = (newSpend / newSales) * 100;
  const estimatedAcosChange = estimatedNewAcos - currentMetrics.acos;

  return {
    estimatedImpressionChange: Number(estimatedImpressionChange.toFixed(1)),
    estimatedClickChange: Number(estimatedClickChange.toFixed(1)),
    estimatedSpendChange: Number(estimatedSpendChange.toFixed(1)),
    estimatedSalesChange: Number(estimatedSalesChange.toFixed(1)),
    estimatedAcosChange: Number(estimatedAcosChange.toFixed(1)),
  };
}

/**
 * Get keywords with bid optimization opportunities
 */
export function getBidOptimizationOpportunities(
  performances: KeywordPerformance[],
  settings: BrandSettings
): Array<{
  performance: KeywordPerformance;
  advisory: BidAdvisory;
  priority: 'high' | 'medium' | 'low';
}> {
  const opportunities = [];

  for (const performance of performances) {
    if (performance.clicks < 5) {
      continue; // Skip keywords without sufficient data
    }

    const advisory = getBidRecommendation(performance, settings);
    const currentBid = performance.currentBid || 0;
    const bidChangePercent = currentBid > 0
      ? Math.abs((advisory.suggestedBid - currentBid) / currentBid) * 100
      : 100;

    // Only include if bid change is significant (>10%)
    if (bidChangePercent > 10) {
      let priority: 'high' | 'medium' | 'low' = 'low';

      // High priority: Large spend with significant ACoS deviation
      if (performance.spend > 50 && Math.abs(performance.acos - settings.targetAcos) > 10) {
        priority = 'high';
      }
      // Medium priority: Moderate spend or moderate ACoS deviation
      else if (performance.spend > 20 || Math.abs(performance.acos - settings.targetAcos) > 5) {
        priority = 'medium';
      }

      opportunities.push({
        performance,
        advisory,
        priority,
      });
    }
  }

  // Sort by priority and potential impact
  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same priority, sort by spend (higher spend = higher priority)
    return b.performance.spend - a.performance.spend;
  });
}
