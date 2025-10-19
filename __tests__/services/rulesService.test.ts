import { describe, it, expect } from 'vitest';
import {
  evaluateLifecycleStage,
  calculateRAGStatus,
  shouldAutoPromote,
  shouldAutoNegate,
  shouldAutoPause,
  evaluateBatch,
  getKeywordsNeedingAttention,
  calculatePortfolioCVRMedian,
  getPromotionCandidates,
  getNegationCandidates,
  getPauseCandidates,
} from '../../services/rulesService';
import type { KeywordPerformance, BrandSettings } from '../../types';

// Helper to create test performance data
const createPerformance = (overrides: Partial<KeywordPerformance> = {}): KeywordPerformance => ({
  id: 'perf-1',
  keywordId: 'kw-1',
  brandId: 'brand-1',
  impressions: 1000,
  clicks: 50,
  spend: 25.0,
  sales: 100.0,
  orders: 5,
  ctr: 5.0,
  cvr: 10.0,
  cpc: 0.5,
  acos: 25.0,
  roas: 4.0,
  lifecycleStage: 'Discovery',
  ragStatus: 'Green',
  ragDrivers: [],
  opportunityScore: 50,
  lastUpdated: '2025-10-19T00:00:00Z',
  createdAt: '2025-10-19T00:00:00Z',
  ...overrides,
});

// Helper to create test settings
const createSettings = (overrides: Partial<BrandSettings> = {}): BrandSettings => ({
  id: 'settings-1',
  brandId: 'brand-1',
  clicksToPromote: 25,
  clicksToNegate: 10,
  ctrPauseThreshold: 0.3,
  cvrFactorMedian: 0.5,
  wastedSpendRedThreshold: 50.0,
  targetAcos: 30.0,
  productPrice: 50.0,
  isCompetitiveCategory: false,
  targetRoas: 3.0,
  targetCtr: 0.5,
  targetCvr: 10.0,
  enableAutoPromotion: false,
  enableAutoNegation: false,
  enableAutoPause: false,
  enableCannibalizationDetection: true,
  createdAt: '2025-10-19T00:00:00Z',
  updatedAt: '2025-10-19T00:00:00Z',
  ...overrides,
});

