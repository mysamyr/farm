import { ComponentType, Dispatch, SetStateAction } from 'react';

import type { Room } from '@game/shared/types';
import { create } from 'zustand';

import languageMap, { LanguageCode } from '../constants/language';
import { type ThemeCode } from '../constants/theme';
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
  modal: ModalConfig | null;
  showModal: <T extends Record<string, unknown>>(
    config: ModalConfig<T>
  ) => void;
  requestCloseModal: (reason?: ModalCloseReason) => void;
  closeModal: () => void;
}

export type ModalCloseReason = 'backdrop' | 'escape' | 'programmatic';

export interface ModalConfig<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  component: ComponentType<T>;
  props?: T;
  onClose?: (reason: ModalCloseReason) => boolean | void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

let modalUnmountTimeout: ReturnType<typeof setTimeout> | null = null;

export const useModalStore = create<ModalSlice>((set, get) => ({
  open: false,
  modal: null,
  showModal: config => {
    if (modalUnmountTimeout) {
      clearTimeout(modalUnmountTimeout);
      modalUnmountTimeout = null;
    }
    set({
      open: true,
      modal: {
        closeOnBackdrop: true,
        closeOnEscape: true,
        ...config,
      } as ModalConfig,
    });
  },
  requestCloseModal: (reason = 'programmatic') => {
    const activeModal = get().modal;
    if (!activeModal) {
      return;
    }

    if (reason === 'backdrop' && activeModal.closeOnBackdrop === false) {
      return;
    }
    if (reason === 'escape' && activeModal.closeOnEscape === false) {
      return;
    }

    const shouldClose = activeModal.onClose?.(reason) !== false;
    if (!shouldClose) {
      return;
    }

    get().closeModal();
  },
  closeModal: () => {
    if (modalUnmountTimeout) {
      clearTimeout(modalUnmountTimeout);
    }
    set({ open: false });
    modalUnmountTimeout = setTimeout(() => {
      set({ modal: null });
      modalUnmountTimeout = null;
    }, 200);
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
