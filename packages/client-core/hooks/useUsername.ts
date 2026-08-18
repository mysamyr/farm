import { useCallback } from 'react';

import { EVENTS, VALIDATION } from '@game/shared/constants';
import { useShallow } from 'zustand/react/shallow';

import { LOCAL_STORAGE_KEY } from '../constants/index.js';
import { emitEvent } from '../socket/index.js';
import { useUsernameStore } from '../store/index.js';

export function isValidUsername(name: string): boolean {
  const length = [...name.trim()].length;
  return (
    length >= VALIDATION.USER_NAME.MIN_LENGTH &&
    length <= VALIDATION.USER_NAME.MAX_LENGTH
  );
}

export function useUsername(): {
  username: string;
  isValid: boolean;
  setUsername: (name: string) => void;
} {
  const { username, setUsername: setStoredUsername } = useUsernameStore(
    useShallow(s => ({
      username: s.username,
      setUsername: s.setUsername,
    }))
  );

  const setUsername = useCallback(
    (name: string) => {
      const normalized = name.trim();
      setStoredUsername(normalized);

      if (isValidUsername(normalized)) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY.USERNAME, normalized);
        emitEvent(EVENTS.PLAYER_RENAME, { name: normalized });
      }
    },
    [setStoredUsername]
  );

  return {
    username,
    isValid: isValidUsername(username),
    setUsername,
  };
}
