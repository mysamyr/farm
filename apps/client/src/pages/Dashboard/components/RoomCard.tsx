import { ReactElement } from 'react';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import type { Room } from '@game/shared/types';

import Button from '../../../components/ui/Button';
import Tag from '../../../components/ui/Tag';
import { BUTTON_VARIANT } from '../../../constants';
import { getDefaultGameConfig } from '../../../games/registry';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../socket/client';
import { classNames, getOwnerName } from '../../../utils';
import { resolveErrorMessage } from '../../../utils/language';

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

  const gameConfig = getDefaultGameConfig();
  const isOwner = room.ownerId === getSocketId();
  const ownerLabel = isOwner ? translation.you : getOwnerName(room);
  const isFull = room.players.length >= gameConfig.maxPlayers;
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
          👥 {room.players.length}/{gameConfig.maxPlayers}
        </span>
        {gameConfig.rules.length > 0 && (
          <div className={styles.rules}>
            {gameConfig.rules
              .filter(rule => room.rules[rule.key])
              .map(rule => (
                <Tag key={rule.key}>{rule.label(translation.dashboard.rules)}</Tag>
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
        {isFull
          ? translation.roomButton.full
          : isInRoom
            ? translation.roomButton.joined
            : translation.roomButton.join}
      </Button>
    </div>
  );
}
