import React from 'react';

const SelectBrandPrompt: React.FC<{ onCreateBrandClick: () => void; }> = ({ onCreateBrandClick }) => {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in-up">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/10 text-brand-primary ring-1 ring-inset ring-brand-primary/20 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v9a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v1H8V6a2 2 0 012-2z" />
                </svg>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome to Keyword Genius</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                To get started, create a "Brand" to store your keyword research. Each brand is a separate workspace for your products or clients.
            </p>
            <div className="mt-6">
                <button 
                    onClick={onCreateBrandClick}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-brand-primary hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-brand-primary transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Your First Brand
                </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">Already have a brand? Select it from the dropdown in the header.</p>
        </div>
    );
};

const BrandWelcomeState: React.FC<{ activeBrand: string }> = ({ activeBrand }) => {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Keyword Bank for <span className="text-brand-primary">{activeBrand}</span> is Empty
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                Enter a seed keyword above to begin your research. New keywords will be automatically saved to this brand's keyword bank.
            </p>
        </div>
    );
};

interface WelcomeMessageProps {
    activeBrand: string | null;
    onCreateBrandClick: () => void;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ activeBrand, onCreateBrandClick }) => {
    if (!activeBrand) {
        return <SelectBrandPrompt onCreateBrandClick={onCreateBrandClick} />;
    }
    return <BrandWelcomeState activeBrand={activeBrand} />;
};