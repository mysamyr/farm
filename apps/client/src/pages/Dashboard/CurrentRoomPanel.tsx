import { useEffect, useState } from 'react';

import type { ReactElement } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import {
  DEFAULT_CONFIG,
  FARM_EVENTS,
  GAME_RULES,
} from '@game/shared/constants/farm';

import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { getRuleLabel } from '../../utils/game';

function CurrentRoomPanel(): ReactElement {
  const roomsContext = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const room = roomsContext.currentRoom;

  if (!room) {
    throw new Error('CurrentRoomPanel requires currentRoom to be set.');
  }

  const [roomName, setRoomName] = useState(room.name);

  useEffect(() => {
    setRoomName(room.name);
  }, [room.name]);

  const isOwner = room.ownerId === getSocketId();

  return (
    <>
      <div>
        <span className="group-header-label">
          {translation.dashboard.roomName}
        </span>
        {isOwner ? (
          <input
            className="room-name-input"
            value={roomName}
            onChange={event => {
              setRoomName(event.target.value);
            }}
            onBlur={() => {
              const nextName = roomName.trim();
              if (!nextName) {
                setRoomName(room.name);
                showSnackbar(translation.dashboard.errors.noRoomName);
                return;
              }

              if (nextName === room.name) {
                return;
              }

              emitEvent(
                FARM_EVENTS.ROOM_UPDATE,
                { roomId: room.id, name: nextName },
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
        ) : (
          <h3>{room.name}</h3>
        )}
      </div>

      <div>
        <h4>
          {translation.dashboard.players} ({room.players.length}/
          {DEFAULT_CONFIG.maxPlayers})
        </h4>
        <ul>
          {room.players.map(player => {
            const isSelf = player.id === getSocketId();
            const isPlayerOwner = player.id === room.ownerId;
            return (
              <li className="player-row" key={player.id}>
                <span className="p-name">{player.name}</span>
                {isSelf ? (
                  <span className="badge badge-me">{translation.you}</span>
                ) : null}
                {isPlayerOwner ? (
                  <span className="badge badge-owner">{translation.owner}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rules-config">
        <h4>{translation.dashboard.roomRules}</h4>
        {isOwner ? (
          <div className="rule-toggles">
            {Object.values(GAME_RULES).map(rule => (
              <label key={rule} className="toggle">
                <span>{getRuleLabel(rule, translation)}</span>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={room.rules[rule]}
                    onChange={event => {
                      emitEvent(
                        FARM_EVENTS.ROOM_UPDATE,
                        {
                          roomId: room.id,
                          rules: {
                            [rule]: event.target.checked,
                          },
                        },
                        (res: { ok: boolean; error?: string }): void => {
                          if (!res.ok) {
                            showSnackbar(
                              res.error ||
                                translation.dashboard.errors.cannotStart
                            );
                          }
                        }
                      );
                    }}
                  />
                  <span className="slider" />
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="rules-tags">
            {Object.values(GAME_RULES)
              .filter(rule => room.rules[rule])
              .map(rule => (
                <span key={rule} className="rule-tag">
                  {getRuleLabel(rule, translation)}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="actions-panel">
        {isOwner ? (
          <>
            <button
              type="button"
              className="btn btn-success full-width"
              disabled={
                room.players.length < DEFAULT_CONFIG.minPlayers ||
                room.players.length > DEFAULT_CONFIG.maxPlayers ||
                room.state !== ROOM_STATES.IDLE
              }
              onClick={() => {
                if (
                  room.players.length < DEFAULT_CONFIG.minPlayers ||
                  room.players.length > DEFAULT_CONFIG.maxPlayers ||
                  room.state !== ROOM_STATES.IDLE
                ) {
                  showSnackbar(translation.dashboard.errors.cannotStart);
                  return;
                }
                emitEvent(
                  FARM_EVENTS.GAME_START,
                  { roomId: room.id },
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
            </button>

            <button
              type="button"
              className="btn btn-danger-outline full-width"
              onClick={() => {
                emitEvent(
                  FARM_EVENTS.ROOM_CLOSE,
                  { roomId: room.id },
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
              {translation.roomButton.closeRoom}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-danger-outline full-width"
            onClick={() => {
              emitEvent(FARM_EVENTS.ROOM_LEAVE, { roomId: room.id });
            }}
          >
            {translation.roomButton.leaveRoom}
          </button>
        )}
      </div>
    </>
  );
}

export default CurrentRoomPanel;
