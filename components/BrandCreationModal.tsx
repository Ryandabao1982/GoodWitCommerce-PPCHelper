import React, { useState, useEffect } from 'react';

interface BrandCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (brandName: string, budget?: number, asins?: string[]) => boolean | Promise<boolean>;
}

export const BrandCreationModal: React.FC<BrandCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [brandName, setBrandName] = useState('');
  const [budget, setBudget] = useState('');
  const [asinInput, setAsinInput] = useState('');
  const [asins, setAsins] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const MIN_LENGTH = 3;
  const MAX_LENGTH = 50;

  useEffect(() => {
    if (!isOpen) {
      setBrandName('');
      setBudget('');
      setAsinInput('');
      setAsins([]);
      setError(null);
      setValidationMessage('');
    }
  }, [isOpen]);

  // Real-time validation
  useEffect(() => {
    if (!brandName) {
      setValidationMessage('');
      return;
    }

    if (brandName.length < MIN_LENGTH) {
      setValidationMessage(`At least ${MIN_LENGTH} characters required`);
    } else if (brandName.length > MAX_LENGTH) {
      setValidationMessage(`Maximum ${MAX_LENGTH} characters allowed`);
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(brandName)) {
      setValidationMessage('Only letters, numbers, spaces, hyphens, and underscores allowed');
    } else {
      setValidationMessage('✓ Valid brand name');
    }
  }, [brandName]);

  const handleAddAsin = () => {
    const trimmedAsin = asinInput.trim().toUpperCase();
    
    if (!trimmedAsin) return;
    
    // Basic ASIN validation (should be 10 characters, alphanumeric)
    if (!/^B[A-Z0-9]{9}$/.test(trimmedAsin)) {
      setError('Invalid ASIN format. Should be 10 characters starting with B (e.g., B08N5WRWNW)');
      return;
    }
    
    if (asins.includes(trimmedAsin)) {
      setError('This ASIN has already been added');
      return;
    }
    
    setAsins([...asins, trimmedAsin]);
    setAsinInput('');
    setError(null);
  };

  const handleRemoveAsin = (asinToRemove: string) => {
    setAsins(asins.filter(a => a !== asinToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = brandName.trim();

    if (!trimmedName) {
      setError('Brand name cannot be empty');
      return;
    }

    if (trimmedName.length < MIN_LENGTH || trimmedName.length > MAX_LENGTH) {
      setError(`Brand name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      setError('Brand name contains invalid characters');
      return;
    }

    const budgetValue = budget ? parseFloat(budget) : undefined;
    if (budget && (isNaN(budgetValue) || budgetValue <= 0)) {
      setError('Budget must be a positive number');
      return;
    }

    const success = await onCreate(trimmedName, budgetValue, asins.length > 0 ? asins : undefined);
    if (success) {
      setBrandName('');
      setBudget('');
      setAsins([]);
      setAsinInput('');
      onClose();
    } else {
      setError('A brand with this name already exists');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Brand</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Brand Name */}
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter brand name..."
                  autoFocus
                  maxLength={MAX_LENGTH}
                />
                
                {/* Character count */}
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs">
                    {validationMessage && (
                      <span className={
                        validationMessage.startsWith('✓') 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }>
                        {validationMessage}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {brandName.length}/{MAX_LENGTH}
                  </span>
                </div>

                {/* Helper text */}
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Use a descriptive name to organize your research and campaigns
                </p>
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Budget (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Set an overall budget for this brand's campaigns
                </p>
              </div>

              {/* ASINs */}
              <div>
                <label htmlFor="asinInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product ASINs (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="asinInput"
                    value={asinInput}
                    onChange={(e) => setAsinInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAsin();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., B08N5WRWNW"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={handleAddAsin}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Add product ASINs for this brand (format: B + 9 alphanumeric characters)
                </p>
                
                {/* ASIN List */}
                {asins.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asins.map(asin => (
                      <span
                        key={asin}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {asin}
                        <button
                          type="button"
                          onClick={() => handleRemoveAsin(asin)}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={brandName.trim() && !validationMessage.startsWith('✓')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Create Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
