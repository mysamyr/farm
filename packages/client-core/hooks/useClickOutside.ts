import { type RefObject, useEffect, useRef } from 'react';

/** Calls `handler` on pointer down outside `ref` while `active`. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  handler: () => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Node && ref.current?.contains(target)) return;
      handlerRef.current();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [active, ref]);
}
