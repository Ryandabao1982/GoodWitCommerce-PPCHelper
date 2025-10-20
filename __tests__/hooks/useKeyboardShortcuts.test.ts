import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it.each([
    {
      description: 'Cmd+5 navigates to the SOP library',
      key: '5',
      modifier: 'metaKey' as const,
      expectedView: 'sop',
    },
    {
      description: 'Ctrl+5 navigates to the SOP library',
      key: '5',
      modifier: 'ctrlKey' as const,
      expectedView: 'sop',
    },
    {
      description: 'Cmd+6 navigates to the settings view',
      key: '6',
      modifier: 'metaKey' as const,
      expectedView: 'settings',
    },
    {
      description: 'Ctrl+6 navigates to the settings view',
      key: '6',
      modifier: 'ctrlKey' as const,
      expectedView: 'settings',
    },
  ])('$description', ({ key, modifier, expectedView }) => {
    const onViewChange = vi.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onViewChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key, [modifier]: true });
    window.dispatchEvent(event);

    expect(onViewChange).toHaveBeenCalledWith(expectedView);

    unmount();
  });
});
