import { useEffect } from 'react';

import { useRoom } from '@game/client-core/hooks';
import {
  emitEvent,
  getSocketId,
  subscribe,
  unsubscribe,
} from '@game/client-core/socket';
import { EVENTS } from '@game/shared/constants';
import type { ChatMessagePayload } from '@game/shared/types';

import { useChatStore } from '../store/index.js';

function requestHistory(roomId: string): void {
  emitEvent(EVENTS.CHAT_HISTORY, { roomId }, res => {
    if (res.ok && res.messages) {
      useChatStore.getState().setHistory(roomId, res.messages);
    }
  });
}

export function useChatSubscriptions(): void {
  const { currentRoom } = useRoom();
  const roomId = currentRoom?.id ?? null;

  useEffect(() => {
    const handleMessage = ({
      roomId: messageRoomId,
      message,
    }: ChatMessagePayload): void => {
      useChatStore
        .getState()
        .addMessage(messageRoomId, message, message.authorId === getSocketId());
    };
    const handleConnect = (): void => {
      const activeRoomId = useChatStore.getState().roomId;
      if (activeRoomId) requestHistory(activeRoomId);
    };

    subscribe(EVENTS.CHAT_MESSAGE, handleMessage);
    subscribe(EVENTS.CONNECT, handleConnect);
    return () => {
      unsubscribe(EVENTS.CHAT_MESSAGE, handleMessage);
      unsubscribe(EVENTS.CONNECT, handleConnect);
    };
  }, []);

  useEffect(() => {
    if (useChatStore.getState().roomId === roomId) return;
    useChatStore.getState().reset(roomId);
    if (roomId) requestHistory(roomId);
  }, [roomId]);
}
