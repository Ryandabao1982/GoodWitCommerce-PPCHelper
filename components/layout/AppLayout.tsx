import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { DesktopSidebar } from '../DesktopSidebar';
import { Footer } from '../Footer';
import { ScrollToTopButton } from '../ScrollToTopButton';
import { BottomNavigation } from '../BottomNavigation';
import type { ViewType } from '../ViewSwitcher';

interface AppLayoutProps {
  brands: string[];
  activeBrand: string | null;
  currentView: ViewType;
  isDarkMode: boolean;
  isBusy: boolean;
  recentSearches: string[];
  onToggleDarkMode: () => void;
  onSelectBrand: (brand: string) => void;
  onDeleteBrand: (brand: string) => void;
  onCreateBrandClick: () => void;
  onViewChange: (view: ViewType) => void;
  onHistoryItemClick: (keyword: string) => void;
  onAuthChange: (user: unknown) => void;
  children: React.ReactNode;
  enableBottomNavigation?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  brands,
  activeBrand,
  currentView,
  isDarkMode,
  isBusy,
  recentSearches,
  onToggleDarkMode,
  onSelectBrand,
  onDeleteBrand,
  onCreateBrandClick,
  onViewChange,
  onHistoryItemClick,
  onAuthChange,
  children,
  enableBottomNavigation = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  const handleSelectBrand = useCallback(
    (brand: string) => {
      onSelectBrand(brand);
      setIsSidebarOpen(false);
    },
    [onSelectBrand]
  );

  const handleHistoryItemClick = useCallback(
    (keyword: string) => {
      onHistoryItemClick(keyword);
      setIsSidebarOpen(false);
    },
    [onHistoryItemClick]
  );

  useEffect(() => {
    const toggleVisibility = () => {
      setIsScrollButtonVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        recentSearches={recentSearches}
        onHistoryItemClick={handleHistoryItemClick}
        brands={brands}
        onSelectBrand={handleSelectBrand}
        onDeleteBrand={onDeleteBrand}
        onCreateBrandClick={onCreateBrandClick}
        isLoading={isBusy}
        currentView={currentView}
        onViewChange={onViewChange}
      />

      <DesktopSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        brands={brands}
        activeBrand={activeBrand}
        onSelectBrand={handleSelectBrand}
        onCreateBrandClick={onCreateBrandClick}
        recentSearches={recentSearches}
        onHistoryItemClick={handleHistoryItemClick}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          brands={brands}
          activeBrand={activeBrand}
          onSelectBrand={handleSelectBrand}
          onOpenCreateBrandModal={onCreateBrandClick}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          onAuthChange={onAuthChange}
        />

        <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 pb-20 md:pb-6">{children}</main>
        <Footer />
      </div>

      <ScrollToTopButton isVisible={isScrollButtonVisible} onClick={scrollToTop} />

      {enableBottomNavigation && activeBrand && (
        <BottomNavigation currentView={currentView} onViewChange={onViewChange} />
      )}
    </div>
  );
};
