import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type TransitionEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { useEscapeKey, useMediaQuery } from '../../hooks/index.js';
import { classNames } from '../../utils/index.js';
import { lockBodyScroll, MOBILE_MEDIA_QUERY } from '../../utils/overlay.js';

import styles from './Modal.module.css';

export type ModalPlacement = 'center' | 'bottom' | 'left' | 'right' | 'custom';
export type ModalBackdrop = 'always' | 'mobile' | 'none';
export type ModalLayer = 'panel' | 'floating' | 'sidebar' | 'modal';
export type ModalDragPhase = 'idle' | 'dragging' | 'settling';

export type ModalDrag = {
  phase: ModalDragPhase;
  /** 0 (closed) … 1 (fully open). */
  progress: number;
  onSettled: () => void;
};

export type ModalProps = {
  open: boolean;
  children: ReactNode;
  /** Called on Escape (and on backdrop click when `closeOnBackdrop`). */
  onClose?: () => void;
  /** Called once the exit animation finished and content was unmounted. */
  onExited?: () => void;
  placement?: ModalPlacement;
  /** Placement override for narrow (mobile) viewports. */
  mobilePlacement?: ModalPlacement;
  backdrop?: ModalBackdrop;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  layer?: ModalLayer;
  /** Keep content mounted while closed (required for drag-to-open). */
  keepMounted?: boolean;
  drag?: ModalDrag;
  className?: string;
  panelClassName?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

const EXIT_DURATION_MS = 250;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const placementClassMap: Record<ModalPlacement, string | undefined> = {
  center: styles.center,
  bottom: styles.bottom,
  left: styles.left,
  right: styles.right,
  custom: styles.custom,
};

const layerClassMap: Record<ModalLayer, string | undefined> = {
  panel: styles.layerPanel,
  floating: styles.layerFloating,
  sidebar: styles.layerSidebar,
  modal: styles.layerModal,
};

export default function Modal({
  open,
  children,
  onClose,
  onExited,
  placement = 'center',
  mobilePlacement,
  backdrop = 'always',
  closeOnBackdrop = false,
  closeOnEscape = true,
  lockScroll = false,
  layer = 'modal',
  keepMounted = false,
  drag,
  className,
  panelClassName,
  id,
  ariaLabel,
  ariaLabelledBy,
}: ModalProps): ReactElement | null {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open || keepMounted);
  const [shown, setShown] = useState(false);

  if (open && !present) {
    setPresent(true);
  }

  const effectivePlacement =
    isMobile && mobilePlacement ? mobilePlacement : placement;
  const hasBackdrop =
    backdrop === 'always' || (backdrop === 'mobile' && isMobile);
  const dragPhase = drag?.phase ?? 'idle';

  useLayoutEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    if (!present) return;
    // Flush the closed styles so the enter transition runs.
    rootRef.current?.getBoundingClientRect();
    setShown(true);
  }, [open, present]);

  useEffect(() => {
    if (open || keepMounted || !present) return;
    const timeout = setTimeout(() => {
      setPresent(false);
      onExited?.();
    }, EXIT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [open, keepMounted, present, onExited]);

  useEffect(() => {
    if (!open || !lockScroll) return;
    return lockBodyScroll();
  }, [open, lockScroll]);

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (panel && !panel.contains(document.activeElement)) {
      panel.focus({ preventScroll: true });
    }

    return () => {
      const active = document.activeElement;
      const focusWasInside =
        !active || active === document.body || panel?.contains(active);
      if (focusWasInside && previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useEscapeKey(open && closeOnEscape && Boolean(onClose), () => onClose?.());

  if (!present) {
    return null;
  }

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !hasBackdrop) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(element => element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      drag &&
      event.target === event.currentTarget &&
      event.propertyName === 'transform'
    ) {
      drag.onSettled();
    }
  };

  const dragStyle = drag
    ? ({
        '--modal-drag-progress': drag.progress,
        '--modal-drag-translate': `${(1 - drag.progress) * 100}%`,
      } as CSSProperties)
    : undefined;

  return createPortal(
    <div
      ref={rootRef}
      className={classNames(
        styles.root,
        layerClassMap[layer],
        // Visible immediately so content can take focus; `open` drives the
        // enter transition one frame later.
        open && styles.visible,
        open && shown && styles.open,
        dragPhase === 'dragging' && styles.dragging,
        dragPhase === 'settling' && styles.settling,
        className
      )}
      style={dragStyle}
    >
      {hasBackdrop && (
        <div
          className={styles.backdrop}
          aria-hidden="true"
          onClick={closeOnBackdrop ? onClose : undefined}
        />
      )}
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal={hasBackdrop || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={classNames(
          styles.panel,
          placementClassMap[effectivePlacement],
          panelClassName
        )}
        onKeyDown={handlePanelKeyDown}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
