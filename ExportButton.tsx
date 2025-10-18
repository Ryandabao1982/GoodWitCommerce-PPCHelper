import React, { useMemo } from 'react';
import type { KeywordData, Campaign } from '../types';

interface ExportButtonProps {
  data: KeywordData[];
  searchedKeywords: string[];
  disabled: boolean;
  campaigns: Campaign[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, searchedKeywords, disabled, campaigns }) => {
  const keywordAdGroupMap = useMemo(() => {
    const map = new Map<string, { campaignName: string, adGroupName: string }>();
    campaigns.forEach(campaign => {
        campaign.adGroups.forEach(adGroup => {
            adGroup.keywords.forEach(keyword => {
                map.set(keyword, { campaignName: campaign.name, adGroupName: adGroup.name });
            });
        });
    });
    return map;
}, [campaigns]);


  const handleExport = () => {
    if (data.length === 0) return;

    const headers = ['Keyword', 'Campaign', 'Ad Group', 'Type', 'Category', 'Est. Search Volume', 'Competition', 'Relevance', 'Source'];
    
    const formatCsvCell = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '';
        const stringValue = String(value);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        const assignment = keywordAdGroupMap.get(row.keyword);
        return [
            formatCsvCell(row.keyword),
            formatCsvCell(assignment?.campaignName),
            formatCsvCell(assignment?.adGroupName),
            formatCsvCell(row.type),
            formatCsvCell(row.category),
            formatCsvCell(row.searchVolume),
            formatCsvCell(row.competition),
            formatCsvCell(row.relevance),
            formatCsvCell(row.source),
        ].join(',')
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const safeFilename = searchedKeywords.length > 0
      ? searchedKeywords[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'keywords';
      
    const filename = `keyword_research_${safeFilename}${searchedKeywords.length > 1 ? '_and_more' : ''}.csv`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="flex items-center justify-center px-4 py-2 bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-secondary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      Export CSV
    </button>
  );
};