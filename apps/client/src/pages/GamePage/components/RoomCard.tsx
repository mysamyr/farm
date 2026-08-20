import { ReactElement } from 'react';

import { Button, Tag } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import {
  useGames,
  useLanguage,
  useRoom,
  useSnackbar,
  useUsername,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import {
  getOwnerName,
  getUserId,
  resolveErrorMessage,
} from '@game/client-core/utils';
import { EVENTS } from '@game/shared/constants';
import type { BaseRoom } from '@game/shared/types';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './RoomCard.module.css';

type RoomCardProps = {
  room: BaseRoom;
};

export default function RoomCard({ room }: RoomCardProps): ReactElement {
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

  const isFull = room.players.length >= maxPlayers;
  const isAlreadyInRoom = !!currentRoom;
  const isKicked = (room.blacklist ?? []).includes(getUserId());
  const canJoin = hasUsername && !isAlreadyInRoom && !isFull && !isKicked;
  const disabledTitle = isKicked
    ? translation.errors.cannotJoinKicked
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <h3 className={styles.roomName}>{room.name}</h3>
          <span className={styles.roomOwner}>
            {translation.owner} {getOwnerName(room)}
          </span>
        </div>

        <div className={styles.actions}>
          <span className={styles.online}>
            👥 {room.players.length}/{maxPlayers}
          </span>
          <span title={disabledTitle} className={styles.joinButtonWrap}>
            <Button
              className={styles.cta}
              variant={
                canJoin ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY
              }
              disabled={!canJoin}
              onClick={() => {
                if (!canJoin) {
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
              {isFull
                ? translation.roomButton.full
                : translation.roomButton.join}
            </Button>
          </span>
        </div>
      </div>

      {activeRules.length > 0 ? (
        <ul className={styles.rules}>
          {activeRules.map(rule => {
            const label = rule.label(language);
            return (
              <li key={rule.key}>
                <Tag title={label}>{label}</Tag>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
