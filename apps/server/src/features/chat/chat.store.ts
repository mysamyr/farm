import { CHAT_HISTORY_LIMIT } from '@game/shared/constants';
import type { ChatMessage } from '@game/shared/types';

/**
 * Room chat history keyed by room id. Kept apart from the room object so it
 * never leaks into room list broadcasts or game state projections.
 */
const chats: Map<string, ChatMessage[]> = new Map();

export function getChatMessages(roomId: string): ChatMessage[] {
  return chats.get(roomId) ?? [];
}

export function appendChatMessage(roomId: string, message: ChatMessage): void {
  const messages = chats.get(roomId) ?? [];
  messages.push(message);
  if (messages.length > CHAT_HISTORY_LIMIT) {
    messages.splice(0, messages.length - CHAT_HISTORY_LIMIT);
  }
  chats.set(roomId, messages);
}

export function remapChatAuthor(
  roomId: string,
  oldAuthorId: string,
  newAuthorId: string
): void {
  const messages = chats.get(roomId);
  if (!messages) return;
  for (const message of messages) {
    if (message.authorId === oldAuthorId) {
      message.authorId = newAuthorId;
    }
  }
}

export function clearChat(roomId: string): void {
  chats.delete(roomId);
}
