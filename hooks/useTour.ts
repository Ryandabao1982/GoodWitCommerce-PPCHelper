import { useState, useEffect } from 'react';
import { TourStep } from '../components/GuidedTour';

const TOUR_COMPLETED_KEY = 'tour-completed';

export const useTour = (
  onCreateBrand: () => void,
  onGoToSettings: () => void,
  onSwitchView: (view: string) => void,
  hasApiKey: boolean,
  hasBrand: boolean,
  hasKeywords: boolean
) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasTourCompleted, setHasTourCompleted] = useState(() => {
    try {
      const stored = localStorage.getItem(TOUR_COMPLETED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!hasTourCompleted && hasApiKey && hasBrand) {
      // Small delay to let UI render
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasTourCompleted, hasApiKey, hasBrand]);

  const steps: TourStep[] = [
    {
      title: 'Welcome to PPC Keyword Genius!',
      content:
        "Let's take a quick tour of the main features. This will help you get started with keyword research and campaign planning.",
      position: 'center',
    },
    {
      title: 'Brand Workspace',
      content:
        'Each brand has its own workspace where you can organize keywords, campaigns, and SOPs. Your current brand is shown in the top navigation.',
      target: '[data-tour="brand-selector"]',
      position: 'bottom',
      action: !hasBrand
        ? {
            label: 'Create Your First Brand',
            onClick: () => {
              setIsTourOpen(false);
              onCreateBrand();
            },
          }
        : undefined,
    },
    {
      title: 'Keyword Search',
      content:
        'Enter a seed keyword here to generate AI-powered keyword suggestions. You can use advanced filters to refine your search by search volume, competition, and more.',
      target: '[data-tour="keyword-input"]',
      position: 'bottom',
    },
    {
      title: 'View Modes',
      content:
        'Switch between Research (overview), Bank (keyword management), and Planner (campaign builder) views using these tabs.',
      target: '[data-tour="view-switcher"]',
      position: 'bottom',
    },
    {
      title: 'Keyword Bank',
      content:
        'The Keyword Bank shows all your keywords with sorting, filtering, and bulk actions. Select keywords to assign them to campaigns or export to CSV.',
      position: hasKeywords ? 'center' : 'center',
      action: hasKeywords
        ? {
            label: 'Go to Keyword Bank',
            onClick: () => {
              onSwitchView('bank');
            },
          }
        : undefined,
    },
    {
      title: 'Campaign Planner',
      content:
        'Build and organize your PPC campaigns with ad groups. Use templates to quickly structure campaigns based on best practices.',
      position: 'center',
      action: {
        label: 'Go to Campaign Planner',
        onClick: () => {
          onSwitchView('planner');
        },
      },
    },
    {
      title: "You're All Set!",
      content:
        'You now know the basics! Start by searching for keywords, organizing them in your Keyword Bank, and building campaigns in the Planner. You can always access Settings from the sidebar for API keys and preferences.',
      position: 'center',
    },
  ];

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  const handleCompleteTour = () => {
    setIsTourOpen(false);
    setHasTourCompleted(true);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const handleCloseTour = () => {
    setIsTourOpen(false);
    // Don't mark as completed if closed early, so user can restart
  };

  const resetTour = () => {
    setHasTourCompleted(false);
    try {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return {
    isTourOpen,
    hasTourCompleted,
    steps,
    handleStartTour,
    handleCompleteTour,
    handleCloseTour,
    resetTour,
  };
};
