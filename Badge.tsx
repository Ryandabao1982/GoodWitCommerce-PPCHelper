
import React from 'react';
import type { BadgeType } from '../types';

interface BadgeProps {
  type: BadgeType;
}

const Badge: React.FC<BadgeProps> = ({ type }) => {
  const badgeStyles: Record<string, string> = {
    // Competition Levels
    Low: 'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-800 dark:text-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-800 dark:text-yellow-200',
    High: 'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-800 dark:text-red-200',
    // Keyword Types
    Broad: 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-800 dark:text-blue-200',
    Phrase: 'bg-indigo-100 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-800 dark:text-indigo-200',
    Exact: 'bg-purple-100 text-purple-800 ring-purple-600/20 dark:bg-purple-800 dark:text-purple-200',
    'Long-tail': 'bg-pink-100 text-pink-800 ring-pink-600/20 dark:bg-pink-800 dark:text-pink-200',
    // Keyword Categories
    Core: 'bg-teal-100 text-teal-800 ring-teal-600/20 dark:bg-teal-800 dark:text-teal-200',
    Opportunity: 'bg-cyan-100 text-cyan-800 ring-cyan-600/20 dark:bg-cyan-800 dark:text-cyan-200',
    Branded: 'bg-slate-200 text-slate-800 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-200',
    'Low-hanging Fruit': 'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-600/20 dark:bg-fuchsia-800 dark:text-fuchsia-200',
    Complementary: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-800 dark:text-amber-200',
    // Keyword Sources
    AI: 'bg-sky-100 text-sky-800 ring-sky-600/20 dark:bg-sky-800 dark:text-sky-200',
    Web: 'bg-gray-200 text-gray-800 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-200',
    // Status
    New: 'bg-lime-100 text-lime-800 ring-lime-600/20 dark:bg-lime-800 dark:text-lime-200',
  };

  const style = badgeStyles[type] || 'bg-gray-200 text-gray-800 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${style}`}>
      {type}
    </span>
  );
};

export { Badge };