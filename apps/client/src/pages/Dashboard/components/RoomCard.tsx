import { ReactElement } from 'react';

import { Button, Tag } from '@game/client-core/components';
import { BUTTON_VARIANT, PATHS } from '@game/client-core/constants';
import { useGames, useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitEvent, getSocketId } from '@game/client-core/socket';
import {
  classNames,
  getOwnerName,
  resolveErrorMessage,
} from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import type { BaseRoom } from '@game/shared/types';
import { useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './RoomCard.module.css';

type RoomCardProps = {
  room: BaseRoom;
  usernameInput: string;
};

export default function RoomCard({
  room,
  usernameInput,
}: RoomCardProps): ReactElement {
  const navigate = useNavigate();
  const { translation } = useLanguage();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { getGame } = useGames();
  const { config: gameConfig } = useGameConfig(room.game);

  const gameMetadata = getGame(room.game);
  const maxPlayers = gameMetadata?.maxPlayers ?? 4;
  const rules = gameConfig?.rules ?? [];

  const isOwner = room.ownerId === getSocketId();
  const ownerLabel = isOwner ? translation.you : getOwnerName(room);
  const isFull = room.players.length >= maxPlayers;
  const isInRoom = room.players.some(player => player.id === getSocketId());
  const isAlreadyInRoom = !!currentRoom;
  const canJoinState = room.state === ROOM_STATES.IDLE;
  const canJoinName = !!usernameInput.trim();
  const canEnterGame = isInRoom && room.state === ROOM_STATES.RUNNING;
  const isBtnDisabled =
    !canEnterGame &&
    (isAlreadyInRoom ||
      isFull ||
      isOwner ||
      isInRoom ||
      !canJoinState ||
      !canJoinName);

  return (
    <div key={room.id} className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.roomName}>{room.name}</h3>
          <p className={styles.roomOwner}>
            {translation.owner} {ownerLabel}
          </p>
        </div>
        <span className={classNames(styles.badge, styles[room.state])}>
          {translation.roomState[room.state]}
        </span>
      </div>

      <div className={styles.roomInfo}>
        <span>
          👥 {room.players.length}/{maxPlayers}
        </span>
        {rules.length > 0 && (
          <div className={styles.rules}>
            {rules
              .filter(rule => room.rules[rule.key])
              .map(rule => (
                <Tag key={rule.key}>
                  {rule.label(translation.dashboard.rules)}
                </Tag>
              ))}
          </div>
        )}
      </div>

      <Button
        variant={
          isBtnDisabled ? BUTTON_VARIANT.SECONDARY : BUTTON_VARIANT.PRIMARY
        }
        disabled={isBtnDisabled}
        onClick={() => {
          if (canEnterGame) {
            void navigate(`${PATHS.GAME_BOARD}?game=${room.game}`);
            return;
          }

          if (isBtnDisabled) {
            showSnackbar(translation.errors.cannotJoin);
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
    </div>
  );
}
