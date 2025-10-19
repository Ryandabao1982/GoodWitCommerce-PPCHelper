import { useEffect } from 'react';
import type { ViewType } from '../components/ViewSwitcher';

interface UseKeyboardShortcutsProps {
  onViewChange: (view: ViewType) => void;
  onCreateBrand?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = ({
  onViewChange,
  onCreateBrand,
  onSearch,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      if (!isCmdOrCtrl) return;

      // Prevent default browser behavior for these shortcuts
      const shortcuts: Record<string, () => void> = {
        '1': () => {
          event.preventDefault();
          onViewChange('research');
        },
        '2': () => {
          event.preventDefault();
          onViewChange('bank');
        },
        '3': () => {
          event.preventDefault();
          onViewChange('planner');
        },
        '4': () => {
          event.preventDefault();
          onViewChange('brand');
        },
        '5': () => {
          event.preventDefault();
          onViewChange('settings');
        },
        'b': () => {
          if (onCreateBrand) {
            event.preventDefault();
            onCreateBrand();
          }
        },
        'k': () => {
          if (onSearch) {
            event.preventDefault();
            onSearch();
          }
        },
      };

      const handler = shortcuts[event.key.toLowerCase()];
      if (handler) {
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onViewChange, onCreateBrand, onSearch]);
};

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', '1'], description: 'Go to Dashboard' },
  { keys: ['⌘', '2'], description: 'Go to Keyword Bank' },
  { keys: ['⌘', '3'], description: 'Go to Campaign Planner' },
  { keys: ['⌘', '4'], description: 'Go to Brand Analytics' },
  { keys: ['⌘', '5'], description: 'Go to Settings' },
  { keys: ['⌘', 'B'], description: 'Create New Brand' },
  { keys: ['⌘', 'K'], description: 'Quick Search' },
] as const;
