
import React from 'react';

interface RelevanceBarProps {
  score: number; // Score from 1 to 10
}

export const RelevanceBar: React.FC<RelevanceBarProps> = ({ score }) => {
  const widthPercentage = (score / 10) * 100;
  let barColorClass = 'bg-red-500';

  if (score > 4) barColorClass = 'bg-yellow-500';
  if (score > 7) barColorClass = 'bg-green-500';

  return (
    <div className="flex items-center">
      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mr-2">
        <div
          className={`h-2.5 rounded-full ${barColorClass}`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{score}/10</span>
    </div>
  );
};