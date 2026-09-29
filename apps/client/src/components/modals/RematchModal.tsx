import { type ReactElement, useEffect, useState } from 'react';

import {
  Button,
  FloatingButton,
  Modal,
  ModalHeader,
  RematchIcon,
} from '@game/client-core/components';

import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useRoom, useRoomRole } from '@game/client-core/hooks';
import { getSocketId } from '@game/client-core/socket';
import { ROOM_STATES } from '@game/shared/constants';

import { useRematchActions, useServerCountdown } from '../../hooks/index.js';

import { RematchPlayerList } from '../ui/RematchPlayerList.js';

import styles from './RematchModal.module.css';

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
  const { isSpectator } = useRoomRole();
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

  const winner =
    mode === 'postGame'
      ? currentRoom.players.find(player => player.id === currentRoom.winner)
      : undefined;
  const winnerName =
    mode === 'postGame' ? (winner?.name ?? currentRoom.winner ?? '') : '';

  const showMinimize = mode === 'midGame' || mode === 'postGame';
  const showTimer = mode === 'midGame' && Boolean(currentRoom.vote?.expiresAt);
  const showAccept = !isSpectator && canRematch && !iAmReady;
  // Mid-game: hide actions once you've voted. Pre/post-game: always allow decline.
  const showDecline = !isSpectator && (mode !== 'midGame' || !iAmReady);
  const showLeave = !isSpectator && mode === 'postGame';
  const showActions = showAccept || showDecline || showLeave;

  const isMidGame = mode === 'midGame';
  const isMinimized = minimized && showMinimize;
  const minimize = () => setMinimized(true);

  return (
    <>
      {isMinimized ? (
        <FloatingButton
          side="right"
          aria-label={isMidGame ? tInGame.voteTitle : t.expand}
          title={isMidGame ? tInGame.voteTitle : t.expand}
          badge={
            isMidGame
              ? `${readyIds.size}/${currentRoom.players.length}`
              : undefined
          }
          onClick={() => setMinimized(false)}
        >
          <RematchIcon />
        </FloatingButton>
      ) : null}
      <Modal
        open={!isMinimized}
        onClose={showMinimize ? minimize : undefined}
        placement="center"
        mobilePlacement="bottom"
        layer="panel"
        ariaLabelledBy="vote-title"
        panelClassName={styles.modal}
      >
        <ModalHeader
          className={styles.header}
          titleId="vote-title"
          title={title}
          onClose={showMinimize ? minimize : undefined}
          closeLabel={t.minimize}
        />

        <div className={styles.body}>
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
      </Modal>
    </>
  );
}
