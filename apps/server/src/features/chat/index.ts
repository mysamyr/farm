import { ERROR, EVENTS } from '@game/shared/constants';
import type {
  ChatHistoryAck,
  ChatMessage,
  ChatSendPayload,
  RoomIdPayload,
} from '@game/shared/types';
import { uuid } from '@game/shared/utils';

import { LogLevel } from '../../constants/index.js';
import { log } from '../../services/logger.js';
import type { AckFunc, AppServer, AppSocket } from '../../types/index.js';
import { getRoomById, getRoomRole } from '../room/room.service.js';

import {
  clearChatThrottle,
  isChatThrottled,
  sanitizeChatText,
} from './chat.service.js';
import { appendChatMessage, getChatMessages } from './chat.store.js';

export { clearChat, remapChatAuthor } from './chat.store.js';

const sendMessageHandler =
  (io: AppServer, socket: AppSocket) =>
  (req: ChatSendPayload, ack?: AckFunc): void => {
    log(LogLevel.DEBUG, 'event:chat:send', {
      socketId: socket.id,
      roomId: req?.roomId,
    });

    const room = getRoomById(req?.roomId);
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }

    const role = getRoomRole(room, socket.id);
    if (role === 'spectator') {
      ack?.({ ok: false, error: ERROR.CHAT_READ_ONLY });
      return;
    }
    const author = room.players.find(player => player.id === socket.id);
    if (!author) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }

    const text = sanitizeChatText(req.text);
    if (text === null) {
      ack?.({ ok: false, error: ERROR.INVALID_CHAT_MESSAGE });
      return;
    }

    if (isChatThrottled(socket.id)) {
      ack?.({ ok: false, error: ERROR.THROTTLED });
      return;
    }

    const message: ChatMessage = {
      id: uuid(),
      authorId: author.id,
      authorName: author.name,
      text,
    };
    appendChatMessage(room.id, message);
    io.to(room.id).emit(EVENTS.CHAT_MESSAGE, { roomId: room.id, message });
    ack?.({ ok: true });
  };

const historyHandler =
  (_io: AppServer, socket: AppSocket) =>
  (req: RoomIdPayload, ack?: AckFunc<ChatHistoryAck>): void => {
    const room = getRoomById(req?.roomId);
    if (!room) {
      ack?.({ ok: false, error: ERROR.ROOM_NOT_FOUND });
      return;
    }
    if (!getRoomRole(room, socket.id)) {
      ack?.({ ok: false, error: ERROR.PLAYER_NOT_FOUND });
      return;
    }
    ack?.({ ok: true, messages: getChatMessages(room.id) });
  };

export function registerChatFeature(io: AppServer, socket: AppSocket): void {
  socket.on(EVENTS.CHAT_SEND, sendMessageHandler(io, socket));
  socket.on(EVENTS.CHAT_HISTORY, historyHandler(io, socket));
  socket.on(EVENTS.DISCONNECT, () => clearChatThrottle(socket.id));
}
