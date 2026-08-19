import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useState,
} from 'react';

import { Button, Slider, Tag } from '@game/client-core/components';
import { ButtonVariant, getGameBoardPath } from '@game/client-core/constants';
import {
  useActiveGame,
  useGames,
  useKickPlayer,
  useLanguage,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitEvent, getSocketId } from '@game/client-core/socket';
import type { RuleConfig } from '@game/client-core/types';
import {
  classNames,
  graphemeLength,
  isValidRoomName,
  resolveErrorMessage,
} from '@game/client-core/utils';
import { ERROR, EVENTS, ROOM_STATES, VALIDATION } from '@game/shared/constants';
import type { BasePlayer, BaseRoom, SocketAck } from '@game/shared/types';
import { useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../../hooks/index.js';

import styles from './ActiveRoom.module.css';

export default function ActiveRoom(): ReactElement | null {
  const { currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const { getGame } = useGames();
  const { config: gameConfig } = useGameConfig(currentRoom?.game ?? null);

  const onAck = useCallback(
    (res: SocketAck): void => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    },
    [showSnackbar, translation]
  );

  if (!currentRoom) {
    return null;
  }

  const gameMetadata = getGame(currentRoom.game);
  const minPlayers = gameMetadata?.minPlayers ?? 1;
  const maxPlayers = gameMetadata?.maxPlayers ?? 1;
  const isOwner = currentRoom.ownerId === getSocketId();
  const playerCount = currentRoom.players.length;
  const canStartGame =
    playerCount >= minPlayers &&
    playerCount <= maxPlayers &&
    currentRoom.state === ROOM_STATES.IDLE;
  const canEnterGame = currentRoom.state === ROOM_STATES.RUNNING;
  const rules = gameConfig?.rules ?? [];
  const enabledRules = rules.filter(rule => currentRoom.rules[rule.key]);

  return (
    <aside className={styles.activeRoom}>
      <header className={styles.header}>
        {isOwner ? (
          <RoomNameInput room={currentRoom} onAck={onAck} />
        ) : (
          <h3 className={styles.roomName}>{currentRoom.name}</h3>
        )}
        <span className={styles.playerCount}>
          {playerCount}/{maxPlayers} {translation.dashboard.players}
        </span>
      </header>

      <PlayersList
        room={currentRoom}
        isOwner={isOwner}
        youLabel={translation.you}
        kickLabel={translation.roomButton.kick}
      />

      <RulesSection
        room={currentRoom}
        isOwner={isOwner}
        rules={rules}
        enabledRules={enabledRules}
        onAck={onAck}
      />

      <RoomActions
        room={currentRoom}
        isOwner={isOwner}
        canStartGame={canStartGame}
        canEnterGame={canEnterGame}
        onAck={onAck}
      />
    </aside>
  );
}

function RoomNameInput({
  room,
  onAck,
}: {
  room: BaseRoom;
  onAck: (res: SocketAck) => void;
}): ReactElement {
  const [roomName, setRoomName] = useState(room.name);
  const isInvalid = !isValidRoomName(roomName);

  return (
    <input
      type="text"
      className={classNames(
        styles.roomName,
        isInvalid && styles.roomNameInvalid
      )}
      value={roomName}
      maxLength={VALIDATION.ROOM_NAME.MAX_LENGTH}
      onChange={event => {
        const nextValue = event.target.value;
        if (graphemeLength(nextValue) > VALIDATION.ROOM_NAME.MAX_LENGTH) {
          return;
        }
        setRoomName(nextValue);
      }}
      onBlur={() => {
        const nextName = roomName.trim();
        if (!isValidRoomName(nextName) || nextName === room.name) {
          return;
        }

        emitEvent(
          EVENTS.ROOM_UPDATE,
          { roomId: room.id, name: nextName },
          onAck
        );
      }}
    />
  );
}

function PlayersList({
  room,
  isOwner,
  youLabel,
  kickLabel,
}: {
  room: BaseRoom;
  isOwner: boolean;
  youLabel: string;
  kickLabel: string;
}): ReactElement {
  const kickPlayer = useKickPlayer();
  const socketId = getSocketId();

  return (
    <div className={styles.playersList}>
      {room.players.map(player => (
        <PlayerRow
          key={player.id}
          player={player}
          isSelf={player.id === socketId}
          isPlayerOwner={player.id === room.ownerId}
          canKick={
            isOwner && player.id !== socketId && player.id !== room.ownerId
          }
          youLabel={youLabel}
          kickLabel={kickLabel}
          onKick={() => {
            kickPlayer(room.id, player);
          }}
        />
      ))}
    </div>
  );
}

function PlayerRow({
  player,
  isSelf,
  isPlayerOwner,
  canKick,
  youLabel,
  kickLabel,
  onKick,
}: {
  player: BasePlayer;
  isSelf: boolean;
  isPlayerOwner: boolean;
  canKick: boolean;
  youLabel: string;
  kickLabel: string;
  onKick: () => void;
}): ReactElement {
  return (
    <div className={classNames(styles.playerItem, isSelf && styles.currentUser)}>
      <span>
        {player.name}
        {isSelf ? ` (${youLabel})` : ''}
      </span>
      <span className={styles.playerActions}>
        {isPlayerOwner ? '⭐' : null}
        {canKick ? (
          <Button
            variant={ButtonVariant.DANGER}
            className={styles.kickButton}
            onClick={onKick}
          >
            {kickLabel}
          </Button>
        ) : null}
      </span>
    </div>
  );
}

function RulesSection({
  room,
  isOwner,
  rules,
  enabledRules,
  onAck,
}: {
  room: BaseRoom;
  isOwner: boolean;
  rules: RuleConfig[];
  enabledRules: RuleConfig[];
  onAck: (res: SocketAck) => void;
}): ReactElement | null {
  const { language, translation } = useLanguage();
  const visibleRules = isOwner ? rules : enabledRules;

  if (visibleRules.length === 0) {
    return null;
  }

  const onRuleChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    emitEvent(
      EVENTS.ROOM_UPDATE,
      { roomId: room.id, rules: { [key]: event.target.checked } },
      onAck
    );
  };

  return (
    <div className={styles.rulesSection}>
      <h4>{translation.dashboard.roomRules}</h4>
      {isOwner ? (
        <div className={styles.rulesToggles}>
          {rules.map(rule => (
            <Slider
              key={rule.key}
              label={rule.label(language)}
              checked={!!room.rules[rule.key]}
              onChange={event => {
                onRuleChange(rule.key, event);
              }}
            />
          ))}
        </div>
      ) : (
        <ul className={styles.rulesTags}>
          {enabledRules.map(rule => {
            const label = rule.label(language);
            return (
              <li key={rule.key}>
                <Tag title={label}>{label}</Tag>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RoomActions({
  room,
  isOwner,
  canStartGame,
  canEnterGame,
  onAck,
}: {
  room: BaseRoom;
  isOwner: boolean;
  canStartGame: boolean;
  canEnterGame: boolean;
  onAck: (res: SocketAck) => void;
}): ReactElement {
  const navigate = useNavigate();
  const { cleanupCurrentIdleRoom } = useActiveGame();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const onStartGame = useCallback(() => {
    if (!canStartGame) {
      showSnackbar(translation.errors[ERROR.CANNOT_START]);
      return;
    }

    emitEvent(EVENTS.GAME_START, { roomId: room.id }, onAck);
  }, [canStartGame, onAck, room.id, showSnackbar, translation]);

  return (
    <div className={styles.actions}>
      {canEnterGame ? (
        <Button
          variant={ButtonVariant.SUCCESS}
          onClick={() => {
            void navigate(getGameBoardPath(room.game));
          }}
        >
          {translation.roomButton.enter}
        </Button>
      ) : null}
      {isOwner && !canEnterGame ? (
        <Button
          variant={ButtonVariant.SUCCESS}
          disabled={!canStartGame}
          onClick={onStartGame}
        >
          {translation.roomButton.startGame}
        </Button>
      ) : null}
      <Button variant={ButtonVariant.DANGER} onClick={cleanupCurrentIdleRoom}>
        {isOwner
          ? translation.roomButton.closeRoom
          : translation.roomButton.leaveRoom}
      </Button>
    </div>
  );
}
