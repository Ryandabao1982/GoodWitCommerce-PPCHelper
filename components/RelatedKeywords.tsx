import React from 'react';

interface RelatedKeywordsProps {
  keywords: string[];
  onKeywordSelect: (keyword: string) => void;
}

export const RelatedKeywords: React.FC<RelatedKeywordsProps> = ({ keywords, onKeywordSelect }) => {
  if (keywords.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Related Keyword Ideas
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => onKeywordSelect(keyword)}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};
