export type KeywordType = 'Broad' | 'Phrase' | 'Exact' | 'Long-tail';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';
export type KeywordCategory = 'Core' | 'Opportunity' | 'Branded' | 'Low-hanging Fruit' | 'Complementary' | 'Brand' | 'Competitor' | 'Generic' | 'ProductCore';
export type KeywordSource = 'AI' | 'Web';
export type KeywordIntent = 'High' | 'Mid' | 'Low';
export type PriorityTier = 'Core' | 'Mid' | 'LongTail';
export type Seasonality = 'Rising' | 'Stable' | 'Declining' | 'Seasonal';
export type LifecycleStage = 'L' | 'O' | 'S' | 'M'; // Launch, Optimize, Scale, Maintain
export type Priority = 'High' | 'Medium' | 'Low';
export type LifecycleState = 'Discovery' | 'Test' | 'Performance' | 'SKAG' | 'Archived';
export type CampaignType = 'SP' | 'SB' | 'SD';
export type TargetingType = 'AUTO' | 'BROAD' | 'PHRASE' | 'EXACT' | 'PT';
export type CampaignTheme = 'BRANDED' | 'COMP' | 'GENERIC' | 'CATEGORY' | 'RESEARCH' | 'PERFORMANCE' | 'CROSSSELL' | 'VIDEO' | 'REMARKETING';
export type Portfolio = 'Launch' | 'Optimize' | 'Scale' | 'Maintain';
export type MatchType = 'BROAD' | 'PHRASE' | 'EXACT';
export type NegativeMatchType = 'NEG_BROAD' | 'NEG_PHRASE' | 'NEG_EXACT' | 'ASIN';
export type AlertLevel = 'GREEN' | 'AMBER' | 'RED';
export type KeywordAction = 'Promote' | 'Negate' | 'Reassign' | 'BidUp' | 'BidDown' | 'PlacementChange';

export type BadgeType = KeywordType | CompetitionLevel | KeywordCategory | KeywordSource | 'New';

export interface KeywordData {
  keyword: string;
  type: KeywordType;
  category: KeywordCategory;
  searchVolume: string;
  competition: CompetitionLevel;
  relevance: number; // 1-10
  source: KeywordSource;
  normalized?: string;
  intent?: KeywordIntent;
  priorityTier?: PriorityTier;
  seasonality?: Seasonality;
  notes?: string;
}

// Product types
export interface Product {
  id: string;
  brandId: string;
  asin: string;
  title: string;
  price: number;
  lifecycleStage: LifecycleStage;
  priority: Priority;
  inventoryDays?: number;
  cpcMax?: number;
  metadata?: Record<string, any>;
}

// Keyword Metrics
export interface KeywordMetricsDaily {
  id: string;
  keywordId: string;
  productId?: string;
  date: string;
  impressions: number;
  clicks: number;
  cpc?: number;
  spend: number;
  orders: number;
  sales: number;
  acos?: number;
  roas?: number;
  cvr?: number;
}

// Keyword Discovery
export interface KeywordDiscovery {
  id: string;
  keywordId: string;
  sv?: number; // Search volume
  iqScore?: number;
  competingProducts?: number;
  h10BidMin?: number;
  h10BidMax?: number;
  source?: string;
  oppScore?: number;
  metadata?: Record<string, any>;
}

// Keyword Lifecycle
export interface KeywordLifecycle {
  id: string;
  keywordId: string;
  state: LifecycleState;
  stateSince: string;
  lastDecision?: string;
  decisionReason?: string;
}

// Keyword Assignment
export interface KeywordAssignment {
  id: string;
  keywordId: string;
  campaignId: string;
  adGroup: string;
  matchType: MatchType;
  bid?: number;
  placementTos?: number;
  placementPp?: number;
  createdAt: string;
}

// Negative Keyword
export interface Negative {
  id: string;
  brandId: string;
  appliedToCampaignId?: string;
  scope: 'Campaign' | 'AdGroup';
  matchType: NegativeMatchType;
  term: string;
  reason?: string;
  ruleTrigger?: string;
  createdAt: string;
}

// Alert
export interface Alert {
  id: string;
  brandId: string;
  entityType: 'Keyword' | 'Campaign';
  entityId: string;
  level: AlertLevel;
  title: string;
  message?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Keyword Action Log
export interface KeywordActionLog {
  id: string;
  keywordId: string;
  action: KeywordAction;
  before?: Record<string, any>;
  after?: Record<string, any>;
  reason?: string;
  actor: string;
  createdAt: string;
}

// Settings Thresholds
export interface SettingsThresholds {
  brandId: string;
  clicksPromoteStandard: number;
  clicksNegateStandard: number;
  clicksPromoteCompetitive: number;
  clicksNegateCompetitive: number;
  cvrGraduationFactor: number;
  ctrPauseThreshold: number;
  wastedSpendRed: number;
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
  type?: CampaignType;
  targeting?: TargetingType;
  theme?: CampaignTheme;
  portfolio?: Portfolio;
  dailyBudget?: number;
  phase?: number; // 1-5
}

// API Configuration Settings
export interface ApiSettings {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Brand/Session state
export interface BrandState {
  keywordResults: KeywordData[];
  searchedKeywords: string[];
  advancedSearchSettings: AdvancedSearchSettings;
  keywordClusters?: Record<string, string[]> | null;
  campaigns: Campaign[];
}