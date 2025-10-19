import React from 'react';

interface QuickStartGuideProps {
  onCreateBrand: () => void;
  onGoToSettings: () => void;
  hasApiKey: boolean;
  hasBrand: boolean;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  onCreateBrand,
  onGoToSettings,
  hasApiKey,
  hasBrand,
}) => {
  const steps = [
    {
      id: 1,
      title: 'Set Up API Key',
      description: 'Configure your Google Gemini API key to enable AI-powered keyword research',
      icon: '🔑',
      completed: hasApiKey,
      action: onGoToSettings,
      actionLabel: hasApiKey ? 'Update API Key' : 'Configure Now',
    },
    {
      id: 2,
      title: 'Create Your Brand',
      description: 'Set up a brand workspace to organize your keyword research and campaigns',
      icon: '🏢',
      completed: hasBrand,
      action: onCreateBrand,
      actionLabel: hasBrand ? 'Create Another Brand' : 'Create Brand',
      disabled: !hasApiKey,
    },
    {
      id: 3,
      title: 'Start Researching',
      description: 'Enter seed keywords to generate comprehensive keyword suggestions',
      icon: '🔍',
      completed: false,
      actionLabel: 'Start Research',
      disabled: !hasApiKey || !hasBrand,
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Quick Start Guide
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Follow these steps to get started with Amazon PPC Keyword Genius
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
              step.completed
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : step.disabled
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 opacity-60'
                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
            }`}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  step.completed
                    ? 'bg-green-100 dark:bg-green-800'
                    : step.disabled
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-blue-100 dark:bg-blue-800'
                }`}
              >
                {step.completed ? '✓' : step.icon}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Step {index + 1}: {step.title}
                    {step.completed && (
                      <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                        ✓ Complete
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {step.action && (
                <button
                  onClick={step.action}
                  disabled={step.disabled}
                  className={`mt-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    step.disabled
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                      : step.completed
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {step.actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {completedSteps === steps.length && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                All Set!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                You're ready to start your keyword research journey. Enter a seed keyword above to begin!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
