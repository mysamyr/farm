import React, { useState } from 'react';
import type { ReactElement } from 'react';

import { LANGUAGES_CONFIG } from '../../constants/language';
import { useLanguage } from '../../hooks/useLanguage';
import { Language } from '../../types/language';

function LanguageDropdown(): ReactElement {
  const { setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="header-action"
        title="Change Language"
        onClick={() => setIsOpen(!isOpen)}
      >
        🌍
      </button>

      {isOpen ? (
        <div id="language-dropdown">
          {LANGUAGES_CONFIG.map((item: Language) => (
            <div
              key={item.code}
              className="language-option"
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
