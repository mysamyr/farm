import { useShallow } from 'zustand/react/shallow';

import { useLanguageStore } from '../store/index.js';

export function useLanguage() {
  return useLanguageStore(
    useShallow(s => ({
      language: s.language,
      translation: s.translation,
      setLanguage: s.setLanguage,
    }))
  );
}
