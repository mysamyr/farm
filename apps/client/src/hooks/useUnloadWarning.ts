import { useEffect } from 'react';

import { ROOM_STATES } from '@game/shared/constants';

import type { Room } from '@game/shared/types';

import { reconnectSocket } from '../socket/client';

export function useUnloadWarning(currentRoom: Room | null): void {
  useEffect(() => {
    const shouldWarn = (): boolean => {
      return !!currentRoom && currentRoom.state === ROOM_STATES.RUNNING;
    };

    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!shouldWarn()) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        reconnectSocket();
      }
    };

    const onOnline = (): void => {
      reconnectSocket();
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
    };
  }, [currentRoom]);
}
