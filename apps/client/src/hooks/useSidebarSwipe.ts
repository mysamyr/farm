import { useEffect, useRef, useState } from 'react';

const INTENT_THRESHOLD_PX = 8;
const OPEN_THRESHOLD = 0.35;
const SIDEBAR_WIDTH_PX = 280;
const SIDEBAR_MAX_VIEWPORT_RATIO = 0.85;
const SWIPE_START_VIEWPORT_RATIO = 0.7;

type GestureStatus = 'idle' | 'pending' | 'dragging';

export type SidebarSwipePhase = 'idle' | 'dragging' | 'settling';

type UseSidebarSwipeOptions = {
  enabled: boolean;
  onOpen: () => void;
};

type SidebarSwipeState = {
  phase: SidebarSwipePhase;
  progress: number;
  finishSettling: () => void;
};

export function useSidebarSwipe({
  enabled,
  onOpen,
}: UseSidebarSwipeOptions): SidebarSwipeState {
  const [phase, setPhase] = useState<SidebarSwipePhase>('idle');
  const [progress, setProgress] = useState(0);
  const statusRef = useRef<GestureStatus>('idle');
  const startRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      statusRef.current = 'idle';
      return;
    }

    function settleClosed() {
      statusRef.current = 'idle';

      if (progressRef.current > 0) {
        progressRef.current = 0;
        setPhase('settling');
        setProgress(0);
        return;
      }

      setPhase('idle');
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches.item(0);

      if (
        event.touches.length !== 1 ||
        !touch ||
        touch.clientX < window.innerWidth * SWIPE_START_VIEWPORT_RATIO
      ) {
        settleClosed();
        return;
      }

      startRef.current = { x: touch.clientX, y: touch.clientY };
      statusRef.current = 'pending';
    }

    function handleTouchMove(event: TouchEvent) {
      if (statusRef.current === 'idle') {
        return;
      }

      const touch = event.touches.item(0);

      if (event.touches.length !== 1 || !touch) {
        settleClosed();
        return;
      }

      const horizontalDistance = startRef.current.x - touch.clientX;
      const verticalDistance = touch.clientY - startRef.current.y;

      if (statusRef.current === 'pending') {
        if (
          Math.max(Math.abs(horizontalDistance), Math.abs(verticalDistance)) <
          INTENT_THRESHOLD_PX
        ) {
          return;
        }

        if (
          horizontalDistance <= 0 ||
          Math.abs(verticalDistance) >= horizontalDistance
        ) {
          settleClosed();
          return;
        }

        statusRef.current = 'dragging';
        setPhase('dragging');
      }

      event.preventDefault();

      const sidebarWidth = Math.min(
        SIDEBAR_WIDTH_PX,
        window.innerWidth * SIDEBAR_MAX_VIEWPORT_RATIO
      );
      const nextProgress = Math.min(
        1,
        Math.max(0, horizontalDistance / sidebarWidth)
      );

      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }

    function handleTouchEnd() {
      if (statusRef.current !== 'dragging') {
        statusRef.current = 'idle';
        return;
      }

      if (progressRef.current >= OPEN_THRESHOLD) {
        statusRef.current = 'idle';
        setPhase('settling');
        onOpen();
        return;
      }

      settleClosed();
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', settleClosed, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', settleClosed);
    };
  }, [enabled, onOpen]);

  function finishSettling() {
    if (phase === 'settling') {
      progressRef.current = 0;
      setPhase('idle');
      setProgress(0);
    }
  }

  return { phase, progress, finishSettling };
}
