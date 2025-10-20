import React, { useState } from 'react';

interface KeywordClustersProps {
  clusters: Record<string, string[]>;
  onClear: () => void;
  onClusterClick?: (clusterName: string, keywords: string[]) => void;
}

type ViewMode = 'grid' | 'bubble';

export const KeywordClusters: React.FC<KeywordClustersProps> = ({
  clusters,
  onClear,
  onClusterClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const clusterEntries = Object.entries(clusters);

  // Calculate bubble sizes based on keyword count
  const maxKeywords = Math.max(...clusterEntries.map(([, keywords]) => keywords.length));
  const minSize = 60;
  const maxSize = 200;

  const getBubbleSize = (count: number): number => {
    if (maxKeywords === 0) return minSize;
    return minSize + (count / maxKeywords) * (maxSize - minSize);
  };

  const handleClusterClick = (clusterName: string, keywords: string[]) => {
    if (onClusterClick) {
      onClusterClick(clusterName, keywords);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Keyword Clusters
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('bubble')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'bubble'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              aria-label="Bubble view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="8" r="6" strokeWidth={2} />
                <circle cx="16" cy="16" r="4" strokeWidth={2} />
              </svg>
            </button>
          </div>
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Clear Clusters
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusterEntries.map(([clusterName, keywords], index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleClusterClick(clusterName, keywords)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClusterClick(clusterName, keywords);
                }
              }}
            >
              <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full mr-2 text-sm flex-shrink-0">
                  {keywords.length}
                </span>
                <span className="break-words">{clusterName}</span>
              </h3>
              <ul className="space-y-1">
                {keywords.slice(0, 10).map((keyword, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400 truncate"
                    title={keyword}
                  >
                    • {keyword}
                  </li>
                ))}
                {keywords.length > 10 && (
                  <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                    +{keywords.length - 10} more...
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg p-8 flex flex-wrap items-center justify-center gap-4">
          {clusterEntries.map(([clusterName, keywords], index) => {
            const size = getBubbleSize(keywords.length);
            const hue = (index * 137.5) % 360; // Golden angle for color distribution

            return (
              <div
                key={index}
                className="flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 hover:shadow-xl"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: `hsla(${hue}, 70%, 60%, 0.8)`,
                  minWidth: `${minSize}px`,
                  minHeight: `${minSize}px`,
                }}
                onClick={() => handleClusterClick(clusterName, keywords)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClusterClick(clusterName, keywords);
                  }
                }}
                title={`${clusterName}: ${keywords.length} keywords`}
              >
                <div className="text-center p-2">
                  <div
                    className="font-bold text-white text-xs sm:text-sm break-words"
                    style={{ lineHeight: '1.2' }}
                  >
                    {clusterName.length > 20 ? `${clusterName.substring(0, 17)}...` : clusterName}
                  </div>
                  <div className="text-white text-lg sm:text-2xl font-bold mt-1">
                    {keywords.length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {onClusterClick && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 Click on any cluster to filter keywords in the Keyword Bank
        </div>
      )}
    </div>
  );
};
