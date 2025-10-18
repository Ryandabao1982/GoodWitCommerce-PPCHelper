import React, { useState, useEffect, useRef } from 'react';

interface BrandCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (brandName: string) => boolean;
}

export const BrandCreationModal: React.FC<BrandCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setBrandName('');
      setError(null);
      // Focus the input field
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!brandName.trim()) {
      setError('Brand name cannot be empty.');
      return;
    }
    const success = onCreate(brandName);
    if (success) {
      // The parent component will close the modal on success
      setBrandName(''); 
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="brand-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Create a New Brand</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          A "Brand" is a workspace to store keywords for a specific product or client.
        </p>

        <div>
          <label htmlFor="brand-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Brand Name
          </label>
          <input
            ref={inputRef}
            id="brand-name-input"
            type="text"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 'My Awesome Product'"
            className={`w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition text-gray-900 dark:text-white ${
              error 
                ? 'border-red-500 ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-brand-primary'
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-bold text-gray-900 bg-brand-primary rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors"
          >
            Save Brand
          </button>
        </div>
      </div>
    </div>
  );
};