import React from 'react';

interface SessionManagerProps {
  searchedKeywords: string[];
  onClearBrandKeywords: () => void;
  onClusterKeywords: () => void;
  isClustering: boolean;
  keywordCount: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  searchedKeywords,
  onClearBrandKeywords,
  onClusterKeywords,
  isClustering,
  keywordCount,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Session Info
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {keywordCount} keyword{keywordCount !== 1 ? 's' : ''} in bank
            {searchedKeywords.length > 0 && ` • Last search: ${searchedKeywords[searchedKeywords.length - 1]}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClusterKeywords}
            disabled={isClustering || keywordCount < 2}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
          >
            {isClustering ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Clustering...
              </span>
            ) : (
              '🧩 Cluster Keywords'
            )}
          </button>
          <button
            onClick={onClearBrandKeywords}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
