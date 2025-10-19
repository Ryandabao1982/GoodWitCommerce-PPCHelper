import React from 'react';
import { BrandState, RolloutTask } from '../../types';

interface BrandTabOverviewProps {
  brandState: BrandState;
  selectedPortfolio: string | null;
}

export const BrandTabOverview: React.FC<BrandTabOverviewProps> = ({ brandState, selectedPortfolio }) => {
  // Mock data for coverage map
  const campaignTypes = ['SP_EXACT', 'SP_BROAD', 'SP_PHRASE', 'SP_AUTO', 'SD', 'SB'];
  // Extract ASINs from brandState.campaigns
  const asins = Array.from(
    new Set(
      (brandState.campaigns || [])
        .flatMap(campaign => campaign.asins || (campaign.asin ? [campaign.asin] : []))
    )
  );
  
  // Mock coverage data
  const coverageData: Record<string, Record<string, { hasCoverage: boolean; hasOverlap: boolean }>> = {};
  campaignTypes.forEach(type => {
    coverageData[type] = {};
    asins.forEach(asin => {
      coverageData[type][asin] = {
        hasCoverage: Math.random() > 0.3,
        hasOverlap: Math.random() > 0.7,
      };
    });
  });

  // Mock lifecycle distribution
  const lifecycleData = [
    { stage: 'Discovery', count: 45, spend: 320 },
    { stage: 'Test', count: 28, spend: 450 },
    { stage: 'Performance', count: 62, spend: 1200 },
    { stage: 'SKAG', count: 15, spend: 800 },
    { stage: 'Archived', count: 8, spend: 50 },
  ];

  // Mock rollout tasks
  const rolloutTasks: RolloutTask[] = brandState.rolloutTasks || [
    { phase: 1, description: 'Research + Branded campaigns', completed: true },
    { phase: 1, description: 'Core ASIN coverage with Exact match', completed: true },
    { phase: 2, description: 'Competitor/PT campaigns', completed: true },
    { phase: 2, description: 'Expand to Broad/Phrase match', completed: false },
    { phase: 3, description: 'SKAG/Category expansion', completed: false },
    { phase: 3, description: 'Optimize bid strategies', completed: false },
    { phase: 4, description: 'SD remarketing setup', completed: false },
    { phase: 4, description: 'Audience targeting', completed: false },
    { phase: 5, description: 'Seasonal campaigns', completed: false },
    { phase: 5, description: 'Advanced automation', completed: false },
  ];

  const phaseProgress = [1, 2, 3, 4, 5].map(phase => {
    const phaseTasks = rolloutTasks.filter(t => t.phase === phase);
    const completedTasks = phaseTasks.filter(t => t.completed).length;
    return {
      phase,
      progress: phaseTasks.length > 0 ? (completedTasks / phaseTasks.length) * 100 : 0,
      total: phaseTasks.length,
      completed: completedTasks,
    };
  });

  return (
    <div className="space-y-6">
      {/* Coverage Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Coverage Map</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Campaign types vs ASINs</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Campaign Type</th>
                {asins.map(asin => (
                  <th key={asin} className="text-center p-2 font-semibold text-gray-700 dark:text-gray-300">{asin}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaignTypes.map(type => (
                <tr key={type} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{type}</td>
                  {asins.map(asin => {
                    const cell = coverageData[type][asin];
                    return (
                      <td key={asin} className="p-2 text-center">
                        <div className={`inline-block w-8 h-8 rounded ${
                          !cell.hasCoverage ? 'bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800' :
                          cell.hasOverlap ? 'bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800' :
                          'bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700'
                        }`} title={
                          !cell.hasCoverage ? 'Click to create shell campaign' :
                          cell.hasOverlap ? 'Click to apply negative keyword' :
                          'Covered'
                        }>
                          {!cell.hasCoverage && <span className="text-xs">+</span>}
                          {cell.hasOverlap && <span className="text-xs">⚠️</span>}
                          {cell.hasCoverage && !cell.hasOverlap && <span className="text-xs">✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Covered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Overlap/Cannibalization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Missing Coverage</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lifecycle Distribution</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Keywords by stage</span>
        </div>
        
        <div className="space-y-3">
          {lifecycleData.map((item, idx) => {
            const maxCount = Math.max(...lifecycleData.map(d => d.count));
            const percentage = (item.count / maxCount) * 100;
            
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.stage}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.count} keywords · ${item.spend}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-start px-2"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-semibold text-white">{item.count}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">Action Queues:</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            • Promote: 12 keywords ready (≥20 clicks + 1 sale)
            <br />
            • Negate: 8 keywords ready (≥15 clicks, 0 sales)
          </div>
        </div>
      </div>

      {/* Rollout Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rollout Tracker</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Phase 1 → 5 progress</span>
        </div>

        {/* Phase Progress Bars */}
        <div className="mb-6 space-y-2">
          {phaseProgress.map(({ phase, progress, completed, total }) => (
            <div key={phase}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phase {phase}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {completed}/{total} tasks
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-full rounded-full ${
                    progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {rolloutTasks.map((task, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-2 rounded ${
                task.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}>
                {task.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Phase {task.phase}
                  </span>
                  <span className={`text-sm ${
                    task.completed
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
