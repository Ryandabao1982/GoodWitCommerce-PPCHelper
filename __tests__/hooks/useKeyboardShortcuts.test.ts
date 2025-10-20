import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('navigates to the SOP library when pressing Cmd+5', () => {
    const onViewChange = vi.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onViewChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: '5', metaKey: true });
    window.dispatchEvent(event);

    expect(onViewChange).toHaveBeenCalledWith('sop');

    unmount();
  });

  it('navigates to the settings view when pressing Cmd+6', () => {
    const onViewChange = vi.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onViewChange,
      })
    );

    const event = new KeyboardEvent('keydown', { key: '6', metaKey: true });
    window.dispatchEvent(event);

    expect(onViewChange).toHaveBeenCalledWith('settings');

    unmount();
  });
});
