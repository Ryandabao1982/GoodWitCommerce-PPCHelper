import React, { useState, useRef, useEffect } from 'react';

interface BrandSelectorProps {
  brands: string[];
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
  onOpenCreateBrandModal: () => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ brands, activeBrand, onSelectBrand, onOpenCreateBrandModal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (brand: string) => {
        onSelectBrand(brand);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v9a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v1H8V6a2 2 0 012-2z" />
                </svg>
                <span className="font-semibold text-gray-800 dark:text-white truncate max-w-[150px]">{activeBrand || 'Select a Brand'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {brands.map(brand => (
                            <li key={brand} role="none">
                                <button
                                    onClick={() => handleSelect(brand)}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                        activeBrand === brand
                                            ? 'bg-brand-secondary/10 dark:bg-brand-secondary/30 font-medium text-brand-secondary dark:text-white'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    role="menuitem"
                                >
                                    {brand}
                                </button>
                            </li>
                        ))}
                         {brands.length > 0 && <li className="border-t border-gray-200 dark:border-gray-700 my-1" role="separator"></li>}
                        <li role="none">
                            <button
                                onClick={() => { onOpenCreateBrandModal(); setIsOpen(false); }}
                                className="block w-full text-left px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-700"
                                role="menuitem"
                            >
                                + Add New Brand
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

interface DarkModeToggleProps {
    isDarkMode: boolean;
    onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-brand-primary transition-colors"
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
        >
            {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
};

interface HeaderProps {
  onMenuClick: () => void;
  brands: string[];
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
  onOpenCreateBrandModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, brands, activeBrand, onSelectBrand, onOpenCreateBrandModal, isDarkMode, onToggleDarkMode }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5L5 12l1.5-1.5L10.5 14l6.5-6.5L18.5 9l-8 8.5z"/>
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Amazon PPC Keyword Genius</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Keyword Research & Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            <div className="hidden lg:block">
                 <BrandSelector 
                    brands={brands} 
                    activeBrand={activeBrand} 
                    onSelectBrand={onSelectBrand} 
                    onOpenCreateBrandModal={onOpenCreateBrandModal} 
                />
            </div>
            <div className="lg:hidden">
                <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
                aria-label="Open sidebar"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};