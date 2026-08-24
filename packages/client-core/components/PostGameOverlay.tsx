import { type ReactElement, useCallback, useEffect, useState } from 'react';

import { ROOM_STATES, EVENTS } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

import { ButtonVariant, getGamePath } from '../constants/index.js';
import { useLanguage } from '../hooks/index.js';
import { useServerCountdown } from '../hooks/index.js';
import { useSnackbar } from '../hooks/index.js';
import { useRoom } from '../hooks/index.js';
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

  const isPostGame = currentRoom?.state === ROOM_STATES.FINISHED;
  const isMidGameVote =
    currentRoom?.state === ROOM_STATES.RUNNING && Boolean(currentRoom?.rematch);

  useEffect(() => {
    if (isMidGameVote) {
      setMinimized(false);
    } else {
      setMinimized(false);
    }
  }, [currentRoom?.id, currentRoom?.rematch?.expiresAt, isMidGameVote]);

  const handleLeave = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.ROOM_LEAVE, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(getGamePath(currentRoom.game));
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

  const handleDeclineRematch = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_REMATCH_DECLINE, { roomId: currentRoom.id }, res => {
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

  if (!currentRoom || (!isPostGame && !isMidGameVote)) {
    return null;
  }

  const canRematch = Boolean(currentRoom.rematch);
  const myId = getSocketId();
  const readyIds = new Set(currentRoom.rematch?.readyPlayerIds ?? []);
  const iAmReady = Boolean(myId && readyIds.has(myId));
  const t = translation.postGame;
  const tInGame = translation.inGame;

  if (minimized) {
    const readyCount = readyIds.size;
    const totalCount = currentRoom.players.length;
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setMinimized(false)}
      >
        {isMidGameVote ? (
          <span className={styles.fabTime}>
            🔄 {readyCount}/{totalCount}
          </span>
        ) : (
          canRematch && (
            <span className={styles.fabTime}>{t.seconds(remainingSec)}</span>
          )
        )}
        <span>{isMidGameVote ? tInGame.voteTitle : t.expand}</span>
      </button>
    );
  }

  if (isMidGameVote) {
    return (
      <div className={styles.backdrop}>
        <div
          className={styles.modal}
          role="dialog"
          aria-labelledby="mid-game-vote-title"
        >
          <div className={styles.header}>
            <h2 id="mid-game-vote-title" className={styles.title}>
              {tInGame.voteTitle}
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

          <p className={styles.timer}>{t.seconds(remainingSec)}</p>

          <ul className={styles.players}>
            {currentRoom.players.map(player => {
              const isReady = readyIds.has(player.id);
              return (
                <li
                  key={player.id}
                  className={classNames(
                    styles.player,
                    isReady && styles.playerReady
                  )}
                >
                  <span>
                    {player.name}
                    {player.id === myId && ` (${translation.you})`}
                  </span>
                  <span>{isReady ? t.ready : t.waiting}</span>
                </li>
              );
            })}
          </ul>

          {!iAmReady ? (
            <div className={styles.actions}>
              <Button variant={ButtonVariant.PRIMARY} onClick={handleRematch}>
                {t.rematch}
              </Button>
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={handleDeclineRematch}
              >
                {tInGame.cancel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Post-game overlay (state === FINISHED)
  const winner = currentRoom.players.find(
    player => player.id === currentRoom.winner
  );
  const winnerName = winner?.name ?? currentRoom.winner ?? '';

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
