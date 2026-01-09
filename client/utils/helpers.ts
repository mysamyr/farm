import type { Room } from '../types';

export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

// TODO: review
export function areRoomsChanged(roomsA: Room[], roomsB: Room[]): boolean {
  if (roomsA.length !== roomsB.length) return true;
  const sortById = (arr: Room[]) =>
    [...arr].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const a = sortById(roomsA);
  const b = sortById(roomsB);
  for (let i = 0; i < a.length; i++) {
    if (String(a[i]!.id) !== String(b[i]!.id)) return true;
    const pa = (a[i]!.players || []).map(p => String(p.id)).sort();
    const pb = (b[i]!.players || []).map(p => String(p.id)).sort();
    if (pa.length !== pb.length) return true;
    for (let j = 0; j < pa.length; j++) if (pa[j] !== pb[j]) return true;
  }
  return false;
}
