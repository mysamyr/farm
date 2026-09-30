type EscapeHandler = () => void;

const escapeStack: { current: EscapeHandler }[] = [];

function handleDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  const top = escapeStack[escapeStack.length - 1];
  if (!top) return;
  event.preventDefault();
  top.current();
}

/**
 * Registers an Escape handler on a shared stack. Only the most recently
 * registered (topmost) layer receives Escape, so nested overlays close one
 * at a time.
 */
export function pushEscapeLayer(entry: { current: EscapeHandler }): () => void {
  if (escapeStack.length === 0) {
    document.addEventListener('keydown', handleDocumentKeyDown);
  }
  escapeStack.push(entry);

  return () => {
    const index = escapeStack.lastIndexOf(entry);
    if (index !== -1) escapeStack.splice(index, 1);
    if (escapeStack.length === 0) {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    }
  };
}

let scrollLockCount = 0;

/** Ref-counted body scroll lock so nested overlays don't unlock early. */
export function lockBodyScroll(): () => void {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    document.body.style.overflow = 'hidden';
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = '';
    }
  };
}

export type TooltipPosition = 'above' | 'below';
export type TooltipAlign = 'left' | 'center' | 'right';

export type TooltipPlacementOptions = {
  /** Minimum space (px) above the anchor required to render the tooltip above. */
  minSpaceAbove: number;
  /** Distance (px) to a viewport edge at which the tooltip aligns to that edge. */
  edgeOffset: number;
};

export function getTooltipPlacement(
  rect: DOMRect,
  { minSpaceAbove, edgeOffset }: TooltipPlacementOptions
): { position: TooltipPosition; align: TooltipAlign } {
  const position: TooltipPosition =
    rect.top > minSpaceAbove ? 'above' : 'below';

  let align: TooltipAlign = 'center';
  if (rect.left < edgeOffset) {
    align = 'left';
  } else if (window.innerWidth - rect.right < edgeOffset) {
    align = 'right';
  }

  return { position, align };
}

export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
