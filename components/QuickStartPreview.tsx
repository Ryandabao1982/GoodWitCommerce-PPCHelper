import React from 'react';

const sampleKeywords = [
  {
    keyword: 'ergonomic office chair',
    volume: '12.4K',
    trend: '↗︎ +18%',
    cpc: '$1.20',
  },
  {
    keyword: 'lumbar support cushion',
    volume: '5.1K',
    trend: '↗︎ +9%',
    cpc: '$0.87',
  },
  {
    keyword: 'mesh desk chair',
    volume: '8.6K',
    trend: '→ stable',
    cpc: '$1.05',
  },
];

export const QuickStartPreview: React.FC = () => {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-4 shadow-sm dark:border-blue-900/40 dark:from-gray-800 dark:to-gray-900">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
        Preview
      </h3>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        See the kind of insights you unlock once you connect your key and create a brand.
      </p>

      <div className="mt-4 space-y-3">
        {sampleKeywords.map((item, index) => (
          <div
            key={item.keyword}
            className="rounded-lg bg-white/80 p-3 shadow-sm ring-1 ring-inset ring-blue-100 transition hover:shadow-md dark:bg-gray-800/80 dark:ring-blue-900/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {index + 1}. {item.keyword}
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                {item.trend}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Volume: {item.volume}</span>
              <span>CPC: {item.cpc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-blue-600/10 p-3 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
        Run your first search to populate full keyword intelligence, performance signals, and
        campaign-ready exports.
      </div>
    </div>
  );
};

export default QuickStartPreview;
