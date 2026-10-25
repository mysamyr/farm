import type { BaseRoom } from '@game/shared/types';

const rooms: Map<string, BaseRoom> = new Map();
// Kept outside room objects so passwords never get serialized to clients
const roomPasswords: Map<string, string> = new Map();

export function getRoomById(roomId: string): BaseRoom | null {
  return rooms.get(roomId) || null;
}

export function listRooms(): BaseRoom[] {
  return Array.from(rooms.values());
}

export function setRoom(room: BaseRoom): void {
  rooms.set(room.id, room);
}

export function removeRoom(roomId: string): boolean {
  roomPasswords.delete(roomId);
  return rooms.delete(roomId);
}

export function getRoomPassword(roomId: string): string | undefined {
  return roomPasswords.get(roomId);
}

export function setRoomPassword(roomId: string, password: string): void {
  roomPasswords.set(roomId, password);
}

export function getRoomsMap(): Map<string, BaseRoom> {
  return rooms;
}
