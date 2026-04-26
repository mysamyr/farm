import { type ChangeEvent, useCallback } from 'react';

import { ERROR, VALIDATION } from '@game/shared/constants';
import { FARM_EVENTS } from '@game/shared/constants/farm';

import Button from '../../../components/ui/Button';
import { LOCAL_STORAGE_KEY } from '../../../constants';
import { useDebounceCallback } from '../../../hooks/useDebounceCallback';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';

import { emitEvent } from '../../../socket/client';
import { resolveErrorMessage } from '../../../utils/language';

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

    emitEvent(FARM_EVENTS.ROOM_CREATE, null, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [usernameInput, currentRoom, showSnackbar, translation]);

  const debouncedEmitRename = useDebounceCallback((newName: string) => {
    emitEvent(FARM_EVENTS.PLAYER_RENAME, { name: newName });
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
