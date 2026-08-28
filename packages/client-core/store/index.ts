import { type ComponentType, type Dispatch, type SetStateAction } from 'react';

import type { BaseRoom } from '@game/shared/types';
import { create } from 'zustand';

import languageMap, { LanguageCode } from '../constants/language.js';
import type { Translation } from '../types/index.js';
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from '../utils/language.js';

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

// ─── Rooms ───────────────────────────────────────────────────────────────────

interface RoomsSlice {
  rooms: BaseRoom[];
  currentRoom: BaseRoom | null;
  setRooms: Dispatch<SetStateAction<BaseRoom[]>>;
  setCurrentRoom: Dispatch<SetStateAction<BaseRoom | null>>;
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
  closeOnNavigate?: boolean;
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
      modal: config as ModalConfig,
    });
  },
  requestCloseModal: (reason = 'programmatic') => {
    const activeModal = get().modal;
    if (!activeModal) {
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
