import React, { useState, useMemo } from 'react';
import { BrandState, BrandTabSettings, KeywordHealth } from '../../types';

interface BrandTabKeywordsProps {
  brandState: BrandState;
  settings: BrandTabSettings;
}

export const BrandTabKeywords: React.FC<BrandTabKeywordsProps> = ({ brandState, settings }) => {
  const [sortField, setSortField] = useState<keyof KeywordHealth>('oppScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Generate mock keyword health data from brand state
  const keywordHealthData: KeywordHealth[] = useMemo(() => {
    // Use price and targetAcos from settings if available, otherwise fallback to defaults
    const price = settings.price ?? 29.99;
    const targetAcos = settings.targetAcos ?? 25;
    return brandState.keywordResults.map((kw, idx) => {
      // Mock calculations
      const cvr = 2 + Math.random() * 3;
      const cpcMax = (price * (targetAcos / 100) * (cvr / 100));
      const cpc = cpcMax * (0.5 + Math.random() * 0.8);
      const spend = 50 + Math.random() * 500;
      const sales = spend * (1 + Math.random() * 3);
      const acos = (spend / sales) * 100;
      
      return {
        keyword: kw.keyword,
        oppScore: Math.round(50 + Math.random() * 50),
        intent: ['Branded', 'Commercial', 'Informational', 'Transactional'][idx % 4],
        category: kw.category,
        lifecycle: ['Discovery', 'Test', 'Performance', 'SKAG'][idx % 4] as any,
        acos: acos,
        cvr: cvr,
        cpc: cpc,
        cpcMax: cpcMax,
        spend: spend,
        sales: sales,
        rag: acos > 30 ? 'Red' : acos > 20 ? 'Amber' : 'Green',
      };
    });
  }, [brandState.keywordResults]);

  // Harvest queue (keywords ready to promote)
  const harvestQueue = useMemo(() => {
    return keywordHealthData.filter(kw => 
      kw.oppScore >= 70 && kw.lifecycle === 'Test'
    );
  }, [keywordHealthData]);

  // Negation queue (keywords to negate)
  const negationQueue = useMemo(() => {
    return keywordHealthData.filter(kw =>
      kw.rag === 'Red' && kw.spend >= settings.wastedSpendRedThreshold
    );
  }, [keywordHealthData, settings]);

  // Cannibalization (same normalized term in multiple places)
  const cannibalizationMap = useMemo(() => {
    const termMap = new Map<string, string[]>();
    keywordHealthData.forEach(kw => {
      const normalized = kw.keyword.toLowerCase().trim();
      if (!termMap.has(normalized)) {
        termMap.set(normalized, []);
      }
      termMap.get(normalized)!.push(kw.keyword);
    });
    return Array.from(termMap.entries()).filter(([_, keywords]) => keywords.length > 1);
  }, [keywordHealthData]);

  const handleSort = (field: keyof KeywordHealth) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...keywordHealthData];
    sorted.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const comparison = typeof aVal === 'string' 
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [keywordHealthData, sortField, sortDirection]);

  const getRAGColor = (rag: string) => {
    switch (rag) {
      case 'Red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Harvest & Negation Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Harvest Queue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
              🌾 Harvest Queue ({harvestQueue.length})
            </h3>
            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
              Promote All
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {harvestQueue.slice(0, 5).map((kw, idx) => (
              <div key={idx} className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                <div className="font-medium text-gray-900 dark:text-white">{kw.keyword}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Score: {kw.oppScore} · CVR: {kw.cvr.toFixed(2)}%
                </div>
              </div>
            ))}
            {harvestQueue.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No keywords ready to promote
              </div>
            )}
          </div>
        </div>

        {/* Negation Queue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
              🚫 Negation Queue ({negationQueue.length})
            </h3>
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
              Negate All
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {negationQueue.slice(0, 5).map((kw, idx) => (
              <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                <div className="font-medium text-gray-900 dark:text-white">{kw.keyword}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  ACOS: {kw.acos.toFixed(1)}% · Spend: ${kw.spend.toFixed(2)}
                </div>
              </div>
            ))}
            {negationQueue.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No keywords to negate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cannibalization Map */}
      {cannibalizationMap.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-yellow-300 dark:border-yellow-700 p-4">
          <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-3">
            ⚠️ Cannibalization Detected ({cannibalizationMap.length})
          </h3>
          <div className="space-y-2">
            {cannibalizationMap.slice(0, 3).map(([term, keywords], idx) => (
              <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="font-medium text-gray-900 dark:text-white mb-1">"{term}"</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Found in {keywords.length} places - Consider adding negative keywords
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Health Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Keyword Health Board</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
              Export CSV
            </button>
            <input
              type="search"
              placeholder="Search keywords..."
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <SortableHeader field="keyword" label="Keyword" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="oppScore" label="Opp.Score" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="intent" label="Intent" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="lifecycle" label="Lifecycle" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="acos" label="ACOS" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="cvr" label="CVR" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">CPC / Max</th>
                <SortableHeader field="spend" label="Spend" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="sales" label="Sales" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="rag" label="RAG" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedData.map((kw, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{kw.keyword}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{kw.oppScore}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{kw.intent}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {kw.lifecycle}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{kw.acos.toFixed(1)}%</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{kw.cvr.toFixed(2)}%</td>
                  <td className="p-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      ${kw.cpc.toFixed(2)}
                      {kw.cpc > kw.cpcMax && <span className="text-red-600 ml-1">⚠️</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Max: ${kw.cpcMax.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">${kw.spend.toFixed(2)}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">${kw.sales.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRAGColor(kw.rag)}`}>
                      {kw.rag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SortableHeader: React.FC<{
  field: keyof KeywordHealth;
  label: string;
  sortField: keyof KeywordHealth;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof KeywordHealth) => void;
}> = ({ field, label, sortField, sortDirection, onSort }) => (
  <th
    onClick={() => onSort(field)}
    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
  >
    <div className="flex items-center gap-1">
      {label}
      {sortField === field && (
        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      )}
    </div>
  </th>
);
