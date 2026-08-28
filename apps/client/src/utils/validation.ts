import { VALIDATION } from '@game/shared/constants';

export function graphemeLength(value: string): number {
  return [...value].length;
}

function isTrimmedLengthInRange(
  value: string,
  min: number,
  max: number
): boolean {
  const length = graphemeLength(value.trim());
  return length >= min && length <= max;
}

export function isValidUsername(name: string): boolean {
  return isTrimmedLengthInRange(
    name,
    VALIDATION.USER_NAME.MIN_LENGTH,
    VALIDATION.USER_NAME.MAX_LENGTH
  );
}

export function isValidRoomName(name: string): boolean {
  return isTrimmedLengthInRange(
    name,
    VALIDATION.ROOM_NAME.MIN_LENGTH,
    VALIDATION.ROOM_NAME.MAX_LENGTH
  );
}
