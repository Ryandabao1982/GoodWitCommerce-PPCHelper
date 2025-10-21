import React from 'react';

interface SearchFeedbackProps {
  isSearching: boolean;
  searchKeyword?: string;
  onCancel?: () => void;
}

export const SearchFeedback: React.FC<SearchFeedbackProps> = ({
  isSearching,
  searchKeyword,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    { label: 'Analyzing seed keyword', icon: '🔍', duration: 3000 },
    { label: 'Generating keyword variations', icon: '✨', duration: 5000 },
    { label: 'Calculating metrics & relevance', icon: '📊', duration: 4000 },
    { label: 'Finalizing results', icon: '✅', duration: 2000 },
  ];

  React.useEffect(() => {
    if (!isSearching) {
      setCurrentStep(0);
      return;
    }

    const intervals: ReturnType<typeof setTimeout>[] = [];
    let cumulativeTime = 0;

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
      }, cumulativeTime);
      cumulativeTime += step.duration;
      intervals.push(timeout);
    });

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [isSearching, steps]);

  if (!isSearching) return null;

  const currentStepData = steps[currentStep] || steps[0];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4 animate-bounce">{currentStepData.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Researching Keywords...
          </h3>
          {searchKeyword && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyzing "
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {searchKeyword}
              </span>
              "
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>{currentStepData.label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2 mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center text-sm ${
                index <= currentStep
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              <div className="w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 transition-colors">
                {index < currentStep ? (
                  <span className="text-green-600 dark:text-green-400">✓</span>
                ) : index === currentStep ? (
                  <span className="animate-pulse">{step.icon}</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
              </div>
              <span className={index === currentStep ? 'font-medium' : ''}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Info & Cancel */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            ⏱️ This typically takes 15-30 seconds
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
            >
              Cancel Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface SearchSuccessToastProps {
  keyword: string;
  resultCount: number;
  onDismiss: () => void;
  autoHideDelay?: number;
}

export const SearchSuccessToast: React.FC<SearchSuccessToastProps> = ({
  keyword,
  resultCount,
  onDismiss,
  autoHideDelay = 5000,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, autoHideDelay);
    return () => clearTimeout(timer);
  }, [onDismiss, autoHideDelay]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md">
        <div className="text-2xl">✅</div>
        <div className="flex-1">
          <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
            Search Complete!
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Found <span className="font-bold">{resultCount} keywords</span> for "
            <span className="font-semibold">{keyword}</span>"
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            → Viewing results in Keyword Bank
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
