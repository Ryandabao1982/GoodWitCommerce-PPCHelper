/**
 * Tests for Rules Service
 */

import { describe, it, expect } from 'vitest';
import {
  shouldPromoteKeyword,
  shouldNegateKeyword,
  shouldPauseKeyword,
  generateKeywordAlert,
  calculateBidAdvice,
  calculateOpportunityScore,
  getDefaultThresholds,
  aggregateMetrics,
} from '../../services/rulesService';
import type { KeywordMetricsDaily } from '../../types';

describe('rulesService', () => {
  const defaultThresholds = getDefaultThresholds();

  describe('aggregateMetrics', () => {
    it('should aggregate metrics correctly', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 25,
          orders: 5,
          sales: 100,
          cpc: 0.5,
        },
        {
          id: '2',
          keywordId: 'k1',
          date: '2025-01-02',
          impressions: 500,
          clicks: 25,
          spend: 12.5,
          orders: 3,
          sales: 60,
          cpc: 0.5,
        },
      ];

      const agg = aggregateMetrics(metrics);

      expect(agg.totalClicks).toBe(75);
      expect(agg.totalOrders).toBe(8);
      expect(agg.totalSpend).toBe(37.5);
      expect(agg.totalSales).toBe(160);
      expect(agg.impressions).toBe(1500);
      expect(agg.avgCtr).toBeCloseTo(0.05); // 75/1500
      expect(agg.avgCvr).toBeCloseTo(0.1067, 3); // 8/75
      expect(agg.avgAcos).toBeCloseTo(0.234375); // 37.5/160
    });

    it('should handle empty metrics', () => {
      const agg = aggregateMetrics([]);
      expect(agg.totalClicks).toBe(0);
      expect(agg.totalOrders).toBe(0);
      expect(agg.avgCtr).toBe(0);
    });
  });

  describe('shouldPromoteKeyword', () => {
    it('should promote when clicks threshold met with orders', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 25,
          spend: 25,
          orders: 2,
          sales: 100,
        },
      ];

      const decision = shouldPromoteKeyword(metrics, defaultThresholds, 'Generic', 0.05);

      expect(decision.shouldPromote).toBe(true);
      expect(decision.targetState).toBe('Performance');
      expect(decision.reason).toContain('orders');
    });

    it('should promote to SKAG with 3+ orders', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 25,
          spend: 25,
          orders: 3,
          sales: 150,
        },
      ];

      const decision = shouldPromoteKeyword(metrics, defaultThresholds, 'Generic', 0.05);

      expect(decision.shouldPromote).toBe(true);
      expect(decision.targetState).toBe('SKAG');
    });

    it('should not promote with insufficient clicks', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 100,
          clicks: 10,
          spend: 5,
          orders: 1,
          sales: 25,
        },
      ];

      const decision = shouldPromoteKeyword(metrics, defaultThresholds, 'Generic', 0.05);

      expect(decision.shouldPromote).toBe(false);
      expect(decision.reason).toContain('Insufficient clicks');
    });

    it('should use higher threshold for competitive categories', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 25,
          spend: 25,
          orders: 1,
          sales: 50,
        },
      ];

      const decision = shouldPromoteKeyword(metrics, defaultThresholds, 'Competitor', 0.05);

      expect(decision.shouldPromote).toBe(false);
      expect(decision.reason).toContain('Insufficient clicks (25/30)');
    });

    it('should promote based on CVR graduation', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 25,
          spend: 25,
          orders: 0,
          sales: 0,
        },
      ];

      const medianCvr = 0.05; // 5%
      const decision = shouldPromoteKeyword(metrics, defaultThresholds, 'Generic', medianCvr);

      // CVR is 0, which is < 0.8 * 0.05 = 0.04
      expect(decision.shouldPromote).toBe(false);
    });
  });

  describe('shouldNegateKeyword', () => {
    it('should negate when clicks threshold met with no sales', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 500,
          clicks: 20,
          spend: 15,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldNegateKeyword(metrics, defaultThresholds, 'Generic');

      expect(decision.shouldNegate).toBe(true);
      expect(decision.matchType).toBe('NEG_PHRASE');
      expect(decision.reason).toContain('no sales');
    });

    it('should not negate with insufficient clicks', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 200,
          clicks: 10,
          spend: 5,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldNegateKeyword(metrics, defaultThresholds, 'Generic');

      expect(decision.shouldNegate).toBe(false);
    });

    it('should use higher threshold for competitive categories', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 25,
          spend: 20,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldNegateKeyword(metrics, defaultThresholds, 'Competitor');

      expect(decision.shouldNegate).toBe(false); // Need 30 clicks for competitive
    });
  });

  describe('shouldPauseKeyword', () => {
    it('should pause when CTR below threshold', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 250,
          clicks: 0, // 0% CTR
          spend: 0,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldPauseKeyword(metrics, defaultThresholds, 200);

      expect(decision.shouldPause).toBe(true);
      expect(decision.reason).toContain('CTR');
    });

    it('should not pause with insufficient impressions', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 100,
          clicks: 0,
          spend: 0,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldPauseKeyword(metrics, defaultThresholds, 200);

      expect(decision.shouldPause).toBe(false);
      expect(decision.reason).toContain('Insufficient impressions');
    });

    it('should not pause when CTR acceptable', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 5, // 0.5% CTR
          spend: 2.5,
          orders: 0,
          sales: 0,
        },
      ];

      const decision = shouldPauseKeyword(metrics, defaultThresholds, 200);

      expect(decision.shouldPause).toBe(false);
    });
  });

  describe('generateKeywordAlert', () => {
    it('should generate RED alert for high ACOS', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 500,
          clicks: 50,
          spend: 100,
          orders: 1,
          sales: 150, // ACOS = 66.7%
        },
      ];

      const alert = generateKeywordAlert(metrics, defaultThresholds, 0.25);

      expect(alert.level).toBe('RED');
      expect(alert.title).toContain('ACOS');
    });

    it('should generate RED alert for wasted spend', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 5000,
          clicks: 500,
          spend: 600,
          orders: 0,
          sales: 0,
        },
      ];

      const alert = generateKeywordAlert(metrics, defaultThresholds, 0.25);

      expect(alert.level).toBe('RED');
      expect(alert.title).toContain('Wasted Spend');
    });

    it('should generate AMBER alert for low CTR', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 1, // 0.1% CTR
          spend: 0.5,
          orders: 0,
          sales: 0,
        },
      ];

      const alert = generateKeywordAlert(metrics, defaultThresholds, 0.25);

      expect(alert.level).toBe('AMBER');
      expect(alert.title).toContain('CTR');
    });

    it('should generate GREEN alert for healthy performance', () => {
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 25,
          orders: 5,
          sales: 150, // ACOS = 16.7%
        },
      ];

      const alert = generateKeywordAlert(metrics, defaultThresholds, 0.25);

      expect(alert.level).toBe('GREEN');
    });
  });

  describe('calculateBidAdvice', () => {
    it('should calculate bid for high intent keyword', () => {
      const cpcMax = 2.0; // Use higher cpc_max so 1.2 doesn't get capped
      const advice = calculateBidAdvice(cpcMax, 'High');

      expect(advice.baseBid).toBeCloseTo(2.0, 2); // Capped at cpc_max
      expect(advice.placementTos).toBeCloseTo(0.55, 2);
      expect(advice.placementPp).toBeCloseTo(0.35, 2);
    });

    it('should calculate bid for mid intent keyword', () => {
      const cpcMax = 1.0;
      const advice = calculateBidAdvice(cpcMax, 'Mid');

      expect(advice.baseBid).toBeCloseTo(1.0, 2);
      expect(advice.placementTos).toBeCloseTo(0.35, 2);
      expect(advice.placementPp).toBeCloseTo(0.25, 2);
    });

    it('should calculate bid for low intent keyword', () => {
      const cpcMax = 1.0;
      const advice = calculateBidAdvice(cpcMax, 'Low');

      expect(advice.baseBid).toBeCloseTo(0.8, 2);
      expect(advice.placementTos).toBeCloseTo(0.25, 2);
      expect(advice.placementPp).toBeCloseTo(0.15, 2);
    });

    it('should increase bid for strong performance', () => {
      const cpcMax = 2.0; // Use higher max to allow increase
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 25,
          orders: 5,
          sales: 250, // ACOS = 10%
        },
      ];

      const advice = calculateBidAdvice(cpcMax, 'Mid', metrics, 0.25);

      expect(advice.baseBid).toBeGreaterThan(1.0);
      expect(advice.reason).toContain('strong performance');
    });

    it('should decrease bid for poor performance', () => {
      const cpcMax = 1.0;
      const metrics: KeywordMetricsDaily[] = [
        {
          id: '1',
          keywordId: 'k1',
          date: '2025-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 50,
          orders: 1,
          sales: 100, // ACOS = 50%
        },
      ];

      const advice = calculateBidAdvice(cpcMax, 'Mid', metrics, 0.25);

      expect(advice.baseBid).toBeLessThan(1.0);
      expect(advice.reason).toContain('high ACOS');
    });

    it('should never exceed cpc_max', () => {
      const cpcMax = 0.5;
      const advice = calculateBidAdvice(cpcMax, 'High');

      expect(advice.baseBid).toBeLessThanOrEqual(cpcMax);
    });
  });

  describe('calculateOpportunityScore', () => {
    it('should calculate opportunity score correctly', () => {
      const score = calculateOpportunityScore(10000, 80, 100, 1.5);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeCloseTo(5333.3333, 2);
    });

    it('should return 0 for zero competing products', () => {
      const score = calculateOpportunityScore(10000, 80, 0, 1.5);

      expect(score).toBe(0);
    });

    it('should return 0 for zero CPC estimate', () => {
      const score = calculateOpportunityScore(10000, 80, 100, 0);

      expect(score).toBe(0);
    });
  });
});
