import { LOCAL_STORAGE_KEY as CORE_STORAGE_KEY } from '@game/client-core/constants';
import { VALIDATION, type GameId } from '@game/shared/constants';
import type { GameMetadata } from '@game/shared/types';
import { create } from 'zustand';

import { type Theme } from '../constants/index.js';
import { getTheme, setTheme as setThemeStorage } from '../utils/theme.js';

// ─── Theme ──────────────────────────────────────────────────────────────────

interface ThemeSlice {
  theme: Theme;
  setTheme: (nextTheme: Theme) => void;
}

export const useThemeStore = create<ThemeSlice>((set, get) => ({
  theme: getTheme(),
  setTheme: nextTheme => {
    if (nextTheme === get().theme) return;
    setThemeStorage(nextTheme);
    set({ theme: nextTheme });
  },
}));

// ─── Connection ──────────────────────────────────────────────────────────────

interface ConnectionSlice {
  online: number;
  rejoinSettled: boolean;
  setOnline: (online: number) => void;
  setRejoinSettled: (settled: boolean) => void;
}

export const useConnectionStore = create<ConnectionSlice>(set => ({
  online: 0,
  rejoinSettled: false,
  setOnline: online => set({ online: Math.max(online, 1) }),
  setRejoinSettled: settled => set({ rejoinSettled: settled }),
}));

// ─── Username ────────────────────────────────────────────────────────────────

function readStoredUsername(): string {
  const stored = window.localStorage.getItem(CORE_STORAGE_KEY.USERNAME) ?? '';
  return [...stored].slice(0, VALIDATION.USER_NAME.MAX_LENGTH).join('');
}

interface UsernameSlice {
  username: string;
  setUsername: (username: string) => void;
}

export const useUsernameStore = create<UsernameSlice>(set => ({
  username: readStoredUsername(),
  setUsername: username => set({ username }),
}));

// ─── Games ───────────────────────────────────────────────────────────────────

interface GamesSlice {
  games: GameMetadata[];
  loading: boolean;
  error: string | null;
  setGames: (games: GameMetadata[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getGame: (gameId: GameId) => GameMetadata | undefined;
  getDefaultGameId: () => GameId | null;
}

export const useGamesStore = create<GamesSlice>((set, get) => ({
  games: [],
  loading: true,
  error: null,
  setGames: games => set({ games, loading: false, error: null }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error, loading: false }),
  getGame: gameId => get().games.find(g => g.id === gameId),
  getDefaultGameId: () => get().games[0]?.id ?? null,
}));
