import React, { useState, useMemo } from 'react';
import { sortKeywords } from '../utils/sorting';
import type { KeywordData, Campaign, KeywordDeepDiveData } from '../types';
import { Badge } from './Badge';
import { RelevanceBar } from './RelevanceBar';
import { CompetitionIndicator } from './CompetitionIndicator';
import { KeywordDetailView } from './KeywordDetailView';
import { fetchKeywordDeepDive } from '../services/geminiService';
import { ExportButton } from './ExportButton';

interface ResultsTableProps {
  keywords: KeywordData[];
  searchedKeywords: string[];
  campaigns: Campaign[];
  selectedKeywords: Set<string>;
  onToggleSelect: (keyword: string, isSelected: boolean) => void;
  onToggleSelectAll: (isSelected: boolean) => void;
  onDragStart: (e: React.DragEvent, keyword: string) => void;
}

type SortableKey = keyof KeywordData | 'assignment';

export const ResultsTable: React.FC<ResultsTableProps> = ({ 
  keywords, 
  searchedKeywords, 
  campaigns,
  selectedKeywords,
  onToggleSelect,
  onToggleSelectAll,
  onDragStart,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey | null; direction: 'ascending' | 'descending' }>({
    key: 'relevance',
    direction: 'descending',
  });
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [detailViewData, setDetailViewData] = useState<Record<string, KeywordDeepDiveData | null>>({});
  const [detailViewLoading, setDetailViewLoading] = useState<Record<string, boolean>>({});
  const [detailViewError, setDetailViewError] = useState<Record<string, string | null>>({});

  const keywordAdGroupMap = useMemo(() => {
    const map = new Map<string, { campaignName: string, adGroupName: string }>();
    campaigns.forEach(campaign => {
      campaign.adGroups.forEach(adGroup => {
        adGroup.keywords.forEach(keyword => {
          map.set(keyword.toLowerCase(), { campaignName: campaign.name, adGroupName: adGroup.name });
        });
      });
    });
    return map;
  }, [campaigns]);

  const sortedKeywords = useMemo(() => {
    // Augment keywords with assignment info for sorting
    const keywordsWithAssignment = keywords.map(kw => ({
      ...kw,
      assignment: keywordAdGroupMap.get(kw.keyword.toLowerCase())?.adGroupName || 'zzzz', // 'zzzz' to sort unassigned last
    }));
    return sortKeywords(keywordsWithAssignment, sortConfig);
  }, [keywords, sortConfig, keywordAdGroupMap]);

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRowExpand = async (keyword: string) => {
    const newExpandedRow = expandedRow === keyword ? null : keyword;
    setExpandedRow(newExpandedRow);

    if (newExpandedRow && !detailViewData[keyword] && !(detailViewLoading[keyword])) {
      setDetailViewLoading(prev => ({...prev, [keyword]: true}));
      setDetailViewError(prev => ({...prev, [keyword]: null}));
      try {
        const data = await fetchKeywordDeepDive(keyword, searchedKeywords[0] || 'general products');
        setDetailViewData(prev => ({...prev, [keyword]: data}));
      } catch (err: any) {
        setDetailViewError(prev => ({...prev, [keyword]: err.message}));
      } finally {
        setDetailViewLoading(prev => ({...prev, [keyword]: false}));
      }
    }
  };
  
  const isAllSelected = selectedKeywords.size > 0 && selectedKeywords.size === keywords.length;

  const getSortIndicator = (key: SortableKey) => {
    if (sortConfig.key !== key) return ' ';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const tableHeaders: { key: SortableKey; label: string; className?: string }[] = [
    { key: 'keyword', label: 'Keyword', className: 'w-1/4' },
    { key: 'assignment', label: 'Assigned To' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'searchVolume', label: 'Est. Search Volume' },
    { key: 'competition', label: 'Competition' },
    { key: 'relevance', label: 'Relevance' },
    { key: 'source', label: 'Source' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keyword Library</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{keywords.length.toLocaleString()} keywords found</p>
            </div>
            <ExportButton data={keywords} searchedKeywords={searchedKeywords} disabled={keywords.length === 0} campaigns={campaigns} />
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="p-4 text-left">
                <input type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-brand-primary focus:ring-brand-primary"
                 />
              </th>
              {tableHeaders.map(({ key, label, className }) => (
                <th
                  key={key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${className || ''}`}
                  onClick={() => requestSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    <span className="ml-1 w-4 text-center">{getSortIndicator(key)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedKeywords.map((item) => {
              const assignment = keywordAdGroupMap.get(item.keyword.toLowerCase());
              return (
                <React.Fragment key={item.keyword}>
                  <tr 
                    draggable="true"
                    onDragStart={(e) => onDragStart(e, item.keyword)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${expandedRow === item.keyword ? 'bg-gray-50 dark:bg-gray-700/50' : ''} cursor-grab`}
                  >
                    <td className="p-4">
                      <input type="checkbox"
                          checked={selectedKeywords.has(item.keyword)}
                          onChange={(e) => onToggleSelect(item.keyword, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-brand-primary focus:ring-brand-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleRowExpand(item.keyword)} className="w-full text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.keyword}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {assignment ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{assignment.campaignName}</span>
                          <span>{assignment.adGroupName}</span>
                        </div>
                      ) : (
                        <span className="italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type={item.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type={item.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.searchVolume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CompetitionIndicator level={item.competition} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RelevanceBar score={item.relevance} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge type={item.source} />
                    </td>
                  </tr>
                  {expandedRow === item.keyword && (
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                      <td colSpan={9}>
                          <KeywordDetailView
                              isLoading={detailViewLoading[item.keyword] || false}
                              error={detailViewError[item.keyword] || null}
                              data={detailViewData[item.keyword] || null}
                          />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {keywords.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                No keywords found. Try a different search.
            </div>
        )}
      </div>
    </div>
  );
};