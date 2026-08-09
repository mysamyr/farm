import { type ChangeEvent, useCallback } from 'react';

import { Button } from '@game/client-core/components';
import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import {
  useActiveGame,
  useDebounceCallback,
  useLanguage,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS, VALIDATION } from '@game/shared/constants';

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
  const { activeGame } = useActiveGame();

  const onRoomCreate = useCallback(() => {
    const name = usernameInput.trim();
    const nameLength = [...name].length;

    if (!name) {
      showSnackbar(translation.errors[ERROR.NO_USERNAME]);
      return;
    }

    if (nameLength < VALIDATION.USER_NAME.MIN_LENGTH) {
      showSnackbar(translation.errors.userNameTooShort);
      return;
    }

    if (nameLength > VALIDATION.USER_NAME.MAX_LENGTH) {
      showSnackbar(translation.errors.userNameTooLong);
      return;
    }

    if (currentRoom) {
      showSnackbar(translation.errors[ERROR.ALREADY_IN_ROOM]);
      return;
    }

    emitEvent(EVENTS.ROOM_CREATE, { game: activeGame }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [usernameInput, currentRoom, showSnackbar, translation, activeGame]);

  const debouncedEmitRename = useDebounceCallback((newName: string) => {
    emitEvent(EVENTS.PLAYER_RENAME, { name: newName });
  }, 500);

  const onUsernameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const normalized = value.trim();
      const normalizedLength = [...normalized].length;
      const isValidLength =
        normalizedLength >= VALIDATION.USER_NAME.MIN_LENGTH &&
        normalizedLength <= VALIDATION.USER_NAME.MAX_LENGTH;

      setUsernameInput(value);

      if (isValidLength) {
        debouncedEmitRename(normalized);
        window.localStorage.setItem(LOCAL_STORAGE_KEY.USERNAME, normalized);
      }
    },
    [setUsernameInput, debouncedEmitRename]
  );

  const normalizedUsername = usernameInput.trim();
  const usernameLength = [...normalizedUsername].length;
  const usernameError =
    normalizedUsername.length === 0
      ? null
      : usernameLength < VALIDATION.USER_NAME.MIN_LENGTH
        ? translation.errors.userNameTooShort
        : usernameLength > VALIDATION.USER_NAME.MAX_LENGTH
          ? translation.errors.userNameTooLong
          : null;

  return (
    <section className={styles.container}>
      <div>
        <label className={styles.usernameLabel} htmlFor="username">
          {translation.dashboard.usernameInputLabel}
        </label>
        <input
          className={`${styles.usernameInput}${usernameError ? ` ${styles.usernameInputError}` : ''}`}
          type="text"
          id="username"
          value={usernameInput}
          onChange={onUsernameChange}
        />
        {usernameError && <p className={styles.inputError}>{usernameError}</p>}
      </div>
      <Button onClick={onRoomCreate}>
        {translation.dashboard.createRoomBtn}
      </Button>
    </section>
  );
}
