
import React from 'react';
import type { CompetitionLevel } from '../types';

interface CompetitionIndicatorProps {
  level: CompetitionLevel;
}

const levelConfig: Record<CompetitionLevel, { text: string; textColor: string; iconColor: string; paths: { d: string; opacity: string }[] }> = {
  Low: {
    text: 'Low',
    textColor: 'text-green-700 dark:text-green-300',
    iconColor: 'text-green-500 dark:text-green-400',
    paths: [
      { d: 'M7 14h2v6H7v-6z', opacity: '1' },
      { d: 'M11 10h2v10h-2V10z', opacity: '0.3' },
      { d: 'M15 6h2v14h-2V6z', opacity: '0.3' },
    ]
  },
  Medium: {
    text: 'Medium',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    paths: [
      { d: 'M7 14h2v6H7v-6z', opacity: '1' },
      { d: 'M11 10h2v10h-2V10z', opacity: '1' },
      { d: 'M15 6h2v14h-2V6z', opacity: '0.3' },
    ]
  },
  High: {
    text: 'High',
    textColor: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500 dark:text-red-400',
    paths: [
      { d: 'M7 14h2v6H7v-6z', opacity: '1' },
      { d: 'M11 10h2v10h-2V10z', opacity: '1' },
      { d: 'M15 6h2v14h-2V6z', opacity: '1' },
    ]
  },
};

export const CompetitionIndicator: React.FC<CompetitionIndicatorProps> = ({ level }) => {
  const config = levelConfig[level];

  if (!config) {
    // Fallback for any unexpected values
    return <span>{level}</span>;
  }

  return (
    <div className="flex items-center">
      <svg
        className={`w-5 h-5 mr-1.5 ${config.iconColor}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        aria-label={`Competition level: ${level}`}
      >
        <title>Competition: {level}</title>
        {config.paths.map((path, i) => (
          <path key={i} d={path.d} opacity={path.opacity} />
        ))}
      </svg>
      <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
    </div>
  );
};