import React, { useMemo } from 'react';
import type { KeywordData, KeywordCategory, CompetitionLevel, KeywordSource } from '../types';

interface DashboardProps {
  data: KeywordData[];
  parseVolume: (volume: string, getAverage: boolean) => number;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext }) => (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg flex items-start gap-4 border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-brand-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data, parseVolume }) => {

    const {
        totalKeywords,
        averageVolume,
        competitionCounts,
        categoryCounts,
        sourceCounts
    } = useMemo(() => {
        const total = data.length;
        const totalVolume = data.reduce((acc, kw) => acc + parseVolume(kw.searchVolume, true), 0);
        const avgVol = total > 0 ? Math.round(totalVolume / total) : 0;
        const compCounts: Record<CompetitionLevel, number> = { Low: 0, Medium: 0, High: 0 };
        const catCounts: Record<KeywordCategory, number> = { Core: 0, Opportunity: 0, Branded: 0, 'Low-hanging Fruit': 0, Complementary: 0 };
        const srcCounts: Record<KeywordSource, number> = { AI: 0, Web: 0 };

        for (const item of data) {
            compCounts[item.competition]++;
            catCounts[item.category]++;
            if(item.source) srcCounts[item.source]++;
        }

        return {
            totalKeywords: total,
            averageVolume: avgVol.toLocaleString(),
            competitionCounts: compCounts,
            categoryCounts: Object.entries(catCounts).filter(([, count]) => count > 0).sort((a,b) => b[1] - a[1]),
            sourceCounts: Object.entries(srcCounts).filter(([, count]) => count > 0)
        };
    }, [data, parseVolume]);

    const maxCategoryCount = Math.max(...categoryCounts.map(([, count]) => count), 0);
    const maxSourceCount = Math.max(...sourceCounts.map(([, count]) => count), 0);

    return (
        <div className="mb-8 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                    label="Total Keywords"
                    value={totalKeywords}
                />
                 <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    label="Avg. Search Volume"
                    value={averageVolume}
                    subtext="Estimated Monthly"
                />
                 <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    label="Competition"
                    value={`${competitionCounts.Low} Low · ${competitionCounts.Medium} Med · ${competitionCounts.High} High`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Category Breakdown</h3>
                    <div className="space-y-2">
                        {categoryCounts.map(([category, count]) => (
                            <div key={category} className="flex items-center text-xs">
                                <span className="w-32 truncate text-gray-700 dark:text-gray-300" title={category}>{category}</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 mx-2">
                                    <div 
                                        className="bg-brand-secondary h-4 rounded-full text-right"
                                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                                    >
                                        <span className="px-2 text-white font-semibold">{count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Source Breakdown</h3>
                     <div className="space-y-2">
                         {sourceCounts.map(([source, count]) => (
                            <div key={source} className="flex items-center text-xs">
                                <span className="w-10 text-gray-700 dark:text-gray-300">{source}</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 mx-2">
                                    <div 
                                        className="bg-brand-primary h-4 rounded-full text-right"
                                        style={{ width: `${(count / maxSourceCount) * 100}%` }}
                                    >
                                        <span className="px-2 text-gray-900 font-semibold">{count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};