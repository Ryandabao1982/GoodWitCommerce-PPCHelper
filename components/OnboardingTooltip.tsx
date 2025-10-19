import React, { useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

export type OnboardingStep = 
  | 'create-brand'
  | 'search-keywords'
  | 'keyword-bank'
  | 'campaign-planner'
  | 'export'
  | 'brand-tab'
  | 'asin-management';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  children: React.ReactNode;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onComplete?: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  step,
  children,
  title,
  description,
  position = 'bottom',
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completedSteps = loadFromLocalStorage<OnboardingStep[]>('ppcGeniusOnboardingCompleted', []);
    const isCompleted = completedSteps.includes(step);
    setHasCompleted(isCompleted);
    
    // Show tooltip after a short delay if not completed
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = () => {
    const completedSteps = loadFromLocalStorage<OnboardingStep[]>('ppcGeniusOnboardingCompleted', []);
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
      saveToLocalStorage('ppcGeniusOnboardingCompleted', completedSteps);
    }
    setIsVisible(false);
    setHasCompleted(true);
    onComplete?.();
  };

  if (hasCompleted || !isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      {children}
      <div
        className={`absolute z-50 ${getPositionClasses(position)} animate-pulse-slow`}
        style={{ minWidth: '280px', maxWidth: '320px' }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-xl p-4 border-2 border-blue-400">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">{title}</h4>
              <p className="text-xs leading-relaxed opacity-90">{description}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleComplete}
              className="flex-1 px-3 py-1.5 bg-white text-blue-600 text-xs font-semibold rounded hover:bg-blue-50 transition-colors"
            >
              Got it!
            </button>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded transition-colors"
            >
              Skip
            </button>
          </div>
          {/* Arrow pointer */}
          <div className={`absolute ${getArrowClasses(position)}`} />
        </div>
      </div>
    </div>
  );
};

function getPositionClasses(position: 'top' | 'bottom' | 'left' | 'right'): string {
  switch (position) {
    case 'top':
      return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2 mt-3';
    case 'left':
      return 'right-full top-1/2 -translate-y-1/2 mr-3';
    case 'right':
      return 'left-full top-1/2 -translate-y-1/2 ml-3';
  }
}

function getArrowClasses(position: 'top' | 'bottom' | 'left' | 'right'): string {
  switch (position) {
    case 'top':
      return 'top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-600';
    case 'bottom':
      return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600';
    case 'left':
      return 'left-full top-1/2 -translate-y-1/2 -ml-1 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-blue-600';
    case 'right':
      return 'right-full top-1/2 -translate-y-1/2 -mr-1 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-blue-600';
  }
}

interface OnboardingManagerProps {
  onComplete?: () => void;
}

/**
 * Central onboarding manager that tracks completion and can reset progress
 */
export const OnboardingManager: React.FC<OnboardingManagerProps> = ({ onComplete }) => {
  const resetOnboarding = () => {
    saveToLocalStorage('ppcGeniusOnboardingCompleted', []);
    window.location.reload();
  };

  const getCompletedSteps = (): OnboardingStep[] => {
    return loadFromLocalStorage<OnboardingStep[]>('ppcGeniusOnboardingCompleted', []);
  };

  const allSteps: OnboardingStep[] = [
    'create-brand',
    'search-keywords',
    'keyword-bank',
    'campaign-planner',
    'export',
    'brand-tab',
    'asin-management',
  ];

  const completedSteps = getCompletedSteps();
  const completionPercentage = Math.round((completedSteps.length / allSteps.length) * 100);
  const isComplete = completedSteps.length === allSteps.length;

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return null; // This is a utility component, doesn't render anything
};

/**
 * Hook to check onboarding status
 */
export const useOnboardingStatus = () => {
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    const steps = loadFromLocalStorage<OnboardingStep[]>('ppcGeniusOnboardingCompleted', []);
    setCompletedSteps(steps);
  }, []);

  const isStepCompleted = (step: OnboardingStep) => completedSteps.includes(step);
  
  const resetOnboarding = () => {
    saveToLocalStorage('ppcGeniusOnboardingCompleted', []);
    setCompletedSteps([]);
  };

  return {
    completedSteps,
    isStepCompleted,
    resetOnboarding,
    completionPercentage: Math.round((completedSteps.length / 7) * 100),
  };
};
