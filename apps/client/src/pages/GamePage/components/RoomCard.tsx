import { ReactElement } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { getUserId, resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import type { BaseRoom, SpectateRoomAck } from '@game/shared/types';
import { useNavigate } from 'react-router-dom';

import { Tag } from '../../../components/index.js';
import { getGameBoardPath } from '../../../constants/index.js';
import { useGameConfig, useGames, useUsername } from '../../../hooks/index.js';
import { getOwnerName } from '../../../utils/index.js';

import styles from './RoomCard.module.css';

type RoomCardProps = {
  room: BaseRoom;
};

export default function RoomCard({ room }: RoomCardProps): ReactElement {
  const { language, translation } = useLanguage();
  const { currentRoom, setCurrentRoom } = useRoom();
  const navigate = useNavigate();
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
  const isRunning = room.state === ROOM_STATES.RUNNING;
  const isAlreadyInRoom = !!currentRoom;
  const isKicked = (room.blacklist ?? []).includes(getUserId());
  const canJoin =
    hasUsername && !isAlreadyInRoom && !isKicked && !isRunning && !isFull;
  const canWatch = hasUsername && !isAlreadyInRoom && !isKicked && isRunning;
  const joinDisabledTitle = isKicked
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
            👥 {room.players.length}/{maxPlayers} · 👁 {room.spectators.length}
          </span>
          <span title={joinDisabledTitle} className={styles.joinButtonWrap}>
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
            <Button
              className={styles.cta}
              variant={
                canWatch ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY
              }
              disabled={!canWatch}
              onClick={() => {
                if (!canWatch) {
                  return;
                }

                emitEvent(
                  EVENTS.ROOM_SPECTATE,
                  { roomId: room.id },
                  (res: SpectateRoomAck) => {
                    if (!res.ok) {
                      showSnackbar(resolveErrorMessage(res.error, translation));
                      return;
                    }
                    if (res.room) {
                      setCurrentRoom(res.room);
                      void navigate(getGameBoardPath(room.game));
                    }
                  }
                );
              }}
            >
              {translation.roomButton.watch}
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
