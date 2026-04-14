import React, { ReactElement } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import {
  DEFAULT_CONFIG,
  FARM_EVENTS,
  GAME_RULES,
} from '@game/shared/constants/farm';
import { Room } from '@game/shared/types/farm';

import Button from '../../../components/ui/Button';
import Tag from '../../../components/ui/Tag';
import { BUTTON_VARIANT } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../socket/client';
import { classNames } from '../../../utils';
import { getOwnerName, getRuleLabel } from '../../../utils/game';

import styles from './RoomCard.module.css';

type RoomCardProps = {
  room: Room;
  usernameInput: string;
};

export default function RoomCard({
  room,
  usernameInput,
}: RoomCardProps): ReactElement {
  const { translation } = useLanguage();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();

  const isOwner = room.ownerId === getSocketId();
  const ownerLabel = isOwner ? translation.you : getOwnerName(room);
  const isFull = room.players.length >= DEFAULT_CONFIG.maxPlayers;
  const isInRoom = room.players.some(player => player.id === getSocketId());
  const isAlreadyInRoom = !!currentRoom;
  const canJoinState = room.state === ROOM_STATES.IDLE;
  const canJoinName = !!usernameInput.trim();
  const isBtnDisabled =
    isAlreadyInRoom ||
    isFull ||
    isOwner ||
    isInRoom ||
    !canJoinState ||
    !canJoinName;

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
          👥 {room.players.length}/{DEFAULT_CONFIG.maxPlayers}
        </span>
        <div className={styles.rules}>
          {Object.values(GAME_RULES)
            .filter(rule => room.rules[rule])
            .map(rule => (
              <Tag key={rule}>{getRuleLabel(rule, translation)}</Tag>
            ))}
        </div>
      </div>

      <Button
        variant={
          isBtnDisabled ? BUTTON_VARIANT.SECONDARY : BUTTON_VARIANT.PRIMARY
        }
        disabled={isBtnDisabled}
        onClick={() => {
          if (isBtnDisabled) {
            showSnackbar(translation.dashboard.errors.cannotJoin);
            return;
          }

          emitEvent(
            FARM_EVENTS.ROOM_JOIN,
            { roomId: room.id },
            (res: { ok: boolean; error?: string }): void => {
              if (!res.ok) {
                showSnackbar(
                  res.error || translation.dashboard.errors.cannotJoin
                );
              }
            }
          );
        }}
      >
        {isFull
          ? translation.roomButton.full
          : isInRoom
            ? translation.roomButton.joined
            : translation.roomButton.join}
      </Button>
    </div>
  );
}
