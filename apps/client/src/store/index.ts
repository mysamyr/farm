/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, Dispatch, SetStateAction } from 'react';

import type { Room } from '@game/shared/types/farm';
import { create } from 'zustand';

import { type ThemeCode } from '../constants';
import languageMap, { LanguageCode } from '../constants/language';
import type { Translation } from '../types/language';
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from '../utils/language';
import { getTheme, setTheme as setThemeStorage } from '../utils/theme';

// ─── Language ────────────────────────────────────────────────────────────────

interface LanguageSlice {
  language: LanguageCode;
  translation: Translation;
  setLanguage: (nextLanguage: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageSlice>((set, get) => ({
  language: getLanguage(),
  translation: languageMap[getLanguage()],
  setLanguage: nextLanguage => {
    if (nextLanguage === get().language) return;
    setLanguageStorage(nextLanguage);
    set({ language: nextLanguage, translation: languageMap[nextLanguage] });
  },
}));

// ─── Theme ──────────────────────────────────────────────────────────────────

interface ThemeSlice {
  theme: ThemeCode;
  setTheme: (nextTheme: ThemeCode) => void;
}

export const useThemeStore = create<ThemeSlice>((set, get) => ({
  theme: getTheme(),
  setTheme: nextTheme => {
    if (nextTheme === get().theme) return;
    setThemeStorage(nextTheme);
    set({ theme: nextTheme });
  },
}));

// ─── Rooms ───────────────────────────────────────────────────────────────────

interface RoomsSlice {
  rooms: Room[];
  currentRoom: Room | null;
  setRooms: Dispatch<SetStateAction<Room[]>>;
  setCurrentRoom: Dispatch<SetStateAction<Room | null>>;
  clearCurrentRoom: () => void;
}

export const useRoomsStore = create<RoomsSlice>((set, get) => ({
  rooms: [],
  currentRoom: null,
  setRooms: value =>
    set({
      rooms: typeof value === 'function' ? value(get().rooms) : value,
    }),
  setCurrentRoom: value =>
    set({
      currentRoom:
        typeof value === 'function' ? value(get().currentRoom) : value,
    }),
  clearCurrentRoom: () => set({ currentRoom: null }),
}));

// ─── Snackbar ─────────────────────────────────────────────────────────────────

interface SnackbarSlice {
  open: boolean;
  message: string;
  showSnackbar: (message: string, duration?: number) => void;
  closeSnackbar: () => void;
}

let snackbarTimeout: ReturnType<typeof setTimeout> | null = null;

export const useSnackbarStore = create<SnackbarSlice>(set => ({
  open: false,
  message: '',
  showSnackbar: (msg, duration = 5000) => {
    if (snackbarTimeout) clearTimeout(snackbarTimeout);
    set({ open: true, message: msg });
    snackbarTimeout = setTimeout(() => set({ open: false }), duration);
  },
  closeSnackbar: () => set({ open: false }),
}));

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalSlice {
  open: boolean;
  modalComponent: ComponentType<any> | null;
  showModal: <T extends Record<string, any>>(
    component: ComponentType<T>
  ) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalSlice>(set => ({
  open: false,
  modalComponent: null,
  showModal: component =>
    set({ open: true, modalComponent: component as ComponentType<any> }),
  closeModal: () => {
    set({ open: false });
    setTimeout(() => set({ modalComponent: null }), 200);
  },
}));

// ─── Connection ──────────────────────────────────────────────────────────────

interface ConnectionSlice {
  online: number;
  setOnline: (online: number) => void;
}

export const useConnectionStore = create<ConnectionSlice>(set => ({
  online: 0,
  setOnline: online => set({ online: Math.max(online, 1) }),
}));
