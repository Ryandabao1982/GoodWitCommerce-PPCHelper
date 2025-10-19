export type KeywordType = 'Broad' | 'Phrase' | 'Exact' | 'Long-tail';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';
export type KeywordCategory = 'Core' | 'Opportunity' | 'Branded' | 'Low-hanging Fruit' | 'Complementary';
export type KeywordSource = 'AI' | 'Web';

export type BadgeType = KeywordType | CompetitionLevel | KeywordCategory | KeywordSource | 'New';

export interface KeywordData {
  keyword: string;
  type: KeywordType;
  category: KeywordCategory;
  searchVolume: string;
  competition: CompetitionLevel;
  relevance: number; // 1-10
  source: KeywordSource;
}

export interface KeywordDeepDiveData {
  adCopyAngles: string[];
  bidStrategy: string;
  negativeKeywords: string[];
}

export interface AdvancedSearchSettings {
  advancedKeywords: string;
  minVolume: string;
  maxVolume: string;
  isWebAnalysisEnabled: boolean;
  brandName: string;
}

export interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
}

export interface CampaignProjections {
  suggestedAdGroupBudgets: Record<string, number>;
  estimatedClicks: number;
  estimatedCpc: number;
  performanceSummary: string;
}

export interface Campaign {
  id: string;
  name: string;
  adGroups: AdGroup[];
  totalBudget?: number;
  projections?: CampaignProjections | null;
}

// API Configuration Settings
export interface ApiSettings {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Portfolio types for Brand Tab
export type PortfolioType = 'Launch' | 'Optimize' | 'Scale' | 'Maintain';

export interface Portfolio {
  id: string;
  name: PortfolioType;
  budget: number;
  campaigns: string[]; // Campaign IDs
}

// Lifecycle stages for keywords
export type LifecycleStage = 'Discovery' | 'Test' | 'Performance' | 'SKAG' | 'Archived';

// RAG status
export type RAGStatus = 'Red' | 'Amber' | 'Green';

export interface RAGBadge {
  status: RAGStatus;
  drivers: string[];
}

// KPI Metrics
export interface KPIMetrics {
  spend: number;
  sales: number;
  acos: number;
  roas: number;
  ctr: number;
  cvr: number;
  tacos: number;
}

// Rollout phases
export type RolloutPhase = 1 | 2 | 3 | 4 | 5;

export interface RolloutTask {
  phase: RolloutPhase;
  description: string;
  completed: boolean;
}

// Coverage map
export interface CoverageCell {
  campaignType: string;
  asin: string;
  hasCoverage: boolean;
  hasOverlap: boolean;
}

// Keyword health data
export interface KeywordHealth {
  keyword: string;
  oppScore: number;
  intent: string;
  category: string;
  lifecycle: LifecycleStage;
  acos: number;
  cvr: number;
  cpc: number;
  cpcMax: number;
  spend: number;
  sales: number;
  rag: RAGStatus;
}

// Brand Tab settings
export interface BrandTabSettings {
  clicksToPromote: number;
  clicksToNegate: number;
  ctrPauseThreshold: number;
  cvrFactorMedian: number;
  wastedSpendRedThreshold: number;
  isCompetitiveCategory: boolean;
}

// Brand/Session state
export interface BrandState {
  keywordResults: KeywordData[];
  searchedKeywords: string[];
  advancedSearchSettings: AdvancedSearchSettings;
  keywordClusters?: Record<string, string[]> | null;
  campaigns: Campaign[];
  portfolios?: Portfolio[];
  brandTabSettings?: BrandTabSettings;
  kpiMetrics?: KPIMetrics;
  ragBadge?: RAGBadge;
  keywordHealthData?: KeywordHealth[];
  rolloutTasks?: RolloutTask[];
}