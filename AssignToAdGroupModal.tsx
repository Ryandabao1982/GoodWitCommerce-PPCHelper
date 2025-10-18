import React, { useState, useEffect, useRef } from 'react';
import type { Campaign, AdGroup } from '../types';

interface AssignToAdGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onCampaignsChange: (campaigns: Campaign[]) => void;
  onAssign: (campaignId: string, adGroupId: string) => void;
  selectedKeywordsCount: number;
}

export const AssignToAdGroupModal: React.FC<AssignToAdGroupModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onCampaignsChange,
  onAssign,
  selectedKeywordsCount
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>('');
  
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newAdGroupName, setNewAdGroupName] = useState('');

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingAdGroup, setIsCreatingAdGroup] = useState(false);
  
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  
  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedCampaignId(campaigns.length > 0 ? campaigns[0].id : '');
      setSelectedAdGroupId('');
      setNewCampaignName('');
      setNewAdGroupName('');
      setIsCreatingCampaign(false);
      setIsCreatingAdGroup(false);
    }
  }, [isOpen, campaigns]);

  useEffect(() => {
      // Auto-select first ad group when campaign changes
      if(selectedCampaign && selectedCampaign.adGroups.length > 0){
        setSelectedAdGroupId(selectedCampaign.adGroups[0].id);
      } else {
        setSelectedAdGroupId('');
      }
  }, [selectedCampaignId, campaigns]);

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;
    const newCampaign: Campaign = {
        id: `campaign-${Date.now()}`,
        name: newCampaignName.trim(),
        adGroups: [],
        projections: null
    };
    const newCampaigns = [...campaigns, newCampaign];
    onCampaignsChange(newCampaigns);
    setSelectedCampaignId(newCampaign.id);
    setIsCreatingCampaign(false);
    setNewCampaignName('');
  };

  const handleCreateAdGroup = () => {
    if (!newAdGroupName.trim() || !selectedCampaignId) return;
    const newAdGroup: AdGroup = {
        id: `adgroup-${Date.now()}`,
        name: newAdGroupName.trim(),
        keywords: []
    };
    const newCampaigns = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
            return { ...c, adGroups: [...c.adGroups, newAdGroup] };
        }
        return c;
    });
    onCampaignsChange(newCampaigns);
    setSelectedAdGroupId(newAdGroup.id);
    setIsCreatingAdGroup(false);
    setNewAdGroupName('');
  };
  
  const handleAssign = () => {
      if(selectedCampaignId && selectedAdGroupId) {
          onAssign(selectedCampaignId, selectedAdGroupId);
      }
  };
  
  const commonInputClass = "w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Keywords</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close modal">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Assigning <span className="font-bold text-brand-primary">{selectedKeywordsCount}</span> keyword{selectedKeywordsCount > 1 ? 's' : ''}. A keyword can only be in one ad group at a time.
        </p>

        <div className="space-y-4">
            {/* Campaign Selection */}
            <div>
                <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign</label>
                {isCreatingCampaign ? (
                    <div className="flex gap-2 mt-1">
                        <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} placeholder="New Campaign Name" className={commonInputClass} autoFocus />
                        <button onClick={handleCreateCampaign} className="px-3 py-2 text-sm bg-brand-primary text-gray-900 font-bold rounded-md">Save</button>
                        <button onClick={() => setIsCreatingCampaign(false)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                    </div>
                ) : (
                    <div className="flex gap-2 mt-1">
                        <select id="campaign-select" value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)} className={commonInputClass}>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={() => setIsCreatingCampaign(true)} className="px-3 py-2 text-sm bg-brand-secondary text-white rounded-md whitespace-nowrap">New</button>
                    </div>
                )}
            </div>

            {/* Ad Group Selection */}
            {selectedCampaignId && !isCreatingCampaign && (
                <div>
                    <label htmlFor="adgroup-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Group</label>
                    {isCreatingAdGroup ? (
                        <div className="flex gap-2 mt-1">
                            <input type="text" value={newAdGroupName} onChange={e => setNewAdGroupName(e.target.value)} placeholder="New Ad Group Name" className={commonInputClass} autoFocus />
                            <button onClick={handleCreateAdGroup} className="px-3 py-2 text-sm bg-brand-primary text-gray-900 font-bold rounded-md">Save</button>
                            <button onClick={() => setIsCreatingAdGroup(false)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                        </div>
                    ) : (
                         <div className="flex gap-2 mt-1">
                            <select id="adgroup-select" value={selectedAdGroupId} onChange={e => setSelectedAdGroupId(e.target.value)} className={commonInputClass} disabled={!selectedCampaign || selectedCampaign.adGroups.length === 0}>
                                {selectedCampaign && selectedCampaign.adGroups.length > 0 ? (
                                    selectedCampaign.adGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)
                                ) : (
                                    <option>No ad groups yet</option>
                                )}
                            </select>
                            <button onClick={() => setIsCreatingAdGroup(true)} className="px-3 py-2 text-sm bg-brand-secondary text-white rounded-md">New</button>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleAssign} disabled={!selectedCampaignId || !selectedAdGroupId} className="px-4 py-2 text-sm font-bold text-gray-900 bg-brand-primary rounded-md hover:bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed">Assign Keywords</button>
        </div>
      </div>
    </div>
  );
};