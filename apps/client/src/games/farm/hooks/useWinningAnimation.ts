import { useCallback, useEffect, useMemo, useState } from 'react';

import { GAME_WIN_EVENT } from '../../../constants/events';

import type { ConfettiPiece } from '../../../types/app';

type UseWinningAnimationResult = {
  show: boolean;
  isExiting: boolean;
  confettiPieces: ConfettiPiece[];
  close: () => void;
};

const ANIMATION_DURATION = 3000;
const FADE_OUT_DURATION = 500;
const CONFETTI_COUNT = 50;

export function useWinningAnimation(): UseWinningAnimationResult {
  const [show, setShow] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const listener: EventListener = (): void => {
      setIsExiting(false);
      setShow(true);
    };

    window.addEventListener(GAME_WIN_EVENT, listener);

    return () => {
      window.removeEventListener(GAME_WIN_EVENT, listener);
    };
  }, []);

  useEffect(() => {
    if (!show) {
      setIsExiting(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsExiting(true);
    }, ANIMATION_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [show]);

  useEffect(() => {
    if (!show || !isExiting) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShow(false);
      setIsExiting(false);
    }, FADE_OUT_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [show, isExiting]);

  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    if (!show) {
      return [];
    }

    const COLORS = [
      '#ff4d4d',
      '#ff9900',
      '#ffdd00',
      '#66ff66',
      '#00ccff',
      '#cc66ff',
      '#ff66b2',
      '#ffffff',
    ];

    return Array.from({ length: CONFETTI_COUNT }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 0.5}s`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));
  }, [show]);

  const close = useCallback(() => {
    setIsExiting(true);
  }, []);

  return {
    show,
    isExiting,
    confettiPieces,
    close,
  };
}
