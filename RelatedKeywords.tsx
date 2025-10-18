import React from 'react';

interface RelatedKeywordsProps {
  keywords: string[];
  onKeywordSelect: (keyword: string) => void;
}

export const RelatedKeywords: React.FC<RelatedKeywordsProps> = ({ keywords, onKeywordSelect }) => {
  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Related Ideas</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <button
            key={keyword}
            onClick={() => onKeywordSelect(keyword)}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-brand-secondary animate-pop-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};