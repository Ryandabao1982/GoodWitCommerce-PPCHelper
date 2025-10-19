import React, { useState, useMemo } from 'react';
import { KeywordData } from '../types';

interface DashboardProps {
  data: KeywordData[];
  parseVolume: (volume: string) => number;
}

type SortField = 'keyword' | 'type' | 'category' | 'searchVolume' | 'competition' | 'relevance' | 'source';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({ data, parseVolume }) => {
  const [sortField, setSortField] = useState<SortField>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'keyword':
          comparison = a.keyword.localeCompare(b.keyword);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'searchVolume':
          comparison = parseVolume(a.searchVolume) - parseVolume(b.searchVolume);
          break;
        case 'competition':
          const compOrder = { Low: 1, Medium: 2, High: 3 };
          comparison = compOrder[a.competition] - compOrder[b.competition];
          break;
        case 'relevance':
          comparison = a.relevance - b.relevance;
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [data, sortField, sortDirection, parseVolume]);

  const getBadgeColor = (type: string, value: string) => {
    if (type === 'competition') {
      switch (value) {
        case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      }
    }
    if (type === 'source') {
      return value === 'AI' 
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Keyword Research Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {data.length} keyword{data.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Mobile Card View - visible on small screens */}
      <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {sortedData.map((item, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="font-medium text-gray-900 dark:text-white mb-2">{item.keyword}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('type', item.type)}`}>
                  {item.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Volume:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{item.searchVolume}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Competition:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('competition', item.competition)}`}>
                  {item.competition}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Relevance:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{item.relevance}/10</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor('category', item.category)}`}>
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                onClick={() => handleSort('keyword')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Keyword <SortIcon field="keyword" />
              </th>
              <th
                onClick={() => handleSort('type')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Type <SortIcon field="type" />
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Category <SortIcon field="category" />
              </th>
              <th
                onClick={() => handleSort('searchVolume')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Volume <SortIcon field="searchVolume" />
              </th>
              <th
                onClick={() => handleSort('competition')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Competition <SortIcon field="competition" />
              </th>
              <th
                onClick={() => handleSort('relevance')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Relevance <SortIcon field="relevance" />
              </th>
              <th
                onClick={() => handleSort('source')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Source <SortIcon field="source" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('type', item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('category', item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item.searchVolume}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('competition', item.competition)}`}>
                    {item.competition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.relevance * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item.relevance}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('source', item.source)}`}>
                    {item.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
