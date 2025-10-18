import React from 'react';

interface KeywordClustersProps {
  clusters: Record<string, string[]>;
  onClear: () => void;
}

export const KeywordClusters: React.FC<KeywordClustersProps> = ({ clusters, onClear }) => {
  const clusterEntries = Object.entries(clusters);

  return (
    <div className="my-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Keyword Clusters <span className="text-base font-normal text-gray-500 dark:text-gray-400">({clusterEntries.length} Groups)</span>
        </h2>
        <button
          onClick={onClear}
          className="flex items-center justify-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-800 dark:hover:text-white font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-gray-500"
          title="Clear keyword clusters view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Clusters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusterEntries.map(([clusterName, keywords], index) => (
          <div
            key={clusterName}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col animate-pop-in-detail"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <h3 className="font-bold text-brand-primary truncate" title={clusterName}>
              {clusterName}
            </h3>
            <div className="mt-3 flex-1">
              <ul className="space-y-1.5">
                {Array.isArray(keywords) && keywords.map(keyword => (
                  <li key={keyword} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    <span>{keyword}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};