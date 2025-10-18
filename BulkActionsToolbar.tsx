import React from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onOpenAssignModal: () => void;
  onDelete: () => void;
  onUnassign: () => void;
  isUnassignEnabled: boolean;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ 
  selectedCount, 
  onOpenAssignModal, 
  onDelete,
  onUnassign,
  isUnassignEnabled
}) => {
  return (
    <div className="bg-brand-secondary/90 backdrop-blur-sm text-white p-3 rounded-lg flex justify-between items-center shadow-lg animate-slide-down">
      <p className="font-semibold">{selectedCount.toLocaleString()} keyword{selectedCount > 1 ? 's' : ''} selected</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAssignModal}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
          </svg>
          Assign
        </button>
         <button
          onClick={onUnassign}
          disabled={!isUnassignEnabled}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
          title={isUnassignEnabled ? "Remove selected keywords from their ad group" : "No selected keywords are currently assigned"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Unassign
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/80 hover:bg-red-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};