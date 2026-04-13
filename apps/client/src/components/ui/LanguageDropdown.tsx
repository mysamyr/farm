import React, { useState } from 'react';
import type { ReactElement } from 'react';

import { LANGUAGES_CONFIG } from '../../constants/language';
import { useLanguage } from '../../hooks/useLanguage';
import { Language } from '../../types/language';

import IconButton from './IconButton';
import styles from './LanguageDropdown.module.css';

function LanguageDropdown(): ReactElement {
  const { setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <IconButton
        icon="🌐"
        title="Change Language"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen ? (
        <div className={styles.dropdown}>
          {LANGUAGES_CONFIG.map((item: Language) => (
            <div
              key={item.code}
              className={styles.languageOption}
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default LanguageDropdown;
