import { type ReactElement, useCallback, useEffect, useState } from 'react';

import { ROOM_STATES, EVENTS } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

import { ButtonVariant, getDashboardPath } from '../constants/index.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { useRoom } from '../hooks/useRoom.js';
import { useServerCountdown } from '../hooks/useServerCountdown.js';
import { useSnackbar } from '../hooks/useSnackbar.js';
import { emitEvent, getSocketId } from '../socket/index.js';
import { classNames, resolveErrorMessage } from '../utils/index.js';

import Button from './Button.js';

import MinimizeIcon from './icons/MinimizeIcon.js';

import styles from './PostGameOverlay.module.css';

export function PostGameOverlay(): ReactElement | null {
  const navigate = useNavigate();
  const { currentRoom, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const remainingSec = useServerCountdown(currentRoom?.rematch?.expiresAt);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setMinimized(false);
  }, [currentRoom?.id, currentRoom?.rematch?.expiresAt]);

  const handleLeave = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.ROOM_LEAVE, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(getDashboardPath(currentRoom.game));
    });
  }, [currentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  const handleRematch = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_REMATCH, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [currentRoom, showSnackbar, translation]);

  const handleLobby = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_RETURN_TO_LOBBY, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [currentRoom, showSnackbar, translation]);

  if (!currentRoom || currentRoom.state !== ROOM_STATES.FINISHED) {
    return null;
  }

  const canRematch = Boolean(currentRoom.rematch);
  const myId = getSocketId();
  const readyIds = new Set(currentRoom.rematch?.readyPlayerIds ?? []);
  const iAmReady = Boolean(myId && readyIds.has(myId));
  const winner = currentRoom.players.find(
    player => player.id === currentRoom.winner
  );
  const winnerName = winner?.name ?? currentRoom.winner ?? '';
  const t = translation.postGame;

  if (minimized) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setMinimized(false)}
      >
        {canRematch && (
          <span className={styles.fabTime}>{t.seconds(remainingSec)}</span>
        )}
        <span>{t.expand}</span>
      </button>
    );
  }

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="post-game-title"
      >
        <div className={styles.header}>
          <h2 id="post-game-title" className={styles.title}>
            {t.title}
          </h2>
          <Button
            variant={ButtonVariant.ICON}
            aria-label={t.minimize}
            title={t.minimize}
            onClick={() => setMinimized(true)}
          >
            <MinimizeIcon />
          </Button>
        </div>

        {winnerName && <p className={styles.winner}>{t.winner(winnerName)}</p>}

        {canRematch && (
          <p className={styles.timer}>{t.seconds(remainingSec)}</p>
        )}

        <ul className={styles.players}>
          {currentRoom.players.map(player => {
            const isReady = readyIds.has(player.id);
            return (
              <li
                key={player.id}
                className={classNames(
                  styles.player,
                  canRematch && isReady && styles.playerReady
                )}
              >
                <span>
                  {player.name}
                  {player.id === myId && ` (${translation.you})`}
                </span>
                {canRematch && <span>{isReady ? t.ready : t.waiting}</span>}
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          {canRematch && (
            <Button
              variant={ButtonVariant.PRIMARY}
              disabled={iAmReady}
              onClick={handleRematch}
            >
              {t.rematch}
            </Button>
          )}
          <Button variant={ButtonVariant.SECONDARY} onClick={handleLobby}>
            {t.lobby}
          </Button>
          <Button variant={ButtonVariant.DANGER} onClick={handleLeave}>
            {t.leave}
          </Button>
        </div>
      </div>
    </div>
  );
}
