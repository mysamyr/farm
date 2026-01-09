import { ROOM_STATES } from '../constants';
import { reconnectSocket } from '../socket/client';
import { state } from '../state/store';

function shouldWarnOnUnload(): boolean {
  return !!state.currentRoom && state.currentRoom.state === ROOM_STATES.RUNNING;
}

let beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

export function setupUnloadWarning(): void {
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = null;
  }

  beforeUnloadHandler = (e: BeforeUnloadEvent): void => {
    if (shouldWarnOnUnload()) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', beforeUnloadHandler);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reconnectSocket();
    }
  });

  window.addEventListener('online', () => {
    reconnectSocket();
  });
}
