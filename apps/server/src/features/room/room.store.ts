import type { BaseRoom } from '@game/shared/types';

const rooms: Map<string, BaseRoom> = new Map();

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
  return rooms.delete(roomId);
}

export function getRoomsMap(): Map<string, BaseRoom> {
  return rooms;
}
