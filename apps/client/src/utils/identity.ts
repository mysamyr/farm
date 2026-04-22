import { uuid } from '@game/shared/utils';

import { LOCAL_STORAGE_KEY } from '../constants';

export function getUserId(): string {
  let userId = window.localStorage.getItem(LOCAL_STORAGE_KEY.USER_ID);
  if (!userId) {
    userId = uuid();
    // Cannot use crypto.randomUUID() as it is only supported for localhost and HTTPS
    window.localStorage.setItem(LOCAL_STORAGE_KEY.USER_ID, userId);
  }
  return userId;
}
