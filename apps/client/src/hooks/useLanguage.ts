import { useContext } from 'react';

import { LanguageContext } from '../contexts/languageContext';

export function useLanguage() {
  const languageContext = useContext(LanguageContext);

  if (!languageContext) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }

  return languageContext;
}