describe('rulesService', () => {
  describe('evaluateLifecycleStage', () => {
    it('should recommend promotion for strong performers', () => {
      const performance = createPerformance({
        clicks: 30,
        acos: 20.0,
        cvr: 12.0,
        lifecycleStage: 'Discovery',
      });
      const settings = createSettings({ clicksToPromote: 25, targetAcos: 30.0, cvrFactorMedian: 0.5 });

      const decision = evaluateLifecycleStage(performance, settings);

      expect(decision.action).toBe('promote');
      expect(decision.toStage).toBe('Test');
      expect(decision.confidence).toBeGreaterThanOrEqual(75);
      expect(decision.reason).toContain('Strong performance');
    });

    it('should recommend negation for poor performers', () => {
      const performance = createPerformance({
        clicks: 15,
        acos: 80.0,
        cvr: 2.0,
      });
      const settings = createSettings({ clicksToNegate: 10, targetAcos: 30.0 });

      const decision = evaluateLifecycleStage(performance, settings);

      expect(decision.action).toBe('negate');
      expect(decision.confidence).toBeGreaterThanOrEqual(80);
      expect(decision.reason).toContain('Poor performance');
    });

    it('should recommend pause for low CTR', () => {
      const performance = createPerformance({
        clicks: 10,
        ctr: 0.2,
      });
      const settings = createSettings({ ctrPauseThreshold: 0.3 });

      const decision = evaluateLifecycleStage(performance, settings);

      expect(decision.action).toBe('pause');
      expect(decision.reason).toContain('Low CTR');
    });

    it('should maintain stage when performance is acceptable', () => {
      const performance = createPerformance({
        clicks: 15,
        acos: 30.0,
        cvr: 10.0,
      });
      const settings = createSettings();

      const decision = evaluateLifecycleStage(performance, settings);

      expect(decision.action).toBe('maintain');
    });

    it('should not promote beyond SKAG stage', () => {
      const performance = createPerformance({
        clicks: 50,
        acos: 15.0,
        cvr: 15.0,
        lifecycleStage: 'SKAG',
      });
      const settings = createSettings();

      const decision = evaluateLifecycleStage(performance, settings);

      expect(decision.action).toBe('maintain');
      // SKAG is already at highest stage, no further promotion
    });
  });

  describe('calculateRAGStatus', () => {
    it('should return Green for good performance', () => {
      const performance = createPerformance({
        spend: 20.0,
        sales: 100.0,
        acos: 20.0,
        ctr: 0.6,
        cvr: 12.0,
        clicks: 20,
      });
      const settings = createSettings();

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Green');
      expect(drivers.length).toBeGreaterThan(0);
    });

    it('should return Amber for high wasted spend', () => {
      const performance = createPerformance({
        spend: 100.0,
        sales: 0,
        acos: 0,
        clicks: 20,
      });
      const settings = createSettings({ wastedSpendRedThreshold: 50.0 });

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Amber'); // Only one red indicator
      expect(drivers.some((d) => d.includes('wasted spend'))).toBe(true);
    });

    it('should return Amber for very high ACoS', () => {
      const performance = createPerformance({
        acos: 60.0,
        clicks: 20,
      });
      const settings = createSettings({ targetAcos: 30.0 });

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Amber'); // Only one red indicator
      expect(drivers.some((d) => d.includes('ACoS'))).toBe(true);
    });

    it('should return Green for moderately high ACoS with good other metrics', () => {
      const performance = createPerformance({
        acos: 38.0,
        ctr: 0.5,
        cvr: 10.0,
        clicks: 20,
      });
      const settings = createSettings({ targetAcos: 30.0 });

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Green'); // Amber drivers but not enough to change status
    });

    it('should return Amber for low CTR', () => {
      const performance = createPerformance({
        ctr: 0.2,
        clicks: 10,
        acos: 30.0,
      });
      const settings = createSettings({ targetCtr: 0.5 });

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Amber'); // Only one red indicator
      expect(drivers.some((d) => d.includes('CTR'))).toBe(true);
    });

    it('should return Amber for low CVR', () => {
      const performance = createPerformance({
        cvr: 3.0,
        clicks: 15,
        acos: 30.0,
        ctr: 0.5,
      });
      const settings = createSettings({ targetCvr: 10.0 });

      const { status, drivers } = calculateRAGStatus(performance, settings);

      expect(status).toBe('Amber'); // Only one red indicator
      expect(drivers.some((d) => d.includes('conversion'))).toBe(true);
    });
  });

  describe('shouldAutoPromote', () => {
    it('should return true when auto-promotion is enabled and confidence is high', () => {
      const performance = createPerformance({
        clicks: 30,
        acos: 20.0,
        cvr: 12.0,
        lifecycleStage: 'Discovery',
      });
      const settings = createSettings({ enableAutoPromotion: true });

      const result = shouldAutoPromote(performance, settings);

      expect(result).toBe(true);
    });

    it('should return false when auto-promotion is disabled', () => {
      const performance = createPerformance({
        clicks: 30,
        acos: 20.0,
        cvr: 12.0,
      });
      const settings = createSettings({ enableAutoPromotion: false });

      const result = shouldAutoPromote(performance, settings);

      expect(result).toBe(false);
    });
  });

  describe('shouldAutoNegate', () => {
    it('should return true when auto-negation is enabled and confidence is high', () => {
      const performance = createPerformance({
        clicks: 15,
        acos: 80.0,
        cvr: 2.0,
      });
      const settings = createSettings({ enableAutoNegation: true });

      const result = shouldAutoNegate(performance, settings);

      expect(result).toBe(true);
    });

    it('should return false when auto-negation is disabled', () => {
      const performance = createPerformance({
        clicks: 15,
        acos: 80.0,
        cvr: 2.0,
      });
      const settings = createSettings({ enableAutoNegation: false });

      const result = shouldAutoNegate(performance, settings);

      expect(result).toBe(false);
    });
  });

  describe('shouldAutoPause', () => {
    it('should return true when auto-pause is enabled and confidence is high', () => {
      const performance = createPerformance({
        clicks: 10,
        ctr: 0.2,
      });
      const settings = createSettings({ enableAutoPause: true });

      const result = shouldAutoPause(performance, settings);

      expect(result).toBe(true);
    });

    it('should return false when auto-pause is disabled', () => {
      const performance = createPerformance({
        clicks: 10,
        ctr: 0.2,
      });
      const settings = createSettings({ enableAutoPause: false });

      const result = shouldAutoPause(performance, settings);

      expect(result).toBe(false);
    });
  });

  describe('evaluateBatch', () => {
    it('should evaluate multiple keywords', () => {
      const performances = [
        createPerformance({ keywordId: 'kw-1', clicks: 30, acos: 20.0, cvr: 12.0 }),
        createPerformance({ keywordId: 'kw-2', clicks: 15, acos: 80.0, cvr: 2.0 }),
        createPerformance({ keywordId: 'kw-3', clicks: 5, ctr: 0.2 }),
      ];
      const settings = createSettings();

      const decisions = evaluateBatch(performances, settings);

      expect(decisions.size).toBe(3);
      expect(decisions.get('kw-1')?.action).toBe('promote');
      expect(decisions.get('kw-2')?.action).toBe('negate');
    });
  });

  describe('getKeywordsNeedingAttention', () => {
    it('should return keywords with Red or Amber status', () => {
      const performances = [
        createPerformance({ keywordId: 'kw-1', acos: 60.0, clicks: 20 }), // Amber (high ACoS)
        createPerformance({ keywordId: 'kw-2', acos: 20.0, clicks: 20, ctr: 0.6, cvr: 12.0 }), // Green
      ];
      const settings = createSettings();

      const needingAttention = getKeywordsNeedingAttention(performances, settings);

      expect(needingAttention.length).toBe(1);
      expect(needingAttention.map((k) => k.keywordId)).toContain('kw-1');
    });
  });

  describe('calculatePortfolioCVRMedian', () => {
    it('should calculate median CVR correctly', () => {
      const performances = [
        createPerformance({ cvr: 5.0, clicks: 15 }),
        createPerformance({ cvr: 10.0, clicks: 15 }),
        createPerformance({ cvr: 15.0, clicks: 15 }),
        createPerformance({ cvr: 20.0, clicks: 15 }),
        createPerformance({ cvr: 25.0, clicks: 15 }),
      ];

      const median = calculatePortfolioCVRMedian(performances);

      expect(median).toBe(15.0);
    });

    it('should ignore keywords with low clicks', () => {
      const performances = [
        createPerformance({ cvr: 5.0, clicks: 5 }), // Should be ignored
        createPerformance({ cvr: 10.0, clicks: 15 }),
        createPerformance({ cvr: 20.0, clicks: 15 }),
      ];

      const median = calculatePortfolioCVRMedian(performances);

      expect(median).toBe(15.0);
    });

    it('should return 0 for empty array', () => {
      const median = calculatePortfolioCVRMedian([]);

      expect(median).toBe(0);
    });
  });

  describe('getPromotionCandidates', () => {
    it('should return keywords ready for promotion', () => {
      const performances = [
        createPerformance({ keywordId: 'kw-1', clicks: 30, acos: 20.0, cvr: 12.0, lifecycleStage: 'Discovery' }),
        createPerformance({ keywordId: 'kw-2', clicks: 5, acos: 30.0, cvr: 10.0 }),
      ];
      const settings = createSettings();

      const candidates = getPromotionCandidates(performances, settings);

      expect(candidates.length).toBe(1);
      expect(candidates[0].keywordId).toBe('kw-1');
    });
  });

  describe('getNegationCandidates', () => {
    it('should return keywords that should be negated', () => {
      const performances = [
        createPerformance({ keywordId: 'kw-1', clicks: 15, acos: 80.0, cvr: 2.0 }),
        createPerformance({ keywordId: 'kw-2', clicks: 5, acos: 30.0, cvr: 10.0 }),
      ];
      const settings = createSettings();

      const candidates = getNegationCandidates(performances, settings);

      expect(candidates.length).toBe(1);
      expect(candidates[0].keywordId).toBe('kw-1');
    });
  });

  describe('getPauseCandidates', () => {
    it('should return keywords that should be paused', () => {
      const performances = [
        createPerformance({ keywordId: 'kw-1', clicks: 10, ctr: 0.2 }),
        createPerformance({ keywordId: 'kw-2', clicks: 10, ctr: 0.6 }),
      ];
      const settings = createSettings();

      const candidates = getPauseCandidates(performances, settings);

      expect(candidates.length).toBe(1);
      expect(candidates[0].keywordId).toBe('kw-1');
    });
  });
});
