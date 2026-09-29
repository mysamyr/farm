import { useEffect } from 'react';

import { useGameOverlayStore } from '../store/index.js';

/**
 * Registers a mounted game overlay (sheet, popover) so the shell can hide
 * floating chrome such as the chat button while it is visible.
 */
export function useGameOverlay(active = true): void {
  useEffect(() => {
    if (!active) return;

    const { openGameOverlay, closeGameOverlay } =
      useGameOverlayStore.getState();
    openGameOverlay();
    return closeGameOverlay;
  }, [active]);
}

export function useHasGameOverlay(): boolean {
  return useGameOverlayStore(state => state.count > 0);
}
