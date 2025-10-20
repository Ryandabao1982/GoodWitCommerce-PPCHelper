import type { ViewType } from '../types';

export interface NavigationItem {
  id: ViewType;
  label: string;
  icon: string;
  shortcut?: string;
  mobileLabel?: string;
  requiresBrand?: boolean;
  requiresKeywords?: boolean;
  brandTooltip?: string;
  keywordsTooltip?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'research',
    label: 'Dashboard',
    icon: '📊',
    shortcut: '⌘1',
    mobileLabel: 'Dashboard',
  },
  {
    id: 'bank',
    label: 'Keyword Bank',
    icon: '🏦',
    shortcut: '⌘2',
    mobileLabel: 'Keywords',
    requiresBrand: true,
    brandTooltip: 'Select or create a brand to manage keywords.',
  },
  {
    id: 'planner',
    label: 'Campaign Planner',
    icon: '📋',
    shortcut: '⌘3',
    mobileLabel: 'Campaigns',
    requiresBrand: true,
    requiresKeywords: true,
    brandTooltip: 'Select or create a brand to plan campaigns.',
    keywordsTooltip: 'Add keywords to plan campaigns.',
  },
  {
    id: 'brand',
    label: 'Brand Analytics',
    icon: '🎯',
    shortcut: '⌘4',
    mobileLabel: 'Brand',
    requiresBrand: true,
    brandTooltip: 'Select or create a brand to view analytics.',
  },
  {
    id: 'sop',
    label: 'SOP Library',
    icon: '📚',
    shortcut: '⌘5',
    mobileLabel: 'SOPs',
    requiresBrand: true,
    brandTooltip: 'Select or create a brand to access SOPs.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    shortcut: '⌘6',
    mobileLabel: 'Settings',
  },
];

export interface NavigationContextState {
  hasActiveBrand: boolean;
  hasKeywords: boolean;
}

export const isViewAccessible = (view: ViewType, context: NavigationContextState): boolean => {
  const item = NAVIGATION_ITEMS.find((entry) => entry.id === view);
  if (!item) {
    return true;
  }

  if (item.requiresBrand && !context.hasActiveBrand) {
    return false;
  }

  if (item.requiresKeywords && !context.hasKeywords) {
    return false;
  }

  return true;
};

export const getNavigationTooltip = (
  item: NavigationItem,
  context: NavigationContextState
): string | undefined => {
  if (item.requiresBrand && !context.hasActiveBrand) {
    return item.brandTooltip ?? 'Select or create a brand to access this view.';
  }

  if (item.requiresKeywords && !context.hasKeywords) {
    return item.keywordsTooltip ?? 'Add keywords to access this view.';
  }

  return undefined;
};
