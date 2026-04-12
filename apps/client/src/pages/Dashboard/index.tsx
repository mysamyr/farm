import React, { ReactElement, useCallback, useState } from 'react';

import { FARM_EVENTS } from '@game/shared/constants/farm';

import HelpModal from '../../components/modals/HelpModal';
import QrModal from '../../components/modals/QrModal';
import LanguageDropdown from '../../components/ui/LanguageDropdown';
import { LOCAL_STORAGE_KEY } from '../../constants';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { useLanguage } from '../../hooks/useLanguage';
import { useModal } from '../../hooks/useModal';
import { useRoom } from '../../hooks/useRoom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { emitEvent } from '../../socket/client';

import CurrentRoomPanel from './CurrentRoomPanel';
import RoomCard from './RoomCard';

function Dashboard(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const [usernameInput, setUsernameInput] = useState(
    window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME) ?? ''
  );

  const onRoomCreate = useCallback(() => {
    const name = usernameInput.trim();
    if (!name) {
      showSnackbar(translation.dashboard.errors.noUserNameOnCreateRoom);
      return;
    }

    if (currentRoom) {
      showSnackbar(translation.dashboard.errors.alreadyInRoom);
      return;
    }

    emitEvent(
      FARM_EVENTS.ROOM_CREATE,
      null,
      (res: { ok: boolean; error?: string }): void => {
        if (!res.ok) {
          showSnackbar(
            translation.dashboard.errors.apiErrorOnCreatingRoom +
              (res.error || '')
          );
        }
      }
    );
  }, [usernameInput, currentRoom, showSnackbar, translation]);

  const debouncedEmitRename = useDebounceCallback((newName: string) => {
    emitEvent(FARM_EVENTS.PLAYER_RENAME, { name: newName });
  }, 500);

  const onUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const trimmed = event.target.value.trim();
      setUsernameInput(trimmed);
      if (trimmed) {
        debouncedEmitRename(trimmed);

        window.localStorage.setItem(LOCAL_STORAGE_KEY.USERNAME, trimmed);
      }
    },
    [showSnackbar, translation]
  );

  return (
    <div>
      <div className="top-bar">
        <div className="brand">
          <h1>{translation.dashboard.header}</h1>
          <LanguageDropdown />
          <button
            type="button"
            className="header-action"
            title="Show QR Code"
            onClick={() => {
              showModal(QrModal);
            }}
          >
            📷
          </button>
          <button
            type="button"
            className="header-action"
            title="Show Help"
            onClick={() => {
              showModal(HelpModal);
            }}
          >
            ❓
          </button>
        </div>

        <div className="user-profile">
          <div className="input-group">
            <label htmlFor="username">
              {translation.dashboard.usernameInputLabel}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={translation.dashboard.usernameInputPlaceholder}
              value={usernameInput}
              onChange={onUsernameChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRoomCreate}
          >
            {translation.dashboard.createRoomBtn}
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="rooms-list-section">
          <h2>{translation.dashboard.openRoomsHeader}</h2>
          <div className="room-list">
            {!rooms.length ? (
              <p>{translation.dashboard.noActiveRooms}</p>
            ) : (
              rooms.map(room => (
                <RoomCard room={room} usernameInput={usernameInput} />
              ))
            )}
          </div>
        </div>

        <div className="current-room-section">
          <h2>{translation.dashboard.currentRoomHeader}</h2>
          <div className="panel-card">
            {!currentRoom ? (
              <p>{translation.dashboard.noCurrentRoom}</p>
            ) : (
              <CurrentRoomPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
