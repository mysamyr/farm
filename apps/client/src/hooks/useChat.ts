import { useCallback } from 'react';

import { useLanguage, useSnackbar } from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS, VALIDATION } from '@game/shared/constants';
import { useShallow } from 'zustand/react/shallow';

import { useChatStore } from '../store/index.js';

export function normalizeChatInput(text: string): string {
  return text.trim();
}

export function isValidChatInput(text: string): boolean {
  const length = [...normalizeChatInput(text)].length;
  return length > 0 && length <= VALIDATION.CHAT_MESSAGE.MAX_LENGTH;
}

export function useChat() {
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const state = useChatStore(
    useShallow(s => ({
      roomId: s.roomId,
      messages: s.messages,
      isOpen: s.isOpen,
      unread: s.unread,
      setOpen: s.setOpen,
    }))
  );
  const { roomId } = state;

  const sendMessage = useCallback(
    (rawText: string, onResult?: (ok: boolean) => void): void => {
      const text = normalizeChatInput(rawText);
      if (!roomId || !isValidChatInput(text)) {
        onResult?.(false);
        return;
      }
      emitEvent(EVENTS.CHAT_SEND, { roomId, text }, res => {
        onResult?.(res.ok);
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
      });
    },
    [roomId, showSnackbar, translation]
  );

  return { ...state, sendMessage };
}
