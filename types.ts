export type KeywordType = 'Broad' | 'Phrase' | 'Exact' | 'Long-tail';
export type MatchType = 'Broad' | 'Phrase' | 'Exact';
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

export interface BidModifiers {
  topOfSearch?: number; // Percentage modifier for top of search placement
  productPages?: number; // Percentage modifier for product pages
}

export interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
  defaultBid?: number; // Default bid for keywords in this ad group
  defaultMatchType?: MatchType; // Default match type for keywords
  bidModifiers?: BidModifiers; // Bid modifiers for different placements
  budget?: number; // Budget allocated to this ad group
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
  dailyBudget?: number; // Daily budget for the campaign
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
  // price?: number; // Removed: not exposed in modal
  // targetAcos?: number; // Removed: not exposed in modal
}

// ASIN Management Types
export interface ASIN {
  id: string;
  asin: string;
  title: string;
  sku?: string;
  imageUrl?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
}

export interface ASINToCampaignMap {
  asinId: string;
  campaignIds: string[];
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
  asins?: ASIN[];
  asinToCampaignMaps?: ASINToCampaignMap[];
}

// Lifecycle Management Types

export interface KeywordPerformance {
  id: string;
  keywordId: string;
  brandId: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  ctr: number;
  cvr: number;
  cpc: number;
  acos: number;
  roas: number;
  lifecycleStage: LifecycleStage;
  ragStatus: RAGStatus;
  ragDrivers: string[];
  opportunityScore: number;
  intent?: string;
  currentBid?: number;
  suggestedBid?: number;
  cpcMax?: number;
  lastUpdated: string;
  createdAt: string;
}

export type LifecycleEventType = 'promoted' | 'negated' | 'paused' | 'activated' | 'bid_changed' | 'stage_changed';

export interface LifecycleEvent {
  id: string;
  keywordId: string;
  brandId: string;
  eventType: LifecycleEventType;
  fromStage?: LifecycleStage;
  toStage?: LifecycleStage;
  reason: string;
  automated: boolean;
  metadata?: Record<string, any>;
  occurredAt: string;
}

export interface NegativeKeyword {
  id: string;
  brandId: string;
  campaignId?: string;
  keyword: string;
  matchType: 'Negative Exact' | 'Negative Phrase';
  source: 'manual' | 'automated' | 'cannibalization';
  originalKeywordId?: string;
  reason: string;
  status: 'active' | 'removed';
  createdAt: string;
  removedAt?: string;
}

export interface CannibalizationAlert {
  id: string;
  brandId: string;
  keyword1Id: string;
  keyword2Id: string;
  campaign1Id?: string;
  campaign2Id?: string;
  cannibalizationScore: number;
  reason: string;
  suggestedAction: string;
  status: 'active' | 'resolved' | 'ignored';
  resolvedAction?: string;
  detectedAt: string;
  resolvedAt?: string;
}

export type ImportSource = 'cerebro' | 'magnet' | 'amazon_str' | 'manual';

export interface KeywordImport {
  id: string;
  brandId: string;
  source: ImportSource;
  filename?: string;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  rawData?: any;
  errors?: any;
  status: 'processing' | 'completed' | 'failed';
  importedAt: string;
  completedAt?: string;
}

export interface BrandSettings {
  id: string;
  brandId: string;
  clicksToPromote: number;
  clicksToNegate: number;
  ctrPauseThreshold: number;
  cvrFactorMedian: number;
  wastedSpendRedThreshold: number;
  targetAcos: number;
  productPrice?: number;
  isCompetitiveCategory: boolean;
  targetRoas: number;
  targetCtr: number;
  targetCvr: number;
  enableAutoPromotion: boolean;
  enableAutoNegation: boolean;
  enableAutoPause: boolean;
  enableCannibalizationDetection: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordCampaignAssignment {
  id: string;
  keywordId: string;
  campaignId: string;
  adGroupId?: string;
  matchType: MatchType;
  bid?: number;
  isRecommended: boolean;
  recommendationScore: number;
  recommendationReason?: string;
  status: 'pending' | 'assigned' | 'removed';
  recommendedAt: string;
  assignedAt?: string;
  removedAt?: string;
}

// Rules Engine Types
export interface LifecycleDecision {
  action: 'promote' | 'negate' | 'pause' | 'maintain';
  toStage?: LifecycleStage;
  reason: string;
  confidence: number; // 0-100
}

export interface BidAdvisory {
  currentBid?: number;
  suggestedBid: number;
  cpcMax: number;
  reasoning: string;
  expectedImpact: string;
}

export interface CampaignRecommendation {
  campaignId: string;
  campaignName: string;
  score: number;
  reason: string;
  suggestedAdGroup?: string;
  suggestedBid?: number;
  suggestedMatchType?: MatchType;
}

// Parser Types
export interface CerebroRow {
  keyword: string;
  searchVolume: number;
  competingProducts: number;
  cpr: number; // Cerebro Product Rank
  position: number;
}

export interface MagnetRow {
  keyword: string;
  searchVolume: number;
  magnetIQScore: number;
}

export interface AmazonSTRRow {
  customerSearchTerm: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  totalSpend: number;
  totalSales: number;
  acos: number;
  conversionRate: number;
}

export interface ParsedKeywordData {
  keyword: string;
  searchVolume?: number | string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  spend?: number;
  sales?: number;
  acos?: number;
  cvr?: number;
  source: ImportSource;
  metadata?: Record<string, any>;
}