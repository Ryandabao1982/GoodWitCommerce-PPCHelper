import React, { useEffect, useState } from 'react';
import { ViewType } from './ViewSwitcher';
import { Tooltip } from './Tooltip';

interface SmartTabSuggestionProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  keywordCount: number;
  campaignCount: number;
  selectedKeywordsCount: number;
  hasRecentSearch: boolean;
  hasASINs: boolean;
}

interface SuggestionRule {
  condition: () => boolean;
  suggestedView: ViewType;
  message: string;
  icon: string;
  priority: number;
}

export const SmartTabSuggestion: React.FC<SmartTabSuggestionProps> = ({
  currentView,
  onViewChange,
  keywordCount,
  campaignCount,
  selectedKeywordsCount,
  hasRecentSearch,
  hasASINs,
}) => {
  const [suggestion, setSuggestion] = useState<SuggestionRule | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const suggestionRules: SuggestionRule[] = [
    {
      condition: () => currentView === 'research' && keywordCount > 0 && !dismissed.has('research-to-bank'),
      suggestedView: 'bank',
      message: 'Review and organize your keywords in the Keyword Bank',
      icon: '🏦',
      priority: 8,
    },
    {
      condition: () => currentView === 'bank' && keywordCount > 20 && campaignCount === 0 && !dismissed.has('bank-to-planner'),
      suggestedView: 'planner',
      message: 'Create campaigns to organize your keywords',
      icon: '📋',
      priority: 9,
    },
    {
      condition: () => currentView === 'bank' && selectedKeywordsCount > 0 && campaignCount > 0 && !dismissed.has('bank-assign'),
      suggestedView: 'planner',
      message: `Assign ${selectedKeywordsCount} selected keyword${selectedKeywordsCount !== 1 ? 's' : ''} to campaigns`,
      icon: '📋',
      priority: 10,
    },
    {
      condition: () => currentView === 'planner' && campaignCount > 0 && keywordCount > 0 && !dismissed.has('planner-to-bank'),
      suggestedView: 'bank',
      message: 'Add more keywords to your campaigns',
      icon: '🏦',
      priority: 7,
    },
    {
      condition: () => currentView === 'research' && keywordCount === 0 && hasRecentSearch && !dismissed.has('research-search'),
      suggestedView: 'research',
      message: 'Try a different seed keyword to find more results',
      icon: '🔍',
      priority: 6,
    },
    {
      condition: () => currentView === 'bank' && keywordCount > 50 && !dismissed.has('bank-to-brand'),
      suggestedView: 'brand',
      message: 'View advanced brand insights and performance tracking',
      icon: '🎯',
      priority: 5,
    },
    {
      condition: () => hasASINs && keywordCount === 0 && currentView === 'brand' && !dismissed.has('brand-asins'),
      suggestedView: 'brand',
      message: 'Research keywords for your ASINs',
      icon: '📦',
      priority: 8,
    },
    {
      condition: () => currentView === 'planner' && campaignCount > 3 && !dismissed.has('planner-export'),
      suggestedView: 'planner',
      message: 'Export your campaign structure for Amazon Ads',
      icon: '📥',
      priority: 4,
    },
  ];

  useEffect(() => {
    // Find the highest priority suggestion that meets its condition
    const validSuggestions = suggestionRules
      .filter(rule => rule.condition())
      .sort((a, b) => b.priority - a.priority);

    if (validSuggestions.length > 0) {
      setSuggestion(validSuggestions[0]);
    } else {
      setSuggestion(null);
    }
  }, [currentView, keywordCount, campaignCount, selectedKeywordsCount, hasRecentSearch, hasASINs, dismissed]);

  const handleDismiss = () => {
    if (suggestion) {
      const key = `${currentView}-${suggestion.suggestedView}`;
      setDismissed(prev => new Set([...prev, key]));
      setSuggestion(null);
    }
  };

  const handleAccept = () => {
    if (suggestion && suggestion.suggestedView !== currentView) {
      onViewChange(suggestion.suggestedView);
      handleDismiss();
    }
  };

  if (!suggestion || suggestion.suggestedView === currentView) {
    return null;
  }

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{suggestion.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              💡 Smart Suggestion
            </h4>
            <Tooltip content="AI-powered workflow suggestions based on your activity">
              <span className="text-xs text-gray-500 dark:text-gray-400 cursor-help">ℹ️</span>
            </Tooltip>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {suggestion.message}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            Go
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility hook to track user workflow patterns
export const useWorkflowTracking = () => {
  const [workflowState, setWorkflowState] = useState({
    lastSearchTime: 0,
    searchCount: 0,
    keywordsAddedCount: 0,
    campaignsCreatedCount: 0,
    lastViewChange: Date.now(),
    viewDuration: {} as Record<ViewType, number>,
  });

  const trackSearch = () => {
    setWorkflowState(prev => ({
      ...prev,
      lastSearchTime: Date.now(),
      searchCount: prev.searchCount + 1,
    }));
  };

  const trackKeywordsAdded = (count: number) => {
    setWorkflowState(prev => ({
      ...prev,
      keywordsAddedCount: prev.keywordsAddedCount + count,
    }));
  };

  const trackCampaignCreated = () => {
    setWorkflowState(prev => ({
      ...prev,
      campaignsCreatedCount: prev.campaignsCreatedCount + 1,
    }));
  };

  const trackViewChange = (view: ViewType) => {
    const now = Date.now();
    const duration = now - workflowState.lastViewChange;
    
    setWorkflowState(prev => ({
      ...prev,
      lastViewChange: now,
      viewDuration: {
        ...prev.viewDuration,
        [view]: (prev.viewDuration[view] || 0) + duration,
      },
    }));
  };

  return {
    workflowState,
    trackSearch,
    trackKeywordsAdded,
    trackCampaignCreated,
    trackViewChange,
  };
};
