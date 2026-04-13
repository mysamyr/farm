import { useShallow } from 'zustand/react/shallow';

import { useLanguageStore } from '../store';

export function useLanguage() {
  return useLanguageStore(
    useShallow(s => ({
      language: s.language,
      translation: s.translation,
      setLanguage: s.setLanguage,
    }))
  );
}
