/**
 * Lifecycle Timeline Component
 * Shows the history of lifecycle state changes for a keyword
 */

import React from 'react';
import type { LifecycleState, KeywordAction } from '../types';

interface LifecycleEvent {
  id: string;
  date: string;
  fromState?: LifecycleState;
  toState: LifecycleState;
  action: KeywordAction;
  reason: string;
  actor: string;
}

interface LifecycleTimelineProps {
  keyword: string;
  events: LifecycleEvent[];
  currentState: LifecycleState;
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  keyword,
  events,
  currentState,
}) => {
  const getStateColor = (state: LifecycleState) => {
    switch (state) {
      case 'Discovery':
        return 'bg-blue-500';
      case 'Test':
        return 'bg-purple-500';
      case 'Performance':
        return 'bg-green-500';
      case 'SKAG':
        return 'bg-indigo-500';
      case 'Archived':
        return 'bg-gray-500';
    }
  };

  const getActionIcon = (action: KeywordAction) => {
    switch (action) {
      case 'Promote':
        return '⬆️';
      case 'Negate':
        return '❌';
      case 'Reassign':
        return '↔️';
      case 'BidUp':
        return '📈';
      case 'BidDown':
        return '📉';
      case 'PlacementChange':
        return '🎯';
      default:
        return '📝';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Lifecycle Timeline: <span className="text-blue-600 dark:text-blue-400">{keyword}</span>
      </h3>

      {/* Current State Badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Current State:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStateColor(currentState)}`}>
          {currentState}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${getStateColor(event.toState)} flex items-center justify-center text-white text-sm font-bold`}>
                {getActionIcon(event.action)}
              </div>

              {/* Event card */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.action}
                      {event.fromState && event.toState && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {event.fromState} → {event.toState}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.reason}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                    {formatDate(event.date)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  By: {event.actor}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No lifecycle events recorded yet
          </div>
        )}
      </div>
    </div>
  );
};
