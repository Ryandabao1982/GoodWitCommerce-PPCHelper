import React from 'react';
import type { KeywordDeepDiveData } from '../types';

interface KeywordDetailViewProps {
  isLoading: boolean;
  error: string | null;
  data: KeywordDeepDiveData | null;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-brand-primary uppercase tracking-wider">{title}</h4>
        <div className="mt-2 text-gray-700 dark:text-gray-300">{children}</div>
    </div>
);

export const KeywordDetailView: React.FC<KeywordDetailViewProps> = ({ isLoading, error, data }) => {
  return (
    <div className="p-6 transition-all duration-300 ease-in-out">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 dark:text-gray-400">Fetching AI Insights...</span>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-600 dark:text-red-400">
          <p><strong>Failed to load details.</strong></p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <DetailSection title="Ad Copy Angles">
            <ul className="space-y-2 list-disc list-inside">
              {data.adCopyAngles.map((angle, i) => <li key={i} className="text-sm">{angle}</li>)}
            </ul>
          </DetailSection>

          <DetailSection title="PPC Bid Strategy">
            <p className="text-sm">{data.bidStrategy}</p>
          </DetailSection>

          <DetailSection title="Negative Keywords">
            <div className="flex flex-wrap gap-2">
              {data.negativeKeywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs ring-1 ring-gray-300 dark:ring-gray-600">
                  {kw}
                </span>
              ))}
            </div>
          </DetailSection>
        </div>
      )}
    </div>
  );
};