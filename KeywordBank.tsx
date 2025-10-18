import React, { useState, useMemo } from 'react';
import type { KeywordData, Campaign } from '../types';
import { ResultsTable } from './ResultsTable';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { AssignToAdGroupModal } from './AssignToAdGroupModal';

interface KeywordBankProps {
  keywords: KeywordData[];
  searchedKeywords: string[];
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssignKeywords: (campaignId: string, adGroupId: string, keywords: string[]) => void;
  onDeleteSelected: () => void;
  onUnassignSelected: () => void;
  activeBrandName: string;
  selectedKeywords: Set<string>;
  onToggleSelect: (keyword: string, isSelected: boolean) => void;
  onToggleSelectAll: (isSelected: boolean) => void;
  onDragStart: (e: React.DragEvent, keyword: string) => void;
}

export const KeywordBank: React.FC<KeywordBankProps> = ({
  keywords,
  searchedKeywords,
  campaigns,
  onCampaignsChange,
  onAssignKeywords,
  onDeleteSelected,
  onUnassignSelected,
  activeBrandName,
  selectedKeywords,
  onToggleSelect,
  onToggleSelectAll,
  onDragStart,
}) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAssignSubmit = (targetCampaignId: string, targetAdGroupId: string) => {
    onAssignKeywords(targetCampaignId, targetAdGroupId, Array.from(selectedKeywords));
    setIsAssignModalOpen(false);
  };
  
  const allAssignedKeywords = useMemo(() => {
    const assigned = new Set<string>();
    campaigns.forEach(c => {
        c.adGroups.forEach(ag => {
            ag.keywords.forEach(kw => assigned.add(kw.toLowerCase()));
        });
    });
    return assigned;
  }, [campaigns]);

  const isUnassignEnabled = useMemo(() => {
    for (const selected of selectedKeywords) {
        if (allAssignedKeywords.has((selected as string).toLowerCase())) {
            return true;
        }
    }
    return false;
  }, [selectedKeywords, allAssignedKeywords]);
  
  if (keywords.length === 0) {
    return null; // Empty state is handled by WelcomeMessage in App.tsx
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {selectedKeywords.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedKeywords.size}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          onDelete={onDeleteSelected}
          onUnassign={onUnassignSelected}
          isUnassignEnabled={isUnassignEnabled}
        />
      )}
      <ResultsTable
        keywords={keywords}
        searchedKeywords={searchedKeywords}
        campaigns={campaigns}
        selectedKeywords={selectedKeywords}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        onDragStart={onDragStart}
      />
      <AssignToAdGroupModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        campaigns={campaigns}
        onCampaignsChange={onCampaignsChange}
        onAssign={handleAssignSubmit}
        selectedKeywordsCount={selectedKeywords.size}
      />
    </div>
  );
};