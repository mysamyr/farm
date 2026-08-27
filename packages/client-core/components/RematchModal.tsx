import { type ReactElement, useEffect, useState } from 'react';

import { ROOM_STATES } from '@game/shared/constants';

import { ButtonVariant } from '../constants/index.js';
import { useLanguage, useRoom, useServerCountdown } from '../hooks/index.js';
import { useRematchActions } from '../hooks/index.js';
import { getSocketId } from '../socket/index.js';

import Button from './Button.js';
import MinimizeIcon from './icons/MinimizeIcon.js';
import styles from './PostGameOverlay.module.css';
import { RematchPlayerList } from './RematchPlayerList.js';

type VoteMode = 'preGame' | 'midGame' | 'postGame';

function resolveVoteMode(
  state: ROOM_STATES | undefined,
  hasVote: boolean
): VoteMode | null {
  if (!state) {
    return null;
  }
  if (state === ROOM_STATES.IDLE && hasVote) {
    return 'preGame';
  }
  if (state === ROOM_STATES.RUNNING && hasVote) {
    return 'midGame';
  }
  if (state === ROOM_STATES.FINISHED) {
    return 'postGame';
  }
  return null;
}

export function RematchModal(): ReactElement | null {
  const { currentRoom } = useRoom();
  const { translation } = useLanguage();
  const remainingSec = useServerCountdown(currentRoom?.vote?.expiresAt);
  const { handleRematch, handleDeclineRematch, handleLeave } =
    useRematchActions();
  const [minimized, setMinimized] = useState(false);

  const hasVote = Boolean(currentRoom?.vote);
  const mode = resolveVoteMode(currentRoom?.state, hasVote);

  useEffect(() => {
    setMinimized(false);
  }, [currentRoom?.id, currentRoom?.vote?.expiresAt, mode]);

  if (!currentRoom || !mode) {
    return null;
  }

  const myId = getSocketId();
  const readyIds = new Set(currentRoom.vote?.readyPlayerIds ?? []);
  const iAmReady = Boolean(myId && readyIds.has(myId));
  const t = translation.postGame;
  const tInGame = translation.inGame;
  const canRematch = hasVote;

  const title =
    mode === 'preGame'
      ? tInGame.readyTitle
      : mode === 'midGame'
        ? tInGame.voteTitle
        : t.title;

  const acceptLabel =
    mode === 'postGame' || mode === 'midGame' ? t.rematch : t.ready;
  const declineLabel = mode === 'postGame' ? tInGame.lobby : t.decline;

  if (minimized && mode === 'midGame') {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setMinimized(false)}
      >
        <span className={styles.fabTime}>
          🔄 {readyIds.size}/{currentRoom.players.length}
        </span>
        <span>{tInGame.voteTitle}</span>
      </button>
    );
  }

  if (minimized && mode === 'postGame') {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setMinimized(false)}
      >
        <span>{t.expand}</span>
      </button>
    );
  }

  const winner =
    mode === 'postGame'
      ? currentRoom.players.find(player => player.id === currentRoom.winner)
      : undefined;
  const winnerName =
    mode === 'postGame' ? (winner?.name ?? currentRoom.winner ?? '') : '';

  const showMinimize = mode === 'midGame' || mode === 'postGame';
  const showTimer = mode === 'midGame' && Boolean(currentRoom.vote?.expiresAt);
  const showAccept = canRematch && !iAmReady;
  // Mid-game: hide actions once you've voted. Pre/post-game: always allow decline.
  const showDecline = mode !== 'midGame' || !iAmReady;
  const showLeave = mode === 'postGame';
  const showActions = showAccept || showDecline || showLeave;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-labelledby="vote-title">
        <div className={styles.header}>
          <h2 id="vote-title" className={styles.title}>
            {title}
          </h2>
          {showMinimize ? (
            <Button
              variant={ButtonVariant.ICON}
              aria-label={t.minimize}
              title={t.minimize}
              onClick={() => setMinimized(true)}
            >
              <MinimizeIcon />
            </Button>
          ) : null}
        </div>

        {winnerName ? (
          <p className={styles.winner}>{t.winner(winnerName)}</p>
        ) : null}

        {showTimer ? (
          <p className={styles.timer}>{t.seconds(remainingSec)}</p>
        ) : null}

        <RematchPlayerList
          players={currentRoom.players}
          readyIds={readyIds}
          myId={myId ?? undefined}
          showStatus={canRematch}
        />

        {showActions ? (
          <div className={styles.actions}>
            {showAccept ? (
              <Button variant={ButtonVariant.PRIMARY} onClick={handleRematch}>
                {acceptLabel}
              </Button>
            ) : null}
            {showDecline ? (
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={handleDeclineRematch}
              >
                {declineLabel}
              </Button>
            ) : null}
            {showLeave ? (
              <Button variant={ButtonVariant.DANGER} onClick={handleLeave}>
                {t.leave}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
