import React, { ReactElement } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import {
  DEFAULT_CONFIG,
  FARM_EVENTS,
  GAME_RULES,
} from '@game/shared/constants/farm';
import { Room } from '@game/shared/types/farm';

import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { getOwnerName, getRuleLabel } from '../../utils/game';

type RoomCardProps = {
  room: Room;
  usernameInput: string;
};

function RoomCard({ room, usernameInput }: RoomCardProps): ReactElement {
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
    <div key={room.id} className="room-card">
      <div className="room-details">
        <h3>{room.name}</h3>
        <div className="room-meta">
          <span className="badge badge-owner">
            {translation.owner}: {ownerLabel}
          </span>
          <span className={`badge badge-state ${room.state}`}>
            {translation.roomState[room.state]}
          </span>
          <span className="player-count">
            👥 {room.players.length}/{DEFAULT_CONFIG.maxPlayers}
          </span>
        </div>
        <div className="rules-tags">
          {Object.values(GAME_RULES)
            .filter(rule => room.rules[rule])
            .map(rule => (
              <span key={rule} className="rule-tag">
                {getRuleLabel(rule, translation)}
              </span>
            ))}
        </div>
      </div>

      <button
        type="button"
        className={`btn ${isBtnDisabled ? 'btn-secondary' : 'btn-primary'}`}
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
      </button>
    </div>
  );
}

export default RoomCard;
