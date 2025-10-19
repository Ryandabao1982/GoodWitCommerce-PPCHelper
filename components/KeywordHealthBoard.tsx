/**
 * Keyword Health Board Component
 * 
 * Displays keyword health metrics with RAG status, lifecycle stages,
 * and actionable insights.
 */

import React, { useState, useMemo } from 'react';
import type { KeywordPerformance, LifecycleStage, RAGStatus } from '../types';

interface KeywordHealthBoardProps {
  performances: KeywordPerformance[];
  onKeywordClick?: (keywordId: string) => void;
  onTakeAction?: (keywordId: string, action: string) => void;
}

export const KeywordHealthBoard: React.FC<KeywordHealthBoardProps> = ({
  performances,
  onKeywordClick,
  onTakeAction,
}) => {
  const [filterStage, setFilterStage] = useState<LifecycleStage | 'all'>('all');
  const [filterRAG, setFilterRAG] = useState<RAGStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'opportunityScore' | 'spend' | 'acos'>('opportunityScore');

  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    let filtered = [...performances];

    // Apply stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter((k) => k.lifecycleStage === filterStage);
    }

    // Apply RAG filter
    if (filterRAG !== 'all') {
      filtered = filtered.filter((k) => k.ragStatus === filterRAG);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'opportunityScore':
          return b.opportunityScore - a.opportunityScore;
        case 'spend':
          return b.spend - a.spend;
        case 'acos':
          return b.acos - a.acos;
        default:
          return 0;
      }
    });

    return filtered;
  }, [performances, filterStage, filterRAG, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: performances.length,
      red: performances.filter((k) => k.ragStatus === 'Red').length,
      amber: performances.filter((k) => k.ragStatus === 'Amber').length,
      green: performances.filter((k) => k.ragStatus === 'Green').length,
      totalSpend: performances.reduce((sum, k) => sum + k.spend, 0),
      totalSales: performances.reduce((sum, k) => sum + k.sales, 0),
      avgOpportunityScore:
        performances.reduce((sum, k) => sum + k.opportunityScore, 0) / performances.length || 0,
    };
  }, [performances]);

  const getRAGColor = (status: RAGStatus): string => {
    switch (status) {
      case 'Red':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Green':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStageColor = (stage: LifecycleStage): string => {
    switch (stage) {
      case 'Discovery':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Test':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Performance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'SKAG':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Keyword Health Board
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor keyword performance and lifecycle stages
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Keywords</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-red-600 dark:text-red-400">Red Status</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.red}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Amber Status</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.amber}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Green Status</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.green}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Stage Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lifecycle Stage
          </label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as LifecycleStage | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Stages</option>
            <option value="Discovery">Discovery</option>
            <option value="Test">Test</option>
            <option value="Performance">Performance</option>
            <option value="SKAG">SKAG</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* RAG Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            RAG Status
          </label>
          <select
            value={filterRAG}
            onChange={(e) => setFilterRAG(e.target.value as RAGStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="Red">Red</option>
            <option value="Amber">Amber</option>
            <option value="Green">Green</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'opportunityScore' | 'spend' | 'acos')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="opportunityScore">Opportunity Score</option>
            <option value="spend">Spend</option>
            <option value="acos">ACoS</option>
          </select>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Keyword
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                RAG
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Stage
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Opp. Score
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Spend
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                ACoS
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                CVR
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No keywords match the selected filters
                </td>
              </tr>
            ) : (
              filteredKeywords.map((kw) => (
                <tr
                  key={kw.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => onKeywordClick && onKeywordClick(kw.keywordId)}
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                    {kw.keywordId}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRAGColor(kw.ragStatus)}`}>
                      {kw.ragStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStageColor(kw.lifecycleStage)}`}>
                      {kw.lifecycleStage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                    {kw.opportunityScore}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                    ${kw.spend.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                    {kw.acos.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                    {kw.cvr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTakeAction && onTakeAction(kw.keywordId, 'view_details');
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Showing count */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {filteredKeywords.length} of {performances.length} keywords
      </div>
    </div>
  );
};
