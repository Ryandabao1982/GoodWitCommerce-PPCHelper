/**
 * Cannibalization Map Component
 * 
 * Visualizes keyword cannibalization issues and provides actionable recommendations.
 */

import React, { useState } from 'react';
import type { CannibalizationAlert } from '../types';

interface CannibalizationMapProps {
  alerts: CannibalizationAlert[];
  onResolve?: (alertId: string, action: string) => void;
  onIgnore?: (alertId: string) => void;
}

export const CannibalizationMap: React.FC<CannibalizationMapProps> = ({
  alerts,
  onResolve,
  onIgnore,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved' | 'ignored'>('all');

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    // Filter by severity
    if (filterSeverity !== 'all') {
      const severity = getSeverity(alert.cannibalizationScore);
      if (severity !== filterSeverity) return false;
    }

    // Filter by status
    if (filterStatus !== 'all' && alert.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const getSeverity = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getSeverityColor = (score: number): string => {
    const severity = getSeverity(score);
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ignored':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Calculate stats
  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    high: alerts.filter((a) => getSeverity(a.cannibalizationScore) === 'high').length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cannibalization Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Identify and resolve keyword conflicts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Issues</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-red-600 dark:text-red-400">Active</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.active}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">High Severity</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.high}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Resolved</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-gray-600 dark:text-gray-400">
              No cannibalization issues found
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-lg p-5 ${getSeverityColor(alert.cannibalizationScore)}`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">
                      {alert.keyword1Id} ⚔️ {alert.keyword2Id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="text-sm opacity-80">
                    Cannibalization Score: {alert.cannibalizationScore}/100
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">
                    Detected {new Date(alert.detectedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Alert Details */}
              <div className="space-y-3">
                {/* Reason */}
                <div>
                  <div className="font-semibold text-sm mb-1">Issue:</div>
                  <div className="text-sm opacity-90">{alert.reason}</div>
                </div>

                {/* Suggested Action */}
                <div>
                  <div className="font-semibold text-sm mb-1">Suggested Action:</div>
                  <div className="text-sm opacity-90">{alert.suggestedAction}</div>
                </div>

                {/* Campaign Info */}
                {(alert.campaign1Id || alert.campaign2Id) && (
                  <div>
                    <div className="font-semibold text-sm mb-1">Campaigns:</div>
                    <div className="text-sm opacity-90">
                      {alert.campaign1Id && <div>Campaign 1: {alert.campaign1Id}</div>}
                      {alert.campaign2Id && <div>Campaign 2: {alert.campaign2Id}</div>}
                    </div>
                  </div>
                )}

                {/* Resolved Action */}
                {alert.status === 'resolved' && alert.resolvedAction && (
                  <div className="bg-white dark:bg-gray-900 bg-opacity-50 rounded p-3">
                    <div className="font-semibold text-sm mb-1">Resolution:</div>
                    <div className="text-sm">{alert.resolvedAction}</div>
                    <div className="text-xs mt-1 opacity-70">
                      Resolved on {new Date(alert.resolvedAt!).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {alert.status === 'active' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-current border-opacity-20">
                  <button
                    onClick={() => onResolve && onResolve(alert.id, alert.suggestedAction)}
                    className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => onIgnore && onIgnore(alert.id)}
                    className="px-4 py-2 bg-white dark:bg-gray-900 bg-opacity-50 text-gray-900 dark:text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                  >
                    Ignore
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredAlerts.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
      )}
    </div>
  );
};
