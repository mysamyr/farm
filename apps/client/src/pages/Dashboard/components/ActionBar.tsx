import React, { useCallback } from 'react';

import { FARM_EVENTS } from '@game/shared/constants/farm';

import Button from '../../../components/ui/Button';
import { LOCAL_STORAGE_KEY } from '../../../constants';
import { useDebounceCallback } from '../../../hooks/useDebounceCallback';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';

import { emitEvent } from '../../../socket/client';

import styles from './ActionBar.module.css';

type ActionBarProps = {
  usernameInput: string;
  setUsernameInput: (name: string) => void;
};

export default function ActionBar({
  usernameInput,
  setUsernameInput,
}: ActionBarProps) {
  const { translation } = useLanguage();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();

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
    <section className={styles.container}>
      <div>
        <label className={styles.usernameLabel} htmlFor="username">
          {translation.dashboard.usernameInputLabel}
        </label>
        <input
          className={styles.usernameInput}
          type="text"
          id="username"
          value={usernameInput}
          onChange={onUsernameChange}
        />
      </div>
      <Button onClick={onRoomCreate}>
        {translation.dashboard.createRoomBtn}
      </Button>
    </section>
  );
}
