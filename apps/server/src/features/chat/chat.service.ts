import { VALIDATION } from '@game/shared/constants';

const THROTTLE_WINDOW_MS = 5_000;
const THROTTLE_MAX_MESSAGES = 5;

// C0/C1 control characters, line/paragraph separators and bidi overrides
const UNSAFE_CHARS =
  /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;

const sendTimestamps: Map<string, number[]> = new Map();

/**
 * Normalizes user input into a single safe line of text.
 * Returns null when the message is empty or too long.
 */
export function sanitizeChatText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const text = raw.replace(UNSAFE_CHARS, ' ').trim();
  const length = [...text].length;
  if (length === 0 || length > VALIDATION.CHAT_MESSAGE.MAX_LENGTH) {
    return null;
  }
  return text;
}

export function isChatThrottled(socketId: string, now = Date.now()): boolean {
  const recent = (sendTimestamps.get(socketId) ?? []).filter(
    time => now - time < THROTTLE_WINDOW_MS
  );
  if (recent.length >= THROTTLE_MAX_MESSAGES) {
    sendTimestamps.set(socketId, recent);
    return true;
  }
  recent.push(now);
  sendTimestamps.set(socketId, recent);
  return false;
}

export function clearChatThrottle(socketId: string): void {
  sendTimestamps.delete(socketId);
}
