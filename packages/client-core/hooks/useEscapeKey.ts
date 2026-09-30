import { useEffect, useRef } from 'react';

import { pushEscapeLayer } from '../utils/overlay.js';

/**
 * Calls `handler` on Escape while `active`. Handlers form a stack: only the
 * most recently activated one is invoked.
 */
export function useEscapeKey(active: boolean, handler: () => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;
    const entry = { current: () => handlerRef.current() };
    return pushEscapeLayer(entry);
  }, [active]);
}
