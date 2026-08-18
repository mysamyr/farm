import { ReactElement } from 'react';

import { Button, Tag } from '@game/client-core/components';
import { ButtonVariant, getGameBoardPath } from '@game/client-core/constants';
import {
  useGames,
  useLanguage,
  useRoom,
  useSnackbar,
  useUsername,
} from '@game/client-core/hooks';
import { emitEvent, getSocketId } from '@game/client-core/socket';
import {
  getOwnerName,
  getUserId,
  resolveErrorMessage,
} from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import type { BaseRoom } from '@game/shared/types';
import { useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './RoomCard.module.css';

type RoomCardProps = {
  room: BaseRoom;
};

export default function RoomCard({ room }: RoomCardProps): ReactElement {
  const navigate = useNavigate();
  const { language, translation } = useLanguage();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { getGame } = useGames();
  const { isValid: hasUsername } = useUsername();
  const { config: gameConfig } = useGameConfig(room.game);

  const gameMetadata = getGame(room.game);
  const maxPlayers = gameMetadata?.maxPlayers ?? 4;
  const activeRules = (gameConfig?.rules ?? []).filter(
    rule => room.rules[rule.key]
  );

  const isOwner = room.ownerId === getSocketId();
  const ownerLabel = isOwner ? translation.you : getOwnerName(room);
  const isFull = room.players.length >= maxPlayers;
  const isInRoom = room.players.some(player => player.id === getSocketId());
  const isAlreadyInRoom = !!currentRoom;
  const canJoinState = room.state === ROOM_STATES.IDLE;
  const canJoinName = hasUsername;
  const canEnterGame = isInRoom && room.state === ROOM_STATES.RUNNING;
  const isKicked = (room.blacklist ?? []).includes(getUserId());
  const isBtnDisabled =
    !canEnterGame &&
    (isAlreadyInRoom ||
      isFull ||
      isOwner ||
      isInRoom ||
      !canJoinState ||
      !canJoinName ||
      isKicked);
  const disabledTitle = isKicked
    ? translation.errors.cannotJoinKicked
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <h3 className={styles.roomName}>{room.name}</h3>
        <span className={styles.roomOwner}>
          {translation.owner} {ownerLabel}
        </span>
        {activeRules.length > 0 ? (
          <div className={styles.rules}>
            {activeRules.map(rule => (
              <Tag key={rule.key}>{rule.label(language)}</Tag>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.right}>
        <span className={styles.online}>
          👥 {room.players.length}/{maxPlayers}
        </span>
        <span title={disabledTitle} className={styles.joinButtonWrap}>
          <Button
            className={styles.cta}
            variant={
              isBtnDisabled ? ButtonVariant.SECONDARY : ButtonVariant.PRIMARY
            }
            disabled={isBtnDisabled}
            onClick={() => {
              if (canEnterGame) {
                void navigate(getGameBoardPath(room.game));
                return;
              }

              if (isBtnDisabled) {
                showSnackbar(
                  isKicked
                    ? translation.errors.cannotJoinKicked
                    : translation.errors.cannotJoin
                );
                return;
              }

              emitEvent(EVENTS.ROOM_JOIN, { roomId: room.id }, res => {
                if (!res.ok) {
                  showSnackbar(resolveErrorMessage(res.error, translation));
                }
              });
            }}
          >
            {canEnterGame
              ? translation.roomButton.enter
              : isFull
                ? translation.roomButton.full
                : isInRoom
                  ? translation.roomButton.joined
                  : translation.roomButton.join}
          </Button>
        </span>
      </div>
    </div>
  );
}
