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

// Brand/Session state
export interface BrandState {
  keywordResults: KeywordData[];
  searchedKeywords: string[];
  advancedSearchSettings: AdvancedSearchSettings;
  keywordClusters?: Record<string, string[]> | null;
  campaigns: Campaign[];
}