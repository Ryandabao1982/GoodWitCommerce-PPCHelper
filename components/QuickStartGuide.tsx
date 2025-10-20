import React from 'react';
import { QuickStartPreview } from './QuickStartPreview';

interface QuickStartGuideProps {
  step: number;
  hasApiKey: boolean;
  hasBrand: boolean;
  hasSkippedApiStep: boolean;
  onConfigureApiKey: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onCreateBrand: () => void;
  onBack?: () => void;
  onClose: () => void;
  canClose: boolean;
}

const STEP_TITLES = ['Connect your API key', 'Create your first brand'];

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  step,
  hasApiKey,
  hasBrand,
  hasSkippedApiStep,
  onConfigureApiKey,
  onContinue,
  onSkip,
  onCreateBrand,
  onBack,
  onClose,
  canClose,
}) => {
  const isApiKeyStep = step === 0;
  const totalSteps = STEP_TITLES.length;

  return (
    <div className="mb-6 rounded-xl border border-blue-100 bg-white p-6 shadow-lg dark:border-blue-900/40 dark:bg-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                Quick start guide
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {STEP_TITLES[step]}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Step {step + 1} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={!canClose}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                canClose
                  ? 'text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  : 'cursor-not-allowed text-gray-300 dark:text-gray-600'
              }`}
            >
              Close
            </button>
          </div>

          <div className="mt-6">
            {isApiKeyStep ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                  Connect your Google Gemini API key to unlock AI-driven keyword research and
                  campaign planning.
                </div>

                {hasApiKey ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-200">
                      API key detected. You're ready to move on to brand setup.
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={onContinue}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Continue to brand setup
                      </button>
                      <button
                        onClick={onConfigureApiKey}
                        className="rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                      >
                        Review settings
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={onConfigureApiKey}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Configure API key
                      </button>
                      <button
                        onClick={onSkip}
                        className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Skip for now
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You can always add your API key later from Settings.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-4 text-sm text-purple-800 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-200">
                  Create a brand workspace to organize searches, save winning keywords, and share
                  campaigns.
                </div>

                {hasBrand ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-200">
                    Brand detected. You can close the guide or jump back to research.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={onCreateBrand}
                      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Create a brand
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your first brand keeps keywords, searches, and SOPs in one organized place.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    disabled={!canClose}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      canClose
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Close guide
                  </button>
                </div>

                {!canClose && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasSkippedApiStep
                      ? 'Create your first brand to finish quick start.'
                      : 'Connect your API key to finish quick start.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-xs lg:w-64 xl:w-72">
          <QuickStartPreview />
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;
