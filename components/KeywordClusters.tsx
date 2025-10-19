import React from 'react';

interface KeywordClustersProps {
  clusters: Record<string, string[]>;
  onClear: () => void;
}

export const KeywordClusters: React.FC<KeywordClustersProps> = ({ clusters, onClear }) => {
  const clusterEntries = Object.entries(clusters);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Keyword Clusters</h2>
        <button
          onClick={onClear}
          className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Clear Clusters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusterEntries.map(([clusterName, keywords], index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
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
    </div>
  );
};
