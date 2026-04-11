export const getValue = (key: string): string | null =>
  window.localStorage.getItem(key);

export const setValue = (key: string, value: string): void =>
  localStorage.setItem(key, value);

export const removeValue = (key: string): void => localStorage.removeItem(key);
