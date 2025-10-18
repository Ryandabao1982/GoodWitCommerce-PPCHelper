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
  keywordCount 
}) => {
  if (searchedKeywords.length === 0 && keywordCount === 0) {
    return null;
  }

  return (
    <div className="my-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
          Brand Research History
        </h3>
        {searchedKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
            {searchedKeywords.map(keyword => (
                <span key={keyword} className="inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium ring-1 ring-inset ring-gray-300 dark:ring-gray-600">
                {keyword}
                </span>
            ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500">Your searched terms for this brand will appear here.</p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
        <button
            onClick={onClusterKeywords}
            disabled={isClustering || keywordCount < 10}
            className="flex items-center justify-center px-4 py-2 border border-purple-500/50 text-purple-600 dark:text-purple-200 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:text-purple-700 dark:hover:text-white font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-500"
            title={keywordCount < 10 ? "Generate at least 10 keywords to enable clustering" : "Group keywords by theme"}
        >
            {isClustering ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Clustering...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Cluster Keywords
                </>
            )}
        </button>
        <button 
            onClick={onClearBrandKeywords} 
            className="flex items-center justify-center px-4 py-2 border border-red-500/50 text-red-600 dark:text-red-200 hover:bg-red-500/10 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-white font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-red-500"
            title="Clear all keywords for this brand"
            disabled={keywordCount === 0}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Clear Keywords
        </button>
      </div>
    </div>
  );
};