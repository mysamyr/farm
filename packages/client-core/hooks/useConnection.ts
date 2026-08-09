import { useShallow } from 'zustand/react/shallow';

import { useConnectionStore } from '../store';

export function useConnection() {
  return useConnectionStore(
    useShallow(s => ({
      online: s.online,
      setOnline: s.setOnline,
    }))
  );
}
