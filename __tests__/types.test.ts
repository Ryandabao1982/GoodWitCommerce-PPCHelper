import { describe, it, expect } from 'vitest';
import type {
  PortfolioType,
  Portfolio,
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

describe('Type Definitions - Brand Tab Types', () => {
  describe('PortfolioType', () => {
    it('should accept valid portfolio types', () => {
      const validTypes: PortfolioType[] = ['Launch', 'Optimize', 'Scale', 'Maintain'];
      expect(validTypes).toHaveLength(4);
      expect(validTypes).toContain('Launch');
      expect(validTypes).toContain('Optimize');
      expect(validTypes).toContain('Scale');
      expect(validTypes).toContain('Maintain');
    });
  });

  describe('Portfolio', () => {
    it('should create valid portfolio object', () => {
      const portfolio: Portfolio = {
        id: 'test-id',
        name: 'Launch',
        budget: 1000,
        campaigns: ['campaign1', 'campaign2'],
      };

      expect(portfolio.id).toBe('test-id');
      expect(portfolio.name).toBe('Launch');
      expect(portfolio.budget).toBe(1000);
      expect(portfolio.campaigns).toHaveLength(2);
    });

    it('should handle empty campaigns array', () => {
      const portfolio: Portfolio = {
        id: 'empty-portfolio',
        name: 'Optimize',
        budget: 5000,
        campaigns: [],
      };

      expect(portfolio.campaigns).toHaveLength(0);
    });

    it('should handle zero budget', () => {
      const portfolio: Portfolio = {
        id: 'zero-budget',
        name: 'Maintain',
        budget: 0,
        campaigns: [],
      };

      expect(portfolio.budget).toBe(0);
    });

    it('should handle large budget values', () => {
      const portfolio: Portfolio = {
        id: 'large-budget',
        name: 'Scale',
        budget: 999999999,
        campaigns: [],
      };

      expect(portfolio.budget).toBe(999999999);
    });
  });

  describe('LifecycleStage', () => {
    it('should accept valid lifecycle stages', () => {
      const validStages: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
      expect(validStages).toHaveLength(5);
      expect(validStages).toContain('Discovery');
      expect(validStages).toContain('Test');
      expect(validStages).toContain('Performance');
      expect(validStages).toContain('SKAG');
      expect(validStages).toContain('Archived');
    });
  });

  describe('RAGStatus', () => {
    it('should accept valid RAG status values', () => {
      const validStatuses: RAGStatus[] = ['Red', 'Amber', 'Green'];
      expect(validStatuses).toHaveLength(3);
      expect(validStatuses).toContain('Red');
      expect(validStatuses).toContain('Amber');
      expect(validStatuses).toContain('Green');
    });
  });

  describe('RAGBadge', () => {
    it('should create valid RAG badge with Green status', () => {
      const badge: RAGBadge = {
        status: 'Green',
        drivers: ['Good performance', 'Within targets'],
      };

      expect(badge.status).toBe('Green');
      expect(badge.drivers).toHaveLength(2);
    });

    it('should create valid RAG badge with Red status', () => {
      const badge: RAGBadge = {
        status: 'Red',
        drivers: ['High ACOS', 'Low CTR'],
      };

      expect(badge.status).toBe('Red');
      expect(badge.drivers).toContain('High ACOS');
    });

    it('should handle empty drivers array', () => {
      const badge: RAGBadge = {
        status: 'Amber',
        drivers: [],
      };

      expect(badge.drivers).toHaveLength(0);
    });

    it('should handle multiple drivers', () => {
      const badge: RAGBadge = {
        status: 'Red',
        drivers: ['High ACOS', 'Low CTR', 'Low CVR', 'High CPC', 'Wasted spend'],
      };

      expect(badge.drivers).toHaveLength(5);
    });
  });

  describe('KPIMetrics', () => {
    it('should create valid KPI metrics object', () => {
      const metrics: KPIMetrics = {
        spend: 1000,
        sales: 5000,
        acos: 20,
        roas: 5,
        ctr: 1.5,
        cvr: 10,
        tacos: 15,
      };

      expect(metrics.spend).toBe(1000);
      expect(metrics.sales).toBe(5000);
      expect(metrics.acos).toBe(20);
      expect(metrics.roas).toBe(5);
      expect(metrics.ctr).toBe(1.5);
      expect(metrics.cvr).toBe(10);
      expect(metrics.tacos).toBe(15);
    });

    it('should handle zero values', () => {
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
      expect(metrics.roas).toBe(0);
    });

    it('should handle decimal values', () => {
      const metrics: KPIMetrics = {
        spend: 123.45,
        sales: 678.90,
        acos: 12.34,
        roas: 5.67,
        ctr: 1.23,
        cvr: 8.90,
        tacos: 10.11,
      };

      expect(metrics.spend).toBeCloseTo(123.45);
      expect(metrics.ctr).toBeCloseTo(1.23);
    });

    it('should handle very large values', () => {
      const metrics: KPIMetrics = {
        spend: 9999999,
        sales: 99999999,
        acos: 999,
        roas: 999,
        ctr: 100,
        cvr: 100,
        tacos: 999,
      };

      expect(metrics.spend).toBe(9999999);
      expect(metrics.sales).toBe(99999999);
    });
  });

  describe('RolloutPhase', () => {
    it('should accept valid rollout phases', () => {
      const validPhases: RolloutPhase[] = [1, 2, 3, 4, 5];
      expect(validPhases).toHaveLength(5);
      expect(validPhases).toContain(1);
      expect(validPhases).toContain(5);
    });
  });

  describe('RolloutTask', () => {
    it('should create valid rollout task', () => {
      const task: RolloutTask = {
        phase: 1,
        description: 'Setup campaign structure',
        completed: false,
      };

      expect(task.phase).toBe(1);
      expect(task.description).toBe('Setup campaign structure');
      expect(task.completed).toBe(false);
    });

    it('should handle completed tasks', () => {
      const task: RolloutTask = {
        phase: 3,
        description: 'Test keywords',
        completed: true,
      };

      expect(task.completed).toBe(true);
    });

    it('should handle all phases', () => {
      const tasks: RolloutTask[] = [
        { phase: 1, description: 'Phase 1', completed: true },
        { phase: 2, description: 'Phase 2', completed: true },
        { phase: 3, description: 'Phase 3', completed: false },
        { phase: 4, description: 'Phase 4', completed: false },
        { phase: 5, description: 'Phase 5', completed: false },
      ];

      expect(tasks).toHaveLength(5);
      expect(tasks[0].phase).toBe(1);
      expect(tasks[4].phase).toBe(5);
    });
  });

  describe('CoverageCell', () => {
    it('should create valid coverage cell', () => {
      const cell: CoverageCell = {
        campaignType: 'Exact',
        asin: 'B001234567',
        hasCoverage: true,
        hasOverlap: false,
      };

      expect(cell.campaignType).toBe('Exact');
      expect(cell.asin).toBe('B001234567');
      expect(cell.hasCoverage).toBe(true);
      expect(cell.hasOverlap).toBe(false);
    });

    it('should handle coverage with overlap', () => {
      const cell: CoverageCell = {
        campaignType: 'Broad',
        asin: 'B009876543',
        hasCoverage: true,
        hasOverlap: true,
      };

      expect(cell.hasCoverage).toBe(true);
      expect(cell.hasOverlap).toBe(true);
    });

    it('should handle no coverage', () => {
      const cell: CoverageCell = {
        campaignType: 'Phrase',
        asin: 'B005555555',
        hasCoverage: false,
        hasOverlap: false,
      };

      expect(cell.hasCoverage).toBe(false);
    });
  });

  describe('KeywordHealth', () => {
    it('should create valid keyword health object', () => {
      const health: KeywordHealth = {
        keyword: 'wireless headphones',
        oppScore: 85,
        intent: 'Commercial',
        category: 'Core',
        lifecycle: 'Performance',
        acos: 20,
        cvr: 10,
        cpc: 1.5,
        cpcMax: 2.0,
        spend: 100,
        sales: 500,
        rag: 'Green',
      };

      expect(health.keyword).toBe('wireless headphones');
      expect(health.oppScore).toBe(85);
      expect(health.lifecycle).toBe('Performance');
      expect(health.rag).toBe('Green');
    });

    it('should handle different lifecycle stages', () => {
      const lifecycles: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
      
      lifecycles.forEach((stage) => {
        const health: KeywordHealth = {
          keyword: 'test',
          oppScore: 50,
          intent: 'Test',
          category: 'Test',
          lifecycle: stage,
          acos: 25,
          cvr: 5,
          cpc: 1.0,
          cpcMax: 1.5,
          spend: 50,
          sales: 200,
          rag: 'Amber',
        };

        expect(health.lifecycle).toBe(stage);
      });
    });

    it('should handle different RAG statuses', () => {
      const statuses: RAGStatus[] = ['Red', 'Amber', 'Green'];
      
      statuses.forEach((status) => {
        const health: KeywordHealth = {
          keyword: 'test',
          oppScore: 50,
          intent: 'Test',
          category: 'Test',
          lifecycle: 'Test',
          acos: 25,
          cvr: 5,
          cpc: 1.0,
          cpcMax: 1.5,
          spend: 50,
          sales: 200,
          rag: status,
        };

        expect(health.rag).toBe(status);
      });
    });

    it('should handle edge case values', () => {
      const health: KeywordHealth = {
        keyword: '',
        oppScore: 0,
        intent: '',
        category: '',
        lifecycle: 'Discovery',
        acos: 0,
        cvr: 0,
        cpc: 0,
        cpcMax: 0,
        spend: 0,
        sales: 0,
        rag: 'Red',
      };

      expect(health.oppScore).toBe(0);
      expect(health.spend).toBe(0);
    });
  });

  describe('BrandTabSettings', () => {
    it('should create valid settings object', () => {
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

    it('should handle optional price and targetAcos', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 20,
        clicksToNegate: 15,
        ctrPauseThreshold: 0.2,
        cvrFactorMedian: 0.8,
        wastedSpendRedThreshold: 500,
        isCompetitiveCategory: true,
        price: 49.99,
        targetAcos: 25,
      };

      expect(settings.price).toBe(49.99);
      expect(settings.targetAcos).toBe(25);
    });

    it('should handle missing optional fields', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 30,
        clicksToNegate: 20,
        ctrPauseThreshold: 0.3,
        cvrFactorMedian: 0.9,
        wastedSpendRedThreshold: 1000,
        isCompetitiveCategory: false,
      };

      expect(settings.price).toBeUndefined();
      expect(settings.targetAcos).toBeUndefined();
    });

    it('should handle decimal threshold values', () => {
      const settings: BrandTabSettings = {
        clicksToPromote: 25,
        clicksToNegate: 18,
        ctrPauseThreshold: 0.123,
        cvrFactorMedian: 0.789,
        wastedSpendRedThreshold: 750,
        isCompetitiveCategory: true,
      };

      expect(settings.ctrPauseThreshold).toBeCloseTo(0.123);
      expect(settings.cvrFactorMedian).toBeCloseTo(0.789);
    });
  });

  describe('BrandState - Extended Properties', () => {
    it('should create valid brand state with all optional fields', () => {
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
          { id: 'p1', name: 'Launch', budget: 1000, campaigns: [] },
        ],
        brandTabSettings: {
          clicksToPromote: 20,
          clicksToNegate: 15,
          ctrPauseThreshold: 0.2,
          cvrFactorMedian: 0.8,
          wastedSpendRedThreshold: 500,
          isCompetitiveCategory: false,
        },
        kpiMetrics: {
          spend: 1000,
          sales: 5000,
          acos: 20,
          roas: 5,
          ctr: 1.5,
          cvr: 10,
          tacos: 15,
        },
        ragBadge: {
          status: 'Green',
          drivers: ['All good'],
        },
        keywordHealthData: [],
        rolloutTasks: [],
      };

      expect(brandState.portfolios).toHaveLength(1);
      expect(brandState.kpiMetrics?.spend).toBe(1000);
      expect(brandState.ragBadge?.status).toBe('Green');
    });

    it('should handle brand state with minimal fields', () => {
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
      };

      expect(brandState.portfolios).toBeUndefined();
      expect(brandState.kpiMetrics).toBeUndefined();
      expect(brandState.ragBadge).toBeUndefined();
    });

    it('should handle brand state with keyword health data', () => {
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
            oppScore: 80,
            intent: 'Commercial',
            category: 'Core',
            lifecycle: 'Performance',
            acos: 20,
            cvr: 10,
            cpc: 1.5,
            cpcMax: 2.0,
            spend: 100,
            sales: 500,
            rag: 'Green',
          },
        ],
      };

      expect(brandState.keywordHealthData).toHaveLength(1);
      expect(brandState.keywordHealthData?.[0].keyword).toBe('test');
    });

    it('should handle brand state with rollout tasks', () => {
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
          { phase: 1, description: 'Setup', completed: true },
          { phase: 2, description: 'Test', completed: false },
        ],
      };

      expect(brandState.rolloutTasks).toHaveLength(2);
      expect(brandState.rolloutTasks?.[0].completed).toBe(true);
    });

    it('should handle brand state with multiple portfolios', () => {
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
          { id: 'launch', name: 'Launch', budget: 1000, campaigns: [] },
          { id: 'optimize', name: 'Optimize', budget: 2000, campaigns: [] },
          { id: 'scale', name: 'Scale', budget: 5000, campaigns: [] },
          { id: 'maintain', name: 'Maintain', budget: 3000, campaigns: [] },
        ],
      };

      expect(brandState.portfolios).toHaveLength(4);
      expect(brandState.portfolios?.map(p => p.name)).toEqual(['Launch', 'Optimize', 'Scale', 'Maintain']);
    });
  });

  describe('Type Safety and Validation', () => {
    it('should ensure portfolio names are type-safe', () => {
      const portfolioTypes: PortfolioType[] = ['Launch', 'Optimize', 'Scale', 'Maintain'];
      
      portfolioTypes.forEach((type) => {
        const portfolio: Portfolio = {
          id: `${type}-id`,
          name: type,
          budget: 1000,
          campaigns: [],
        };
        
        expect(portfolio.name).toBe(type);
      });
    });

    it('should ensure lifecycle stages are type-safe', () => {
      const stages: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
      
      stages.forEach((stage) => {
        const health: KeywordHealth = {
          keyword: 'test',
          oppScore: 50,
          intent: 'Test',
          category: 'Test',
          lifecycle: stage,
          acos: 25,
          cvr: 5,
          cpc: 1.0,
          cpcMax: 1.5,
          spend: 50,
          sales: 200,
          rag: 'Green',
        };
        
        expect(health.lifecycle).toBe(stage);
      });
    });

    it('should ensure RAG statuses are type-safe', () => {
      const statuses: RAGStatus[] = ['Red', 'Amber', 'Green'];
      
      statuses.forEach((status) => {
        const badge: RAGBadge = {
          status: status,
          drivers: [],
        };
        
        expect(badge.status).toBe(status);
      });
    });

    it('should ensure rollout phases are type-safe', () => {
      const phases: RolloutPhase[] = [1, 2, 3, 4, 5];
      
      phases.forEach((phase) => {
        const task: RolloutTask = {
          phase: phase,
          description: `Phase ${phase}`,
          completed: false,
        };
        
        expect(task.phase).toBe(phase);
      });
    });
  });
});