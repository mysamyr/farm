import { ReactElement, useState } from 'react';

import { Button, Slider, Tag } from '@game/client-core/components';
import { BUTTON_VARIANT, PATHS } from '@game/client-core/constants';
import {
  useActiveGame,
  useGames,
  useKickPlayer,
  useLanguage,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitEvent, getSocketId } from '@game/client-core/socket';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS, ROOM_STATES, VALIDATION } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './ActiveRoom.module.css';

export default function ActiveRoom(): ReactElement {
  const navigate = useNavigate();
  const { activeGame, cleanupCurrentIdleRoom } = useActiveGame();
  const room = useRoom();
  const { language, translation } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const { getGame } = useGames();
  const { config: gameConfig } = useGameConfig(activeGame);
  const kickPlayer = useKickPlayer();

  const currentRoom = room.currentRoom!;
  const gameMetadata = getGame(activeGame);

  const [roomName, setRoomName] = useState(currentRoom.name);

  const isOwner = currentRoom.ownerId === getSocketId();

  // Use metadata from store for basic info
  const minPlayers = gameMetadata?.minPlayers ?? 2;
  const maxPlayers = gameMetadata?.maxPlayers ?? 4;

  const canStartGame =
    currentRoom.players.length >= minPlayers &&
    currentRoom.players.length <= maxPlayers &&
    currentRoom.state === ROOM_STATES.IDLE;
  const canEnterGame = currentRoom.state === ROOM_STATES.RUNNING;

  const trimmedRoomName = roomName.trim();
  const roomNameLength = [...trimmedRoomName].length;
  const isRoomNameInvalid =
    roomNameLength < VALIDATION.ROOM_NAME.MIN_LENGTH ||
    roomNameLength > VALIDATION.ROOM_NAME.MAX_LENGTH;

  // Rules config comes from the loaded game plugin
  const rules = gameConfig?.rules ?? [];

  return (
    <aside className={styles.activeRoom}>
      <div>
        {isOwner && (
          <input
            type="text"
            className={`${styles.roomName}${isRoomNameInvalid ? ` ${styles.roomNameInvalid}` : ''}`}
            value={roomName}
            disabled={!isOwner}
            maxLength={VALIDATION.ROOM_NAME.MAX_LENGTH}
            onChange={event => {
              const nextValue = event.target.value;
              if ([...nextValue].length > VALIDATION.ROOM_NAME.MAX_LENGTH) {
                return;
              }
              setRoomName(nextValue);
            }}
            onBlur={() => {
              if (isRoomNameInvalid) {
                return;
              }

              const nextName = trimmedRoomName;

              if (nextName === currentRoom.name) {
                return;
              }

              emitEvent(
                EVENTS.ROOM_UPDATE,
                { roomId: currentRoom.id, name: nextName },
                res => {
                  if (!res.ok) {
                    showSnackbar(resolveErrorMessage(res.error, translation));
                  }
                }
              );
            }}
          />
        )}
        {!isOwner && <h3 className={styles.roomName}>{currentRoom.name}</h3>}
        <span>
          {currentRoom.players.length}/{maxPlayers}{' '}
          {translation.dashboard.players}
        </span>
      </div>

      <div className={styles.playersList}>
        {currentRoom.players.map(player => {
          const isSelf = player.id === getSocketId();
          const isPlayerOwner = player.id === currentRoom.ownerId;
          const canKick = isOwner && !isSelf && !isPlayerOwner;

          return (
            <div
              className={classNames(
                styles.playerItem,
                isSelf && styles.currentUser
              )}
              key={player.id}
            >
              <span>
                {player.name}
                {isSelf ? ` (${translation.you})` : ''}
              </span>
              <span className={styles.playerActions}>
                {isPlayerOwner ? '⭐' : null}
                {canKick ? (
                  <Button
                    variant={BUTTON_VARIANT.DANGER}
                    className={styles.kickButton}
                    onClick={() => {
                      kickPlayer(currentRoom.id, player);
                    }}
                  >
                    {translation.roomButton.kick}
                  </Button>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
      {rules.length > 0 && (
        <div className={styles.rulesSection}>
          <h4>{translation.dashboard.roomRules}</h4>
          {isOwner ? (
            <div className={styles.rulesToggles}>
              {rules.map(rule => (
                <Slider
                  key={rule.key}
                  label={rule.label(language)}
                  checked={!!currentRoom.rules[rule.key]}
                  onChange={event => {
                    emitEvent(
                      EVENTS.ROOM_UPDATE,
                      {
                        roomId: currentRoom.id,
                        rules: {
                          [rule.key]: event.target.checked,
                        },
                      },
                      res => {
                        if (!res.ok) {
                          showSnackbar(
                            resolveErrorMessage(res.error, translation)
                          );
                        }
                      }
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.rulesTags}>
              {rules
                .filter(rule => currentRoom.rules[rule.key])
                .map(rule => (
                  <Tag key={rule.key}>{rule.label(language)}</Tag>
                ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {canEnterGame && (
          <Button
            variant={BUTTON_VARIANT.SUCCESS}
            onClick={() => {
              void navigate(`${PATHS.GAME_BOARD}?game=${currentRoom.game}`);
            }}
          >
            {translation.roomButton.enter}
          </Button>
        )}
        {isOwner && !canEnterGame && (
          <Button
            variant={BUTTON_VARIANT.SUCCESS}
            disabled={!canStartGame}
            onClick={() => {
              if (!canStartGame) {
                showSnackbar(translation.errors[ERROR.CANNOT_START]);
                return;
              }
              emitEvent(EVENTS.GAME_START, { roomId: currentRoom.id }, res => {
                if (!res.ok) {
                  showSnackbar(resolveErrorMessage(res.error, translation));
                }
              });
            }}
          >
            {translation.roomButton.startGame}
          </Button>
        )}
        <Button
          variant={BUTTON_VARIANT.DANGER}
          onClick={cleanupCurrentIdleRoom}
        >
          {isOwner
            ? translation.roomButton.closeRoom
            : translation.roomButton.leaveRoom}
        </Button>
      </div>
    </aside>
  );
}
