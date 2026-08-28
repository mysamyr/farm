import { useCallback } from 'react';

import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import { emitEvent } from '@game/client-core/socket';
import { EVENTS } from '@game/shared/constants';
import { useShallow } from 'zustand/react/shallow';

import { useUsernameStore } from '../store/index.js';
import { isValidUsername } from '../utils/index.js';

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
