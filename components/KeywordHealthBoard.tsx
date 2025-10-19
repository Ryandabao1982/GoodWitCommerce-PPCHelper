/**
 * Keyword Health Board Component
 * Displays keywords with lifecycle state, metrics, and RAG status
 */

import React, { useState, useMemo } from 'react';
import type {
  KeywordData,
  AlertLevel,
  LifecycleState,
  KeywordIntent,
} from '../types';

interface KeywordHealthMetrics {
  keywordId: string;
  keyword: string;
  lifecycleState: LifecycleState;
  alertLevel: AlertLevel;
  oppScore?: number;
  acos?: number;
  cvr?: number;
  cpc?: number;
  cpcMax?: number;
  spend: number;
  sales: number;
  clicks: number;
  orders: number;
  intent?: KeywordIntent;
  category?: string;
}

interface KeywordHealthBoardProps {
  keywords: KeywordHealthMetrics[];
  onPromote: (keywordIds: string[]) => void;
  onNegate: (keywordIds: string[]) => void;
  onAssign: (keywordIds: string[]) => void;
  onAddNegative: (keywordIds: string[]) => void;
}

export const KeywordHealthBoard: React.FC<KeywordHealthBoardProps> = ({
  keywords,
  onPromote,
  onNegate,
  onAssign,
  onAddNegative,
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<LifecycleState | 'all'>('all');
  const [filterAlert, setFilterAlert] = useState<AlertLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'oppScore' | 'acos' | 'spend' | 'sales'>('oppScore');

  const filteredAndSorted = useMemo(() => {
    let filtered = keywords;

    if (filterState !== 'all') {
      filtered = filtered.filter(k => k.lifecycleState === filterState);
    }

    if (filterAlert !== 'all') {
      filtered = filtered.filter(k => k.alertLevel === filterAlert);
    }

    return filtered.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return bVal - aVal;
    });
  }, [keywords, filterState, filterAlert, sortBy]);

  const handleToggleSelect = (keywordId: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keywordId)) {
      newSelected.delete(keywordId);
    } else {
      newSelected.add(keywordId);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedKeywords.size === filteredAndSorted.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(filteredAndSorted.map(k => k.keywordId)));
    }
  };

  const handleBulkAction = (action: 'promote' | 'negate' | 'assign' | 'addNegative') => {
    const selected = Array.from(selectedKeywords);
    if (selected.length === 0) {
      alert('Please select keywords first');
      return;
    }

    switch (action) {
      case 'promote':
        onPromote(selected);
        break;
      case 'negate':
        onNegate(selected);
        break;
      case 'assign':
        onAssign(selected);
        break;
      case 'addNegative':
        onAddNegative(selected);
        break;
    }
    setSelectedKeywords(new Set());
  };

  const getAlertBadgeColor = (level: AlertLevel) => {
    switch (level) {
      case 'RED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'AMBER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'GREEN':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getLifecycleBadgeColor = (state: LifecycleState) => {
    switch (state) {
      case 'Discovery':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Test':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Performance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'SKAG':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Keyword Health Board
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value as LifecycleState | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All States</option>
            <option value="Discovery">Discovery</option>
            <option value="Test">Test</option>
            <option value="Performance">Performance</option>
            <option value="SKAG">SKAG</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={filterAlert}
            onChange={(e) => setFilterAlert(e.target.value as AlertLevel | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Alerts</option>
            <option value="RED">🔴 Red</option>
            <option value="AMBER">🟡 Amber</option>
            <option value="GREEN">🟢 Green</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="oppScore">Opportunity Score</option>
            <option value="acos">ACOS</option>
            <option value="spend">Spend</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedKeywords.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300 py-2">
              {selectedKeywords.size} selected
            </span>
            <button
              onClick={() => handleBulkAction('promote')}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Promote
            </button>
            <button
              onClick={() => handleBulkAction('negate')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Negate
            </button>
            <button
              onClick={() => handleBulkAction('assign')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Assign
            </button>
            <button
              onClick={() => handleBulkAction('addNegative')}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
            >
              Add Negative
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Keywords</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{keywords.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400">Healthy</div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {keywords.filter(k => k.alertLevel === 'GREEN').length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Warning</div>
            <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {keywords.filter(k => k.alertLevel === 'AMBER').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
            <div className="text-xl font-bold text-red-700 dark:text-red-300">
              {keywords.filter(k => k.alertLevel === 'RED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedKeywords.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Keyword</th>
              <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">State</th>
              <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">Alert</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">Opp Score</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">ACOS</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">CVR</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">CPC</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">Spend</th>
              <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300 font-medium">Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSorted.map((kw) => (
              <tr key={kw.keywordId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(kw.keywordId)}
                    onChange={() => handleToggleSelect(kw.keywordId)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{kw.keyword}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleBadgeColor(kw.lifecycleState)}`}>
                    {kw.lifecycleState}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertBadgeColor(kw.alertLevel)}`}>
                    {kw.alertLevel === 'RED' ? '🔴' : kw.alertLevel === 'AMBER' ? '🟡' : '🟢'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                  {kw.oppScore?.toFixed(2) || '-'}
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                  {kw.acos ? `${(kw.acos * 100).toFixed(1)}%` : '-'}
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                  {kw.cvr ? `${(kw.cvr * 100).toFixed(1)}%` : '-'}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="text-gray-900 dark:text-white">
                    ${kw.cpc?.toFixed(2) || '0.00'}
                  </div>
                  {kw.cpcMax && (
                    <div className="text-xs text-gray-500">
                      Max: ${kw.cpcMax.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                  ${kw.spend.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white">
                  ${kw.sales.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No keywords match the selected filters
          </div>
        )}
      </div>
    </div>
  );
};
