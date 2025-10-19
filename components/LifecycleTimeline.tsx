/**
 * Lifecycle Timeline Component
 * 
 * Visualizes the lifecycle journey of a keyword with events and milestones.
 */

import React from 'react';
import type { LifecycleEvent, LifecycleStage } from '../types';

interface LifecycleTimelineProps {
  events: LifecycleEvent[];
  currentStage: LifecycleStage;
  keywordName: string;
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  events,
  currentStage,
  keywordName,
}) => {
  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'promoted':
        return '⬆️';
      case 'negated':
        return '🚫';
      case 'paused':
        return '⏸️';
      case 'activated':
        return '▶️';
      case 'bid_changed':
        return '💰';
      case 'stage_changed':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case 'promoted':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
      case 'negated':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
      case 'paused':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
      case 'activated':
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
      case 'bid_changed':
        return 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const stageProgression: LifecycleStage[] = ['Discovery', 'Test', 'Performance', 'SKAG', 'Archived'];
  const currentStageIndex = stageProgression.indexOf(currentStage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Lifecycle Timeline
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {keywordName}
        </p>
      </div>

      {/* Stage Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stageProgression.map((stage, index) => (
            <div key={stage} className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 ${
                  index <= currentStageIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`text-xs text-center ${
                  index === currentStageIndex
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {stage}
              </div>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="absolute h-2 bg-blue-600 rounded-full transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (stageProgression.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Event History ({events.length})
        </h4>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No events recorded yet
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {events.map((event, index) => (
              <div key={event.id} className="relative flex items-start mb-6 last:mb-0">
                {/* Event Icon */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl ${getEventColor(
                    event.eventType
                  )}`}
                >
                  {getEventIcon(event.eventType)}
                </div>

                {/* Event Content */}
                <div className="ml-6 flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {event.eventType.replace('_', ' ')}
                        </h5>
                        {event.fromStage && event.toStage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {event.fromStage} → {event.toStage}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(event.occurredAt)}
                        </div>
                        {event.automated && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                            Automated
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {event.reason}
                    </p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <details>
                          <summary className="cursor-pointer">View details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Stage Summary */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <div className="flex-1">
            <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Current Stage: {currentStage}
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {currentStage === 'Discovery' && 'Testing phase - gathering initial data'}
              {currentStage === 'Test' && 'Active testing - evaluating performance'}
              {currentStage === 'Performance' && 'Proven performer - ready for scaling'}
              {currentStage === 'SKAG' && 'Single Keyword Ad Group - optimized setup'}
              {currentStage === 'Archived' && 'Paused or removed from campaigns'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
