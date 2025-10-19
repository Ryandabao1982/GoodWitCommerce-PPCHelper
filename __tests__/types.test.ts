import { describe, it, expect } from 'vitest';
import type {
  Portfolio,
  PortfolioType,
  LifecycleStage,
  RAGStatus,
  RAGBadge,
  KPIMetrics,
  RolloutPhase,
  RolloutTask,
  CoverageCell,
  KeywordHealth,
  BrandTabSettings,
  BrandState,
} from '../types';

describe('Type Definitions for Brand Tab', () => {
  describe('Portfolio Types', () => {
    it('should create a valid Portfolio object with Launch type', () => {
      const portfolio: Portfolio = {
        id: 'launch-1',
        name: 'Launch',
        budget: 1000,
        campaigns: ['camp1', 'camp2'],
      };

      expect(portfolio.id).toBe('launch-1');
      expect(portfolio.name).toBe('Launch');
      expect(portfolio.budget).toBe(1000);
      expect(portfolio.campaigns).toHaveLength(2);
    });

    it('should create portfolios with all PortfolioType values', () => {
      const types: PortfolioType[] = ['Launch', 'Optimize', 'Scale', 'Maintain'];
      
      types.forEach(type => {
        const portfolio: Portfolio = {
          id: `${type}-1`,
          name: type,
          budget: 1000,
          campaigns: [],
        };
        
        expect(portfolio.name).toBe(type);
      });
    });

    it('should handle portfolio with zero budget', () => {
      const portfolio: Portfolio = {
        id: 'test',
        name: 'Launch',
        budget: 0,
        campaigns: [],
      };

      expect(portfolio.budget).toBe(0);
    });

    it('should handle portfolio with empty campaigns array', () => {
      const portfolio: Portfolio = {
        id: 'test',
        name: 'Optimize',
        budget: 5000,
        campaigns: [],
      };

      expect(portfolio.campaigns).toHaveLength(0);
    });

    it('should handle portfolio with multiple campaigns', () => {
      const campaigns = ['c1', 'c2', 'c3', 'c4', 'c5'];
      const portfolio: Portfolio = {
        id: 'test',
        name: 'Scale',
        budget: 10000,
        campaigns,
      };

      expect(portfolio.campaigns).toHaveLength(5);
    });
  });

  describe('Lifecycle Stage Types', () => {
    it('should accept all valid lifecycle stages', () => {
      const stages: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
      
      stages.forEach(stage => {
        expect(stage).toBeTruthy();
      });
    });
  });

  describe('RAG Status Types', () => {
    it('should create valid RAGBadge with Red status', () => {
      const badge: RAGBadge = {
        status: 'Red',
        drivers: ['High ACOS', 'Low conversion rate'],
      };

      expect(badge.status).toBe('Red');
      expect(badge.drivers).toHaveLength(2);
    });

    it('should create valid RAGBadge with Amber status', () => {
      const badge: RAGBadge = {
        status: 'Amber',
        drivers: ['ACOS trending up'],
      };

      expect(badge.status).toBe('Amber');
      expect(badge.drivers).toHaveLength(1);
    });

    it('should create valid RAGBadge with Green status', () => {
      const badge: RAGBadge = {
        status: 'Green',
        drivers: ['All metrics within target'],
      };

      expect(badge.status).toBe('Green');
      expect(badge.drivers).toHaveLength(1);
    });

    it('should handle RAGBadge with empty drivers array', () => {
      const badge: RAGBadge = {
        status: 'Green',
        drivers: [],
      };

      expect(badge.drivers).toHaveLength(0);
    });

    it('should handle RAGBadge with multiple drivers', () => {
      const badge: RAGBadge = {
        status: 'Red',
        drivers: [
          'ACOS above target',
          'CPC too high',
          'Low click-through rate',
          'Poor conversion rate',
        ],
      };

      expect(badge.drivers).toHaveLength(4);
    });
  });

  describe('KPI Metrics Types', () => {
    it('should create valid KPIMetrics object', () => {
      const metrics: KPIMetrics = {
        spend: 1500.50,
        sales: 5000.75,
        acos: 30.5,
        roas: 3.28,
        ctr: 1.25,
        cvr: 0.85,
        tacos: 25.0,
      };

      expect(metrics.spend).toBe(1500.50);
      expect(metrics.sales).toBe(5000.75);
      expect(metrics.acos).toBe(30.5);
      expect(metrics.roas).toBe(3.28);
    });

    it('should handle zero values in KPIMetrics', () => {
      const metrics: KPIMetrics = {
        spend: 0,
        sales: 0,
        acos: 0,
        roas: 0,
        ctr: 0,
        cvr: 0,
        tacos: 0,
      };

      expect(metrics.spend).toBe(0);
      expect(metrics.sales).toBe(0);
    });

    it('should handle very large numbers in KPIMetrics', () => {
      const metrics: KPIMetrics = {
        spend: 999999.99,
        sales: 9999999.99,
        acos: 100,
        roas: 10,
        ctr: 50,
        cvr: 25,
        tacos: 100,
      };

      expect(metrics.spend).toBeGreaterThan(999999);
      expect(metrics.sales).toBeGreaterThan(9999999);
    });

    it('should handle decimal precision', () => {
      const metrics: KPIMetrics = {
        spend: 1234.56,
        sales: 4567.89,
        acos: 27.03,
        roas: 3.70,
        ctr: 1.23,
        cvr: 0.45,
        tacos: 22.15,
      };

      expect(metrics.acos).toBeCloseTo(27.03, 2);
      expect(metrics.roas).toBeCloseTo(3.70, 2);
    });
  });

  describe('Rollout Task Types', () => {
    it('should create valid RolloutTask for each phase', () => {
      const phases: RolloutPhase[] = [1, 2, 3, 4, 5];
      
      phases.forEach(phase => {
        const task: RolloutTask = {
          phase,
          description: `Phase ${phase} task`,
          completed: false,
        };
        
        expect(task.phase).toBe(phase);
        expect(task.completed).toBe(false);
      });
    });

    it('should handle completed rollout tasks', () => {
      const task: RolloutTask = {
        phase: 1,
        description: 'Setup initial campaigns',
        completed: true,
      };

      expect(task.completed).toBe(true);
    });

    it('should handle incomplete rollout tasks', () => {
      const task: RolloutTask = {
        phase: 5,
        description: 'Final optimization',
        completed: false,
      };

      expect(task.completed).toBe(false);
    });
  });

  describe('Coverage Cell Types', () => {
    it('should create valid CoverageCell with coverage', () => {
      const cell: CoverageCell = {
        campaignType: 'Sponsored Products',
        asin: 'B07ABC1234',
        hasCoverage: true,
        hasOverlap: false,
      };

      expect(cell.hasCoverage).toBe(true);
      expect(cell.hasOverlap).toBe(false);
    });

    it('should create valid CoverageCell with overlap', () => {
      const cell: CoverageCell = {
        campaignType: 'Sponsored Brands',
        asin: 'B07XYZ5678',
        hasCoverage: true,
        hasOverlap: true,
      };

      expect(cell.hasCoverage).toBe(true);
      expect(cell.hasOverlap).toBe(true);
    });

    it('should create valid CoverageCell without coverage', () => {
      const cell: CoverageCell = {
        campaignType: 'Sponsored Display',
        asin: 'B07DEF9012',
        hasCoverage: false,
        hasOverlap: false,
      };

      expect(cell.hasCoverage).toBe(false);
      expect(cell.hasOverlap).toBe(false);
    });
  });

  describe('Keyword Health Types', () => {
    it('should create valid KeywordHealth object', () => {
      const health: KeywordHealth = {
        keyword: 'wireless headphones',
        oppScore: 85,
        intent: 'Purchase',
        category: 'Electronics',
        lifecycle: 'Performance',
        acos: 25.5,
        cvr: 1.2,
        cpc: 0.75,
        cpcMax: 1.50,
        spend: 150.00,
        sales: 588.24,
        rag: 'Green',
      };

      expect(health.keyword).toBe('wireless headphones');
      expect(health.oppScore).toBe(85);
      expect(health.lifecycle).toBe('Performance');
      expect(health.rag).toBe('Green');
    });

    it('should handle low opportunity score keywords', () => {
      const health: KeywordHealth = {
        keyword: 'low performer',
        oppScore: 15,
        intent: 'Research',
        category: 'Test',
        lifecycle: 'Discovery',
        acos: 80,
        cvr: 0.1,
        cpc: 2.00,
        cpcMax: 2.50,
        spend: 100,
        sales: 125,
        rag: 'Red',
      };

      expect(health.oppScore).toBeLessThan(20);
      expect(health.rag).toBe('Red');
    });

    it('should handle all lifecycle stages in KeywordHealth', () => {
      const stages: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
      
      stages.forEach(stage => {
        const health: KeywordHealth = {
          keyword: `keyword-${stage}`,
          oppScore: 50,
          intent: 'Purchase',
          category: 'Test',
          lifecycle: stage,
          acos: 30,
          cvr: 1.0,
          cpc: 1.00,
          cpcMax: 2.00,
          spend: 100,
          sales: 333,
          rag: 'Amber',
        };
        
        expect(health.lifecycle).toBe(stage);
      });
    });

    it('should handle all RAG statuses in KeywordHealth', () => {
      const ragStatuses: RAGStatus[] = ['Red', 'Amber', 'Green'];
      
      ragStatuses.forEach(rag => {
        const health: KeywordHealth = {
          keyword: `keyword-${rag}`,
          oppScore: 50,
          intent: 'Purchase',
          category: 'Test',
          lifecycle: 'Test',
          acos: 30,
          cvr: 1.0,
          cpc: 1.00,
          cpcMax: 2.00,
          spend: 100,
          sales: 333,
          rag,
        };
        
        expect(health.rag).toBe(rag);
      });
    });
  });

  describe('Brand Tab Settings Types', () => {
    it('should create valid BrandTabSettings with required fields', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 20,
        clicksToNegate: 15,
        ctrPauseThreshold: 0.2,
        cvrFactorMedian: 0.8,
        wastedSpendRedThreshold: 500,
        isCompetitiveCategory: false,
      };

      expect(settings.clicksToPromote).toBe(20);
      expect(settings.clicksToNegate).toBe(15);
      expect(settings.isCompetitiveCategory).toBe(false);
    });

    it('should create valid BrandTabSettings with optional fields', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 30,
        clicksToNegate: 25,
        ctrPauseThreshold: 0.3,
        cvrFactorMedian: 0.9,
        wastedSpendRedThreshold: 1000,
        isCompetitiveCategory: true,
        price: 29.99,
        targetAcos: 25.0,
      };

      expect(settings.price).toBe(29.99);
      expect(settings.targetAcos).toBe(25.0);
    });

    it('should handle competitive category settings', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 40,
        clicksToNegate: 30,
        ctrPauseThreshold: 0.15,
        cvrFactorMedian: 0.7,
        wastedSpendRedThreshold: 2000,
        isCompetitiveCategory: true,
      };

      expect(settings.isCompetitiveCategory).toBe(true);
      expect(settings.ctrPauseThreshold).toBeLessThan(0.2);
    });

    it('should handle non-competitive category settings', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 15,
        clicksToNegate: 10,
        ctrPauseThreshold: 0.25,
        cvrFactorMedian: 0.85,
        wastedSpendRedThreshold: 300,
        isCompetitiveCategory: false,
      };

      expect(settings.isCompetitiveCategory).toBe(false);
    });
  });

  describe('BrandState Extended Properties', () => {
    it('should create BrandState with new optional portfolio properties', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        portfolios: [
          { id: '1', name: 'Launch', budget: 1000, campaigns: [] },
        ],
      };

      expect(brandState.portfolios).toBeDefined();
      expect(brandState.portfolios).toHaveLength(1);
    });

    it('should create BrandState with brandTabSettings', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        brandTabSettings: {
          clicksToPromote: 20,
          clicksToNegate: 15,
          ctrPauseThreshold: 0.2,
          cvrFactorMedian: 0.8,
          wastedSpendRedThreshold: 500,
          isCompetitiveCategory: false,
        },
      };

      expect(brandState.brandTabSettings).toBeDefined();
      expect(brandState.brandTabSettings?.clicksToPromote).toBe(20);
    });

    it('should create BrandState with kpiMetrics', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        kpiMetrics: {
          spend: 1500,
          sales: 5000,
          acos: 30,
          roas: 3.33,
          ctr: 1.2,
          cvr: 0.8,
          tacos: 25,
        },
      };

      expect(brandState.kpiMetrics).toBeDefined();
      expect(brandState.kpiMetrics?.spend).toBe(1500);
    });

    it('should create BrandState with ragBadge', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        ragBadge: {
          status: 'Green',
          drivers: ['Metrics within target'],
        },
      };

      expect(brandState.ragBadge).toBeDefined();
      expect(brandState.ragBadge?.status).toBe('Green');
    });

    it('should create BrandState with keywordHealthData', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        keywordHealthData: [
          {
            keyword: 'test',
            oppScore: 75,
            intent: 'Purchase',
            category: 'Core',
            lifecycle: 'Performance',
            acos: 28,
            cvr: 1.1,
            cpc: 0.85,
            cpcMax: 1.50,
            spend: 200,
            sales: 714,
            rag: 'Green',
          },
        ],
      };

      expect(brandState.keywordHealthData).toBeDefined();
      expect(brandState.keywordHealthData).toHaveLength(1);
    });

    it('should create BrandState with rolloutTasks', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: '',
        },
        keywordClusters: null,
        campaigns: [],
        rolloutTasks: [
          { phase: 1, description: 'Phase 1', completed: true },
          { phase: 2, description: 'Phase 2', completed: false },
        ],
      };

      expect(brandState.rolloutTasks).toBeDefined();
      expect(brandState.rolloutTasks).toHaveLength(2);
    });

    it('should create complete BrandState with all new optional properties', () => {
      const brandState: BrandState = {
        keywordResults: [],
        searchedKeywords: [],
        advancedSearchSettings: {
          advancedKeywords: '',
          minVolume: '',
          maxVolume: '',
          isWebAnalysisEnabled: false,
          brandName: 'Test Brand',
        },
        keywordClusters: null,
        campaigns: [],
        portfolios: [
          { id: 'l1', name: 'Launch', budget: 1000, campaigns: [] },
          { id: 'o1', name: 'Optimize', budget: 2000, campaigns: [] },
          { id: 's1', name: 'Scale', budget: 5000, campaigns: [] },
          { id: 'm1', name: 'Maintain', budget: 3000, campaigns: [] },
        ],
        brandTabSettings: {
          clicksToPromote: 20,
          clicksToNegate: 15,
          ctrPauseThreshold: 0.2,
          cvrFactorMedian: 0.8,
          wastedSpendRedThreshold: 500,
          isCompetitiveCategory: false,
          price: 29.99,
          targetAcos: 25,
        },
        kpiMetrics: {
          spend: 2500,
          sales: 8333,
          acos: 30,
          roas: 3.33,
          ctr: 1.5,
          cvr: 1.0,
          tacos: 25,
        },
        ragBadge: {
          status: 'Green',
          drivers: ['All metrics on target', 'Consistent performance'],
        },
        keywordHealthData: [
          {
            keyword: 'test keyword',
            oppScore: 80,
            intent: 'Purchase',
            category: 'Core',
            lifecycle: 'Performance',
            acos: 28,
            cvr: 1.2,
            cpc: 0.90,
            cpcMax: 1.50,
            spend: 250,
            sales: 893,
            rag: 'Green',
          },
        ],
        rolloutTasks: [
          { phase: 1, description: 'Initial setup', completed: true },
          { phase: 2, description: 'Expand keywords', completed: true },
          { phase: 3, description: 'Optimize bids', completed: false },
          { phase: 4, description: 'Scale campaigns', completed: false },
          { phase: 5, description: 'Full automation', completed: false },
        ],
      };

      expect(brandState.portfolios).toHaveLength(4);
      expect(brandState.brandTabSettings).toBeDefined();
      expect(brandState.kpiMetrics).toBeDefined();
      expect(brandState.ragBadge).toBeDefined();
      expect(brandState.keywordHealthData).toHaveLength(1);
      expect(brandState.rolloutTasks).toHaveLength(5);
    });
  });
});