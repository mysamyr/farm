import React, { createContext, useCallback, useMemo, useState } from 'react';

import languageMap, { LanguageCode } from '../constants/language';
import type { Translation } from '../types/language';
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from '../utils/language';

type LanguageContextType = {
  language: LanguageCode;
  translation: Translation;
  setLanguage: (nextLanguage: LanguageCode) => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getLanguage());

  const setLanguage = useCallback(
    (nextLanguage: LanguageCode): void => {
      if (nextLanguage === language) {
        return;
      }

      setLanguageStorage(nextLanguage);
      setLanguageState(nextLanguage);
    },
    [language]
  );

  const translation = useMemo(() => languageMap[language], [language]);

  const value = useMemo(
    () => ({
      language,
      translation,
      setLanguage,
    }),
    [language, setLanguage, translation]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
