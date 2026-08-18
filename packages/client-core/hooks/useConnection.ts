import { useShallow } from 'zustand/react/shallow';

import { useConnectionStore } from '../store/index.js';

export function useConnection() {
  return useConnectionStore(
    useShallow(s => ({
      online: s.online,
      rejoinSettled: s.rejoinSettled,
      setOnline: s.setOnline,
      setRejoinSettled: s.setRejoinSettled,
    }))
  );
}
