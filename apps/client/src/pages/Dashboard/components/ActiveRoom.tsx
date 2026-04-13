import React, { ReactElement, useState } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import {
  DEFAULT_CONFIG,
  FARM_EVENTS,
  GAME_RULES,
} from '@game/shared/constants/farm';

import Button from '../../../components/ui/Button';
import Slider from '../../../components/ui/Slider';
import Tag from '../../../components/ui/Tag';
import { BUTTON_VARIANT } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';

import { emitEvent, getSocketId } from '../../../socket/client';

import { classNames } from '../../../utils';
import { getRuleLabel } from '../../../utils/game';

import styles from './ActiveRoom.module.css';

export default function ActiveRoom(): ReactElement {
  const { currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  if (!currentRoom) {
    throw new Error('ActiveRoom component rendered without currentRoom');
  }

  const [roomName, setRoomName] = useState(currentRoom.name);

  const isOwner = currentRoom.ownerId === getSocketId();

  const canStartGame =
    currentRoom.players.length >= DEFAULT_CONFIG.minPlayers &&
    currentRoom.players.length <= DEFAULT_CONFIG.maxPlayers &&
    currentRoom.state === ROOM_STATES.IDLE;

  return (
    <aside className={styles.activeRoom}>
      <div>
        {isOwner && (
          <input
            type="text"
            className={styles.roomName}
            value={roomName}
            disabled={!isOwner}
            onChange={event => {
              setRoomName(event.target.value);
            }}
            onBlur={() => {
              const nextName = roomName.trim();
              if (!nextName) {
                setRoomName(currentRoom.name);
                showSnackbar(translation.dashboard.errors.noRoomName);
                return;
              }

              if (nextName === currentRoom.name) {
                return;
              }

              emitEvent(
                FARM_EVENTS.ROOM_UPDATE,
                { roomId: currentRoom.id, name: nextName },
                (res: { ok: boolean; error?: string }): void => {
                  if (!res.ok) {
                    showSnackbar(
                      res.error || translation.dashboard.errors.noRoomName
                    );
                  }
                }
              );
            }}
          />
        )}
        {!isOwner && <h3 className={styles.roomName}>{currentRoom.name}</h3>}
        <span>
          {currentRoom.players.length}/{DEFAULT_CONFIG.maxPlayers}{' '}
          {translation.dashboard.players}
        </span>
      </div>

      <div className={styles.playersList}>
        {currentRoom.players.map(player => {
          const isSelf = player.id === getSocketId();
          const isPlayerOwner = player.id === currentRoom.ownerId;

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
              <span>{isPlayerOwner ? '⭐' : ''}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.rulesSection}>
        <h4>{translation.dashboard.roomRules}</h4>
        {isOwner ? (
          <div className={styles.rulesToggles}>
            {Object.values(GAME_RULES).map(rule => (
              <Slider
                key={rule}
                label={getRuleLabel(rule, translation)}
                checked={currentRoom.rules[rule]}
                onChange={event => {
                  emitEvent(
                    FARM_EVENTS.ROOM_UPDATE,
                    {
                      roomId: currentRoom.id,
                      rules: {
                        [rule]: event.target.checked,
                      },
                    },
                    (res: { ok: boolean; error?: string }): void => {
                      if (!res.ok) {
                        showSnackbar(
                          res.error || translation.dashboard.errors.cannotStart
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
            {Object.values(GAME_RULES)
              .filter(rule => currentRoom.rules[rule])
              .map(rule => (
                <Tag key={rule}>{getRuleLabel(rule, translation)}</Tag>
              ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {isOwner && (
          <Button
            variant={BUTTON_VARIANT.SUCCESS}
            disabled={!canStartGame}
            onClick={() => {
              if (!canStartGame) {
                showSnackbar(translation.dashboard.errors.cannotStart);
                return;
              }
              emitEvent(
                FARM_EVENTS.GAME_START,
                { roomId: currentRoom.id },
                (res: { ok: boolean; error?: string }): void => {
                  if (!res.ok) {
                    showSnackbar(
                      res.error || translation.dashboard.errors.cannotStart
                    );
                  }
                }
              );
            }}
          >
            {translation.roomButton.startGame}
          </Button>
        )}
        <Button
          variant={BUTTON_VARIANT.DANGER}
          onClick={() => {
            emitEvent(FARM_EVENTS.ROOM_LEAVE, { roomId: currentRoom.id });
          }}
        >
          {isOwner
            ? translation.roomButton.closeRoom
            : translation.roomButton.leaveRoom}
        </Button>
      </div>
    </aside>
  );
}
