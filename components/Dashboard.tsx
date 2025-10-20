import React, { useState, useMemo } from 'react';
import { KeywordData, BrandState } from '../types';

interface DashboardProps {
  data: KeywordData[];
  parseVolume: (volume: string) => number;
  brands?: string[];
  activeBrand?: string | null;
  brandStates?: Record<string, BrandState>;
  onSelectBrand?: (brand: string) => void;
  onCreateBrand?: () => void;
  recentSearches?: string[];
  lastActiveBrand?: string | null;
}

type SortField = 'keyword' | 'type' | 'category' | 'searchVolume' | 'competition' | 'relevance' | 'source';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'Exact' | 'Phrase' | 'Broad' | 'Long-tail';
type FilterCompetition = 'all' | 'Low' | 'Medium' | 'High';

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  parseVolume,
  brands = [],
  activeBrand = null,
  brandStates = {},
  onSelectBrand,
  onCreateBrand,
  recentSearches = [],
  lastActiveBrand = null,
}) => {
  const [sortField, setSortField] = useState<SortField>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCompetition, setFilterCompetition] = useState<FilterCompetition>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    // First apply filters
    let filtered = [...data];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    // Apply competition filter
    if (filterCompetition !== 'all') {
      filtered = filtered.filter(item => item.competition === filterCompetition);
    }
    
    // Apply search filter
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(item => 
        item.keyword.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    }
    
    // Then sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'keyword':
          comparison = a.keyword.localeCompare(b.keyword);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'searchVolume':
          comparison = parseVolume(a.searchVolume) - parseVolume(b.searchVolume);
          break;
        case 'competition':
          const compOrder = { Low: 1, Medium: 2, High: 3 };
          comparison = compOrder[a.competition] - compOrder[b.competition];
          break;
        case 'relevance':
          comparison = a.relevance - b.relevance;
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [data, sortField, sortDirection, parseVolume, filterType, filterCompetition, searchFilter]);

  const getBadgeColor = (type: string, value: string) => {
    if (type === 'competition') {
      switch (value) {
        case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      }
    }
    if (type === 'source') {
      return value === 'AI' 
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Calculate statistics for the dashboard sections
  const stats = useMemo(() => {
    const totalKeywords = data.length;
    const avgRelevance = totalKeywords > 0 
      ? (data.reduce((sum, kw) => sum + kw.relevance, 0) / totalKeywords).toFixed(1)
      : '0';
    const highVolumeCount = data.filter(kw => parseVolume(kw.searchVolume) > 10000).length;
    const lowCompetitionCount = data.filter(kw => kw.competition === 'Low').length;
    const exactMatchCount = data.filter(kw => kw.type === 'Exact').length;
    const phraseMatchCount = data.filter(kw => kw.type === 'Phrase').length;
    const broadMatchCount = data.filter(kw => kw.type === 'Broad').length;

    return {
      totalKeywords,
      avgRelevance,
      highVolumeCount,
      lowCompetitionCount,
      exactMatchCount,
      phraseMatchCount,
      broadMatchCount,
    };
  }, [data, parseVolume]);

  // Calculate global statistics across all brands
  const globalStats = useMemo(() => {
    const totalBrands = brands.length;
    let totalKeywords = 0;
    let totalCampaigns = 0;
    let totalSearches = 0;
    
    brands.forEach(brand => {
      const brandState = brandStates[brand];
      if (brandState) {
        totalKeywords += brandState.keywordResults?.length || 0;
        totalCampaigns += brandState.campaigns?.length || 0;
        totalSearches += brandState.searchedKeywords?.length || 0;
      }
    });

    return {
      totalBrands,
      totalKeywords,
      totalCampaigns,
      totalSearches,
    };
  }, [brands, brandStates]);

  // Get recent activity across all brands
  const recentActivity = useMemo(() => {
    const activities: Array<{
      brand: string;
      action: string;
      detail: string;
      time: string;
    }> = [];

    brands.forEach(brand => {
      const brandState = brandStates[brand];
      if (brandState) {
        // Add recent searches
        brandState.searchedKeywords?.slice(-3).forEach(keyword => {
          activities.push({
            brand,
            action: 'Searched',
            detail: keyword,
            time: 'Recent'
          });
        });
        
        // Add campaigns
        brandState.campaigns?.slice(-2).forEach(campaign => {
          activities.push({
            brand,
            action: 'Created Campaign',
            detail: campaign.name,
            time: 'Recent'
          });
        });
      }
    });

    return activities.slice(-5); // Return last 5 activities
  }, [brands, brandStates]);

  // Landing page view (when no brand selected)
  const showLandingPage = !activeBrand;
  
  if (showLandingPage) {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 md:p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {lastActiveBrand ? (
                <>Welcome back to {lastActiveBrand}! 👋</>
              ) : (
                <>Welcome to Amazon PPC Keyword Genius! 🚀</>
              )}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {lastActiveBrand
                ? `You were last working on ${lastActiveBrand}. Select a brand to continue or create a new one.`
                : "Get started by creating your first brand workspace to organize your keyword research and campaigns."}
            </p>
            {!activeBrand && onCreateBrand && (
              <button
                onClick={onCreateBrand}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Brand
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics */}
        {brands.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{globalStats.totalBrands}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Brands</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{globalStats.totalKeywords}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Keywords</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{globalStats.totalCampaigns}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Campaigns</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{globalStats.totalSearches}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Searches</div>
                </div>
              </div>
            </div>

            {/* Brands Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏢 Your Brands</h2>
                {onCreateBrand && (
                  <button
                    onClick={onCreateBrand}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Brand
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map(brand => {
                  const brandState = brandStates[brand];
                  const keywordCount = brandState?.keywordResults?.length || 0;
                  const campaignCount = brandState?.campaigns?.length || 0;
                  const searchCount = brandState?.searchedKeywords?.length || 0;
                  const isActive = brand === activeBrand;
                  
                  return (
                    <div
                      key={brand}
                      onClick={() => onSelectBrand?.(brand)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{brand}</h3>
                        {isActive && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Active</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Keywords:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{keywordCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Campaigns:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{campaignCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Searches:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{searchCount}</span>
                        </div>
                      </div>
                      {keywordCount === 0 && campaignCount === 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            No activity yet - start searching!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🕒 Recent Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">{activity.brand}</span>
                            <span className="text-gray-500 dark:text-gray-400">·</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                            {activity.detail}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h2>
                <div className="space-y-3">
                  {activeBrand && (
                    <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900 dark:text-blue-300">🔍 Start Keyword Research</div>
                      <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">Enter seed keywords to generate suggestions</div>
                    </button>
                  )}
                  {onCreateBrand && (
                    <button 
                      onClick={onCreateBrand}
                      className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-green-900 dark:text-green-300">➕ Create New Brand</div>
                      <div className="text-sm text-green-700 dark:text-green-400 mt-1">Set up a new brand workspace</div>
                    </button>
                  )}
                  <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                    <div className="font-medium text-purple-900 dark:text-purple-300">📋 View All Keywords</div>
                    <div className="text-sm text-purple-700 dark:text-purple-400 mt-1">Browse your keyword bank</div>
                  </button>
                  <button className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors">
                    <div className="font-medium text-orange-900 dark:text-orange-300">🎯 Manage Campaigns</div>
                    <div className="text-sm text-orange-700 dark:text-orange-400 mt-1">Plan and organize your campaigns</div>
                  </button>
                </div>
              </div>

              {/* Tips & Suggestions */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💡 Tips & Suggestions</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Start with broad seed keywords to discover more opportunities
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Focus on keywords with relevance scores of 7+ for best results
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Use the clustering feature to organize keywords by theme
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Export your campaigns to CSV for easy upload to Amazon
                    </p>
                  </div>
                  {recentSearches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Searches:</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.slice(-3).map((search, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-white dark:bg-gray-800 text-xs rounded-full border border-blue-200 dark:border-blue-700 text-gray-700 dark:text-gray-300"
                          >
                            {search}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Keywords</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalKeywords}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">↗ Research data</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Relevance</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.avgRelevance.toFixed(1)}/10</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.avgRelevance >= 7 ? '✓ Excellent' : stats.avgRelevance >= 5 ? '◐ Good' : '⚠ Needs work'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400">High Volume</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.highVolumeCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.totalKeywords > 0 ? `${Math.round((stats.highVolumeCount / stats.totalKeywords) * 100)}% of total` : 'No data'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400">Low Competition</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.lowCompetitionCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.totalKeywords > 0 ? `${Math.round((stats.lowCompetitionCount / stats.totalKeywords) * 100)}% sweet spot` : 'No data'}
          </div>
        </div>
      </div>

      {/* AI Insights & Suggestions */}
      {stats.totalKeywords > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-md p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🤖</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Insights & Recommendations</h3>
              <div className="space-y-2">
                {stats.lowCompetitionCount > 0 && stats.highVolumeCount > 0 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 <strong>Great opportunity!</strong> You have {stats.lowCompetitionCount} low-competition keywords with {stats.highVolumeCount} high-volume terms. Consider prioritizing these in your campaigns.
                  </p>
                )}
                {parseFloat(stats.avgRelevance) < 5 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    ⚠️ <strong>Action needed:</strong> Your average relevance score is below 5. Try refining your seed keywords for better-targeted results.
                  </p>
                )}
                {stats.exactMatchCount < stats.totalKeywords * 0.3 && stats.totalKeywords > 10 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💭 <strong>Tip:</strong> Only {Math.round((stats.exactMatchCount / stats.totalKeywords) * 100)}% are exact match. Consider adding more exact match keywords for better conversion rates.
                  </p>
                )}
                {stats.totalKeywords < 20 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📊 <strong>Expand research:</strong> You have {stats.totalKeywords} keywords. Try searching for related terms to build a more comprehensive keyword bank.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Type Distribution Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Match Type Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">Exact</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.exactMatchCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {stats.totalKeywords > 0 ? Math.round((stats.exactMatchCount / stats.totalKeywords) * 100) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">Phrase</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.phraseMatchCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {stats.totalKeywords > 0 ? Math.round((stats.phraseMatchCount / stats.totalKeywords) * 100) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">Broad</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.broadMatchCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {stats.totalKeywords > 0 ? Math.round((stats.broadMatchCount / stats.totalKeywords) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Keyword Research Results</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {sortedData.length !== data.length ? (
                  <>Showing {sortedData.length} of {data.length} keywords</>
                ) : (
                  <>Detailed view of all discovered keywords</>
                )}
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="Exact">Exact</option>
                <option value="Phrase">Phrase</option>
                <option value="Broad">Broad</option>
                <option value="Long-tail">Long-tail</option>
              </select>
              <select
                value={filterCompetition}
                onChange={(e) => setFilterCompetition(e.target.value as FilterCompetition)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Competition</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(filterType !== 'all' || filterCompetition !== 'all' || searchFilter) && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
              {filterType !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Type: {filterType}
                  <button
                    type="button"
                    aria-label="Remove type filter"
                    title="Remove type filter"
                    onClick={() => setFilterType('all')}
                    className="ml-1 hover:text-blue-600"
                  >×</button>
                </span>
              )}
              {filterCompetition !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  Competition: {filterCompetition}
                  <button
                    type="button"
                    aria-label="Remove competition filter"
                    title="Remove competition filter"
                    onClick={() => setFilterCompetition('all')}
                    className="ml-1 hover:text-green-600"
                  >×</button>
                </span>
              )}
              {searchFilter && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                  Search: "{searchFilter}"
                  <button
                    type="button"
                    aria-label="Remove search filter"
                    title="Remove search filter"
                    onClick={() => setSearchFilter('')}
                    className="ml-1 hover:text-purple-600"
                  >×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterCompetition('all');
                  setSearchFilter('');
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

      {/* Mobile Card View - visible on small screens */}
      <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {sortedData.map((item, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="font-medium text-gray-900 dark:text-white mb-2">{item.keyword}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('type', item.type)}`}>
                  {item.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Volume:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{item.searchVolume}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Competition:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('competition', item.competition)}`}>
                  {item.competition}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Relevance:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{item.relevance}/10</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('category', item.category)}`}>
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                onClick={() => handleSort('keyword')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Keyword <SortIcon field="keyword" />
              </th>
              <th
                onClick={() => handleSort('type')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Type <SortIcon field="type" />
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Category <SortIcon field="category" />
              </th>
              <th
                onClick={() => handleSort('searchVolume')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Volume <SortIcon field="searchVolume" />
              </th>
              <th
                onClick={() => handleSort('competition')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Competition <SortIcon field="competition" />
              </th>
              <th
                onClick={() => handleSort('relevance')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Relevance <SortIcon field="relevance" />
              </th>
              <th
                onClick={() => handleSort('source')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Source <SortIcon field="source" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('type', item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('category', item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item.searchVolume}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('competition', item.competition)}`}>
                    {item.competition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.relevance * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item.relevance}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('source', item.source)}`}>
                    {item.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Efficiency Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
          💡 Research Tips
          {sortedData.length !== data.length && (
            <span className="ml-2 text-xs font-normal text-blue-700 dark:text-blue-400">
              ({sortedData.length} keywords match your filters)
            </span>
          )}
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Click column headers to sort by different metrics</li>
          <li>• Use filters above to narrow down results by type or competition</li>
          <li>• Focus on keywords with high relevance (7+) and low-medium competition</li>
          <li>• Use the Keyword Bank tab to organize and assign keywords to campaigns</li>
          <li>• High volume keywords (&gt;10K) are great for brand awareness</li>
          {stats.lowCompetitionCount > 0 && stats.highVolumeCount > 0 && (
            <li className="font-medium">• ⭐ Start with {stats.lowCompetitionCount} low-competition keywords for quick wins!</li>
          )}
        </ul>
      </div>
    </div>
  );
};
