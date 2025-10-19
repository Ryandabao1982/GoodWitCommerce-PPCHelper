import React from 'react';
import { KPIMetrics, RAGBadge } from '../../types';

interface BrandTabHeaderProps {
  activeBrand: string;
  marketplace: string;
  dateRange: string;
  kpiMetrics: KPIMetrics;
  ragBadge: RAGBadge;
  onMarketplaceChange: (marketplace: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  onSettingsClick: () => void;
}

export const BrandTabHeader: React.FC<BrandTabHeaderProps> = ({
  activeBrand,
  marketplace,
  dateRange,
  kpiMetrics,
  ragBadge,
  onMarketplaceChange,
  onDateRangeChange,
  onSettingsClick,
}) => {
  const getRAGColor = (status: string) => {
    switch (status) {
      case 'Red':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Amber':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Green':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      {/* Top Row: Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand:</span>
          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium">
            {activeBrand}
          </span>
        </div>
        
        <select
          value={marketplace}
          onChange={(e) => onMarketplaceChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="US">🇺🇸 US</option>
          <option value="UK">🇬🇧 UK</option>
          <option value="DE">🇩🇪 DE</option>
          <option value="FR">🇫🇷 FR</option>
          <option value="IT">🇮🇹 IT</option>
          <option value="ES">🇪🇸 ES</option>
          <option value="CA">🇨🇦 CA</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
          <option value="Last 90 days">Last 90 days</option>
          <option value="This month">This month</option>
          <option value="Last month">Last month</option>
        </select>

        <div className="ml-auto">
          <button
            onClick={onSettingsClick}
            className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPICard label="Spend" value={`$${kpiMetrics.spend.toFixed(2)}`} />
        <KPICard label="Sales" value={`$${kpiMetrics.sales.toFixed(2)}`} />
        <KPICard label="ACOS" value={`${kpiMetrics.acos.toFixed(1)}%`} />
        <KPICard label="ROAS" value={kpiMetrics.roas.toFixed(2)} />
        <KPICard label="CTR" value={`${kpiMetrics.ctr.toFixed(2)}%`} />
        <KPICard label="CVR" value={`${kpiMetrics.cvr.toFixed(2)}%`} />
        <KPICard label="TACOS" value={`${kpiMetrics.tacos.toFixed(1)}%`} />
        
        {/* RAG Badge */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="relative group">
            <button
              type="button"
              aria-describedby="rag-status-tooltip"
              className={`w-full px-3 py-2 rounded-lg ${getRAGColor(ragBadge.status)} font-medium text-center cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="text-xs opacity-70">Status</div>
              <div className="text-sm font-bold">{ragBadge.status}</div>
            </button>
            {/* Tooltip */}
            <div
              id="rag-status-tooltip"
              role="tooltip"
              className="absolute z-50 invisible group-hover:visible group-focus-within:visible bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg"
            >
              <div className="font-semibold mb-1">Drivers:</div>
              <ul className="list-disc list-inside space-y-1">
                {ragBadge.drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
    <div className="text-sm font-bold text-gray-900 dark:text-white">{value}</div>
  </div>
);
