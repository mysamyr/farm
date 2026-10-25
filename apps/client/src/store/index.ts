import { readStoredUsername } from '@game/client-core/utils';
import { CHAT_HISTORY_LIMIT, type GameId } from '@game/shared/constants';
import type { ChatMessage, GameMetadata } from '@game/shared/types';
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

// ─── Chat ────────────────────────────────────────────────────────────────────

interface ChatSlice {
  roomId: string | null;
  messages: ChatMessage[];
  isOpen: boolean;
  unread: number;
  reset: (roomId: string | null) => void;
  setHistory: (roomId: string, history: ChatMessage[]) => void;
  addMessage: (roomId: string, message: ChatMessage, isOwn: boolean) => void;
  setOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatSlice>((set, get) => ({
  roomId: null,
  messages: [],
  isOpen: false,
  unread: 0,
  reset: roomId => set({ roomId, messages: [], unread: 0, isOpen: false }),
  setHistory: (roomId, history) => {
    if (get().roomId !== roomId) return;
    const known = new Set(history.map(message => message.id));
    const live = get().messages.filter(message => !known.has(message.id));
    set({ messages: [...history, ...live].slice(-CHAT_HISTORY_LIMIT) });
  },
  addMessage: (roomId, message, isOwn) => {
    const state = get();
    if (state.roomId !== roomId) return;
    if (state.messages.some(existing => existing.id === message.id)) return;
    set({
      messages: [...state.messages, message].slice(-CHAT_HISTORY_LIMIT),
      unread: state.isOpen || isOwn ? state.unread : state.unread + 1,
    });
  },
  setOpen: isOpen => set(isOpen ? { isOpen, unread: 0 } : { isOpen }),
}));
