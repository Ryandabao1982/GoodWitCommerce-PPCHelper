import { describe, it, expect } from 'vitest';
import {
  detectCannibalization,
  findSelfCannibalization,
  detectBroadMatchCannibalization,
} from '../../services/cannibalizationDetector';
import type { KeywordData, KeywordPerformance } from '../../types';

const buildKeyword = (overrides: Partial<KeywordData> = {}): KeywordData => ({
  id: undefined,
  keyword: 'base keyword',
  type: 'Broad',
  category: 'Core',
  searchVolume: '1000',
  competition: 'Low',
  relevance: 5,
  source: 'AI',
  ...overrides,
});

const buildPerformance = (overrides: Partial<KeywordPerformance> = {}): KeywordPerformance => ({
  id: 'perf-default',
  keywordId: 'kw-default',
  brandId: 'brand-1',
  impressions: 100,
  clicks: 10,
  spend: 10,
  sales: 40,
  orders: 4,
  ctr: 5.0,
  cvr: 40.0,
  cpc: 1.0,
  acos: 25.0,
  roas: 4.0,
  lifecycleStage: 'Discovery',
  ragStatus: 'Green',
  ragDrivers: [],
  opportunityScore: 50,
  lastUpdated: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('cannibalizationDetector', () => {
  it('detects cannibalization when performance falls back to keyword text', () => {
    const keywords: KeywordData[] = [
      buildKeyword({ id: 'kw-1', keyword: 'Test Keyword', type: 'Exact' }),
      buildKeyword({ keyword: 'Test Keyword', type: 'Broad' }),
    ];

    const performances: KeywordPerformance[] = [
      buildPerformance({
        id: 'perf-1',
        keywordId: 'kw-1',
        keyword: 'Test Keyword',
        impressions: 120,
        clicks: 12,
        spend: 30,
        sales: 150,
        ctr: 4.0,
        cvr: 35.0,
        acos: 20.0,
      }),
      buildPerformance({
        id: 'perf-2',
        keywordId: '',
        keyword: 'Test Keyword',
        impressions: 100,
        clicks: 10,
        spend: 40,
        sales: 140,
        ctr: 3.5,
        cvr: 30.0,
        acos: 30.0,
      }),
    ];

    const campaignAssignments = new Map<string, string>([
      ['kw-1', 'campaign-a'],
      ['Test Keyword', 'campaign-b'],
    ]);

    const results = detectCannibalization(performances, keywords, campaignAssignments);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      keyword1Id: 'kw-1',
      keyword2Id: 'Test Keyword',
      campaign1Id: 'campaign-a',
      campaign2Id: 'campaign-b',
    });
  });

  it('identifies self-cannibalization using keyword IDs or text identifiers', () => {
    const keywords: KeywordData[] = [
      buildKeyword({ id: 'kw-1', keyword: 'Alpha', type: 'Exact' }),
      buildKeyword({ keyword: 'Alpha', type: 'Exact' }),
    ];

    const campaignAssignments = new Map<string, string[]>([
      ['kw-1', ['Campaign 1']],
      ['Alpha', ['Campaign 2']],
    ]);

    const results = findSelfCannibalization(keywords, campaignAssignments);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      keyword1Id: 'kw-1',
      keyword2Id: 'Alpha',
      campaign1Id: 'Campaign 1',
      campaign2Id: 'Campaign 2',
    });
  });

  it('detects broad match cannibalization when performance data lacks IDs', () => {
    const keywords: KeywordData[] = [
      buildKeyword({ id: 'broad-1', keyword: 'running shoes', type: 'Broad' }),
      buildKeyword({ keyword: 'running shoes for men', type: 'Exact' }),
    ];

    const performances: KeywordPerformance[] = [
      buildPerformance({
        id: 'perf-broad',
        keywordId: 'broad-1',
        keyword: 'running shoes',
        impressions: 1000,
        clicks: 50,
        spend: 200,
        sales: 300,
        ctr: 0.3,
        cvr: 10.0,
        acos: 66.0,
      }),
      buildPerformance({
        id: 'perf-specific',
        keywordId: '',
        keyword: 'running shoes for men',
        impressions: 200,
        clicks: 30,
        spend: 80,
        sales: 250,
        ctr: 0.8,
        cvr: 15.0,
        acos: 32.0,
      }),
    ];

    const results = detectBroadMatchCannibalization(keywords, performances);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      keyword1Id: 'broad-1',
      keyword2Id: 'running shoes for men',
    });
  });
});
