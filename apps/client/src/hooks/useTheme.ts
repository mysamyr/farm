import { useShallow } from 'zustand/react/shallow';

import { useThemeStore } from '../store/index.js';

export function useTheme() {
  return useThemeStore(
    useShallow(s => ({
      theme: s.theme,
      setTheme: s.setTheme,
    }))
  );
}
