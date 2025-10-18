import React, { useMemo } from 'react';
import type { Campaign, KeywordData } from '../types';

interface CampaignExportButtonProps {
  campaigns: Campaign[];
  allKeywords: KeywordData[];
  disabled: boolean;
  activeBrandName: string;
}

export const CampaignExportButton: React.FC<CampaignExportButtonProps> = ({ campaigns, allKeywords, disabled, activeBrandName }) => {
    
    const keywordDataMap = useMemo(() => {
        return new Map(allKeywords.map(kw => [kw.keyword.toLowerCase(), kw]));
    }, [allKeywords]);

    const formatCsvCell = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '';
        const stringValue = String(value);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const handleExport = () => {
        if (disabled || campaigns.length === 0) return;

        const csvRows: string[][] = [];
        
        campaigns.forEach(campaign => {
            campaign.adGroups.forEach(adGroup => {
                if (adGroup.keywords.length > 0) {
                    adGroup.keywords.forEach(keywordString => {
                        const keywordData = keywordDataMap.get(keywordString.toLowerCase());
                        csvRows.push([
                            formatCsvCell(campaign.name),
                            formatCsvCell(adGroup.name),
                            formatCsvCell(keywordString),
                            formatCsvCell(keywordData?.type || 'Broad'), // Match Type
                            'Enabled', // Status
                            '' // Bid
                        ]);
                    });
                } else {
                    // Include ad group even if it has no keywords
                    csvRows.push([
                        formatCsvCell(campaign.name),
                        formatCsvCell(adGroup.name),
                        '', '', '', '' // Empty keyword-related fields
                    ]);
                }
            });
        });

        const headers = ['Campaign Name', 'Ad Group Name', 'Keyword Text', 'Match Type', 'Status', 'Bid'];
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        
        const safeFilename = activeBrandName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `campaign_plan_${safeFilename}.csv`;
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
            className="flex items-center justify-center px-3 py-1.5 text-sm bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-brand-secondary disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
            title={disabled ? "Create a campaign to enable export" : "Export campaign plan to CSV"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Plan
        </button>
    );
};