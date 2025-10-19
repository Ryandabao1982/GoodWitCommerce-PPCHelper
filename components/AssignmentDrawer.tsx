/**
 * Assignment Drawer Component
 * Recommends campaign assignments for keywords based on lifecycle and intent
 */

import React, { useState, useMemo } from 'react';
import type {
  KeywordIntent,
  KeywordCategory,
  LifecycleState,
  CampaignType,
  TargetingType,
  CampaignTheme,
  MatchType,
} from '../types';

interface AssignmentRecommendation {
  campaignType: CampaignType;
  targeting: TargetingType;
  theme: CampaignTheme;
  phase: number;
  matchType: MatchType;
  campaignName: string;
  adGroupSuggestion: string;
  reasoning: string;
  baseBid?: number;
  placementTos?: number;
  placementPp?: number;
}

interface KeywordForAssignment {
  keywordId: string;
  keyword: string;
  intent?: KeywordIntent;
  category?: KeywordCategory;
  lifecycleState: LifecycleState;
  cpcMax?: number;
}

interface AssignmentDrawerProps {
  keywords: KeywordForAssignment[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignments: Array<{
    keywordId: string;
    campaignName: string;
    adGroup: string;
    matchType: MatchType;
    bid: number;
    placementTos: number;
    placementPp: number;
  }>) => void;
  existingCampaigns: Array<{ id: string; name: string }>;
}

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
  keywords,
  isOpen,
  onClose,
  onAssign,
  existingCampaigns,
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set(keywords.map(k => k.keywordId)));
  const [customBidMultiplier, setCustomBidMultiplier] = useState(1.0);

  // Generate recommendations for selected keywords
  const recommendations = useMemo(() => {
    return keywords
      .filter(k => selectedKeywords.has(k.keywordId))
      .map(kw => {
        const rec = generateRecommendation(kw);
        return {
          ...kw,
          recommendation: rec,
        };
      });
  }, [keywords, selectedKeywords]);

  const handleAssign = () => {
    const assignments = recommendations.map(r => ({
      keywordId: r.keywordId,
      campaignName: r.recommendation.campaignName,
      adGroup: r.recommendation.adGroupSuggestion,
      matchType: r.recommendation.matchType,
      bid: (r.recommendation.baseBid || r.cpcMax || 1.0) * customBidMultiplier,
      placementTos: r.recommendation.placementTos || 0.3,
      placementPp: r.recommendation.placementPp || 0.2,
    }));

    onAssign(assignments);
    onClose();
  };

  const toggleKeyword = (keywordId: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keywordId)) {
      newSelected.delete(keywordId);
    } else {
      newSelected.add(keywordId);
    }
    setSelectedKeywords(newSelected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Campaign Assignment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI-powered recommendations based on rollout phases
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Bid Multiplier Control */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bid Multiplier: {customBidMultiplier.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={customBidMultiplier}
              onChange={(e) => setCustomBidMultiplier(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Conservative (0.5x)</span>
              <span>Aggressive (2.0x)</span>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.keywordId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedKeywords.has(rec.keywordId)}
                      onChange={() => toggleKeyword(rec.keywordId)}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {rec.keyword}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          {rec.lifecycleState}
                        </span>
                        {rec.intent && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                            {rec.intent} Intent
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          Phase {rec.recommendation.phase}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Campaign Recommendation */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      📋 Campaign
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {rec.recommendation.campaignName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {rec.recommendation.campaignType} • {rec.recommendation.targeting} • {rec.recommendation.theme}
                    </div>
                  </div>

                  {/* Ad Group */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      📁 Ad Group
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {rec.recommendation.adGroupSuggestion}
                    </div>
                  </div>

                  {/* Match Type & Bid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        🎯 Match Type
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {rec.recommendation.matchType}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        💰 Bid
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        ${((rec.recommendation.baseBid || rec.cpcMax || 1.0) * customBidMultiplier).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Placements */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        📍 Top of Search
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        +{((rec.recommendation.placementTos || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        📍 Product Pages
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        +{((rec.recommendation.placementPp || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      💡 {rec.recommendation.reasoning}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAssign}
              disabled={selectedKeywords.size === 0}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              Assign {selectedKeywords.size} Keyword{selectedKeywords.size !== 1 ? 's' : ''}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate recommendation
function generateRecommendation(kw: KeywordForAssignment): AssignmentRecommendation {
  const intent = kw.intent || 'Mid';
  const category = kw.category || 'Generic';
  const state = kw.lifecycleState;

  // Simplified recommendation logic (would use plannerService in real implementation)
  if (state === 'Discovery' || state === 'Test') {
    if (category === 'Brand' || category === 'Branded') {
      return {
        campaignType: 'SP',
        targeting: 'PHRASE',
        theme: 'BRANDED',
        phase: 1,
        matchType: 'PHRASE',
        campaignName: 'SP_PHRASE_BRANDED_Research',
        adGroupSuggestion: 'Brand Defense',
        reasoning: 'Branded keywords start with phrase match for protection',
        baseBid: kw.cpcMax ? kw.cpcMax * 1.0 : 1.0,
        placementTos: 0.35,
        placementPp: 0.25,
      };
    }
    return {
      campaignType: 'SP',
      targeting: 'AUTO',
      theme: 'RESEARCH',
      phase: 1,
      matchType: 'BROAD',
      campaignName: 'SP_AUTO_Research',
      adGroupSuggestion: 'Auto Targeting',
      reasoning: 'Discovery phase uses auto targeting for testing',
      baseBid: kw.cpcMax ? kw.cpcMax * 0.8 : 0.8,
      placementTos: 0.25,
      placementPp: 0.15,
    };
  }

  if (state === 'Performance' || state === 'SKAG') {
    const isHighIntent = intent === 'High';
    return {
      campaignType: isHighIntent ? 'SB' : 'SP',
      targeting: 'EXACT',
      theme: category === 'Brand' || category === 'Branded' ? 'BRANDED' : 'PERFORMANCE',
      phase: state === 'SKAG' ? 3 : 2,
      matchType: 'EXACT',
      campaignName: state === 'SKAG' 
        ? `SP_EXACT_SKAG_${kw.keyword.substring(0, 20)}`
        : `${isHighIntent ? 'SB' : 'SP'}_EXACT_Performance`,
      adGroupSuggestion: state === 'SKAG' ? kw.keyword : 'Exact Match',
      reasoning: state === 'SKAG' 
        ? 'Top performer isolated in SKAG for precise control'
        : 'Proven keyword moved to exact match for efficiency',
      baseBid: kw.cpcMax ? kw.cpcMax * 1.2 : 1.2,
      placementTos: isHighIntent ? 0.55 : 0.35,
      placementPp: isHighIntent ? 0.35 : 0.25,
    };
  }

  // Default
  return {
    campaignType: 'SP',
    targeting: 'BROAD',
    theme: 'RESEARCH',
    phase: 1,
    matchType: 'BROAD',
    campaignName: 'SP_BROAD_Research',
    adGroupSuggestion: 'Research',
    reasoning: 'Default research assignment',
    baseBid: kw.cpcMax || 1.0,
    placementTos: 0.3,
    placementPp: 0.2,
  };
}
