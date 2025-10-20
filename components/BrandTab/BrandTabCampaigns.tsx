import React, { useState, useMemo } from 'react';
import { BrandState, Portfolio, Campaign } from '../../types';
import { EmptyStateCard } from '../EmptyState';

interface BrandTabCampaignsProps {
  brandState: BrandState;
  portfolios: Portfolio[];
}

type ViewMode = 'cards' | 'table' | 'list';
type SortField = 'name' | 'budget' | 'keywords' | 'adGroups';
type SortOrder = 'asc' | 'desc';

export const BrandTabCampaigns: React.FC<BrandTabCampaignsProps> = ({ brandState, portfolios }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const handleCreateShell = (type: string) => {
    alert(`Creating ${type} campaign template. This will create a new campaign structure optimized for this strategy.`);
  };

  const handleBulkExport = (type: 'promote' | 'negatives') => {
    const message = type === 'promote' 
      ? 'Exporting keywords that are ready to be promoted to exact match campaigns based on performance metrics.'
      : 'Exporting negative keyword recommendations based on low-performing search terms.';
    alert(message);
  };

  // Get campaigns with calculated metrics
  const campaignsWithMetrics = useMemo(() => {
    return brandState.campaigns.map(campaign => {
      const keywordCount = campaign.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0);
      const assignedBudget = campaign.dailyBudget || 0;
      const adGroupCount = campaign.adGroups.length;
      
      return {
        ...campaign,
        keywordCount,
        assignedBudget,
        adGroupCount,
      };
    });
  }, [brandState.campaigns]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaignsWithMetrics;

    // Filter by portfolio
    if (selectedPortfolio) {
      const portfolio = portfolios.find(p => p.id === selectedPortfolio);
      if (portfolio) {
        filtered = filtered.filter(c => portfolio.campaigns.includes(c.id));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.asin?.toLowerCase().includes(query) ||
        c.adGroups.some(ag => ag.name.toLowerCase().includes(query))
      );
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'budget':
          comparison = a.assignedBudget - b.assignedBudget;
          break;
        case 'keywords':
          comparison = a.keywordCount - b.keywordCount;
          break;
        case 'adGroups':
          comparison = a.adGroupCount - b.adGroupCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [campaignsWithMetrics, selectedPortfolio, searchQuery, sortField, sortOrder, portfolios]);

  const toggleCampaignExpand = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    return portfolios.map(portfolio => {
      const campaigns = brandState.campaigns.filter(c => portfolio.campaigns.includes(c.id));
      const totalKeywords = campaigns.reduce((sum, c) => 
        sum + c.adGroups.reduce((s, ag) => s + ag.keywords.length, 0), 0
      );
      const totalAdGroups = campaigns.reduce((sum, c) => sum + c.adGroups.length, 0);
      const allocatedBudget = campaigns.reduce((sum, c) => sum + (c.dailyBudget || 0), 0);
      
      return {
        ...portfolio,
        campaignCount: campaigns.length,
        totalKeywords,
        totalAdGroups,
        allocatedBudget,
        budgetUtilization: portfolio.budget > 0 ? (allocatedBudget / portfolio.budget) * 100 : 0,
      };
    });
  }, [portfolios, brandState.campaigns]);

  // Suggestions based on campaign data
  const suggestions = useMemo(() => {
    const items: string[] = [];
    
    // Check for campaigns without keywords
    const emptyCampaigns = brandState.campaigns.filter(c => 
      c.adGroups.every(ag => ag.keywords.length === 0)
    );
    if (emptyCampaigns.length > 0) {
      items.push(`${emptyCampaigns.length} campaign(s) have no keywords assigned`);
    }

    // Check for campaigns without budget
    const noBudgetCampaigns = brandState.campaigns.filter(c => !c.dailyBudget || c.dailyBudget === 0);
    if (noBudgetCampaigns.length > 0) {
      items.push(`${noBudgetCampaigns.length} campaign(s) need budget allocation`);
    }

    // Check for portfolios with low utilization
    portfolioStats.forEach(p => {
      if (p.budgetUtilization < 50 && p.campaignCount > 0) {
        items.push(`${p.name} portfolio is underutilized (${p.budgetUtilization.toFixed(0)}% budget used)`);
      }
    });

    // Check for missing campaign types
    const hasExactMatch = brandState.campaigns.some(c => c.name.toLowerCase().includes('exact'));
    const hasBroad = brandState.campaigns.some(c => c.name.toLowerCase().includes('broad'));
    const hasAuto = brandState.campaigns.some(c => c.name.toLowerCase().includes('auto'));
    
    if (!hasExactMatch) items.push('Consider creating an Exact Match campaign for high-performing keywords');
    if (!hasBroad) items.push('Consider creating a Broad Match campaign for discovery');
    if (!hasAuto) items.push('Consider creating an Auto campaign for keyword discovery');

    return items;
  }, [brandState.campaigns, portfolioStats]);

  return (
    <div className="space-y-6">
      {/* Speed Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⚡ Speed Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => handleCreateShell('SP_EXACT_PERF')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            title="Create Sponsored Product Exact Match Performance campaign"
          >
            + SP_EXACT_PERF
          </button>
          <button
            onClick={() => handleCreateShell('SP_EXACT_SKAG')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            title="Create Sponsored Product Exact Match Single Keyword Ad Group campaign"
          >
            + SP_EXACT_SKAG
          </button>
          <button
            onClick={() => handleCreateShell('SP_PT_AUTO')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            title="Create Sponsored Product Product Targeting Auto campaign"
          >
            + SP_PT_AUTO
          </button>
          <button
            onClick={() => handleCreateShell('SP_BROAD')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            title="Create Sponsored Product Broad Match campaign"
          >
            + SP_BROAD
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBulkExport('promote')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            title="Export high-performing keywords for promotion to exact match"
          >
            📥 Export Promote-to-Exact.csv
          </button>
          <button
            onClick={() => handleBulkExport('negatives')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            title="Export negative keyword recommendations"
          >
            📥 Export Negatives.csv
          </button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Suggestions ({suggestions.length})
          </h3>
          <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1">
            {suggestions.map((suggestion, idx) => (
              <li key={idx}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Portfolio Stats Overview */}
      {portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map(portfolio => (
          <div 
            key={portfolio.id} 
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${
              selectedPortfolio === portfolio.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            } p-4`}
            onClick={() => setSelectedPortfolio(selectedPortfolio === portfolio.id ? null : portfolio.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-900 dark:text-white">{portfolio.name}</h4>
              {selectedPortfolio === portfolio.id && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Campaigns:</span>
                <span className="font-semibold">{portfolio.campaignCount}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Keywords:</span>
                <span className="font-semibold">{portfolio.totalKeywords}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Budget:</span>
                <span className="font-semibold">${portfolio.budget.toLocaleString()}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Utilization</span>
                  <span>{portfolio.budgetUtilization.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      portfolio.budgetUtilization >= 80 ? 'bg-green-500' :
                      portfolio.budgetUtilization >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(portfolio.budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <EmptyStateCard
          icon="📁"
          title="No Portfolios Created"
          description="Portfolios help you organize campaigns by strategy (Launch, Optimize, Scale, Maintain). Create portfolios to better manage your campaign budgets and goals."
        />
      )}

      {/* Campaign Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="search"
              placeholder="Search campaigns, ASINs, ad groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex-1 md:flex-none px-3 py-2 rounded transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title="Card view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 md:flex-none px-3 py-2 rounded transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title="Table view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none px-3 py-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Campaign Display */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-medium">No campaigns found</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'Try adjusting your search or filter' : 'Create your first campaign to get started'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCampaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{campaign.name}</h4>
                        {campaign.asin && (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-mono">
                            {campaign.asin}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleCampaignExpand(campaign.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform ${expandedCampaigns.has(campaign.id) ? 'rotate-180' : ''}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          ${campaign.assignedBudget.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ad Groups</div>
                        <div className="text-sm font-semibold">{campaign.adGroupCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Keywords</div>
                        <div className="text-sm font-semibold">{campaign.keywordCount}</div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {campaign.keywordCount === 0 && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                          ⚠️ No Keywords
                        </span>
                      )}
                      {campaign.assignedBudget === 0 && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                          ⚠️ No Budget
                        </span>
                      )}
                      {campaign.keywordCount > 0 && campaign.assignedBudget > 0 && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                          ✓ Ready
                        </span>
                      )}
                    </div>

                    {expandedCampaigns.has(campaign.id) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ad Groups</h5>
                        <div className="space-y-2">
                          {campaign.adGroups.map(adGroup => (
                            <div key={adGroup.id} className="text-sm bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">{adGroup.name}</span>
                                <span className="text-xs text-gray-500">{adGroup.keywords.length} keywords</span>
                              </div>
                              {adGroup.defaultBid && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Bid: ${adGroup.defaultBid.toFixed(2)} • {adGroup.defaultMatchType || 'Broad'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('name')}
                      >
                        Campaign {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('budget')}
                      >
                        Budget {sortField === 'budget' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('adGroups')}
                      >
                        Ad Groups {sortField === 'adGroups' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-center font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('keywords')}
                      >
                        Keywords {sortField === 'keywords' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCampaigns.map(campaign => (
                      <tr 
                        key={campaign.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => toggleCampaignExpand(campaign.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.asin && (
                            <div className="text-xs text-gray-500 font-mono">{campaign.asin}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                          ${campaign.assignedBudget.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">{campaign.adGroupCount}</td>
                        <td className="px-4 py-3 text-center">{campaign.keywordCount}</td>
                        <td className="px-4 py-3 text-center">
                          {campaign.keywordCount > 0 && campaign.assignedBudget > 0 ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                              Ready
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                              Incomplete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredCampaigns.map(campaign => (
                  <div 
                    key={campaign.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => toggleCampaignExpand(campaign.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>${campaign.assignedBudget.toFixed(2)}</span>
                        <span>{campaign.adGroupCount} ad groups</span>
                        <span>{campaign.keywordCount} keywords</span>
                        {campaign.asin && <span className="font-mono">{campaign.asin}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.keywordCount > 0 && campaign.assignedBudget > 0 ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                          Ready
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                          Incomplete
                        </span>
                      )}
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedCampaigns.has(campaign.id) ? 'rotate-180' : ''}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
