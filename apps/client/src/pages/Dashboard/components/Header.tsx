import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import { BUTTON_VARIANT } from '../../../constants';
import { LANGUAGES_CONFIG } from '../../../constants/language';
import { THEME } from '../../../constants/theme';
import { getDefaultGameConfig } from '../../../games/registry';
import { useConnection } from '../../../hooks/useConnection';
import { useLanguage } from '../../../hooks/useLanguage';
import { useModal } from '../../../hooks/useModal';
import { useTheme } from '../../../hooks/useTheme';
import { Language } from '../../../types/language';

import styles from './Header.module.css';

export default function Header() {
  const { online } = useConnection();
  const { translation } = useLanguage();
  const { showModal } = useModal();
  const { setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const languageItems = LANGUAGES_CONFIG.map((item: Language) => ({
    key: item.code,
    label: item.name,
    onSelect: () => setLanguage(item.code),
  }));

  return (
    <header className={styles.container}>
      <div>
        <div className={styles.logo}>🎲 {translation.dashboard.header}</div>
        <div className={styles.onlineIndicator}>
          <span className={styles.dot}></span>
          <span>{online} Online</span>
        </div>
      </div>

      <div className={styles.headerTools}>
        <Dropdown
          triggerVariant={BUTTON_VARIANT.ICON}
          triggerTitle="Change Language"
          trigger={'🌐'}
          items={languageItems}
        />

        <Button
          variant={BUTTON_VARIANT.ICON}
          title="Toggle Theme"
          onClick={() =>
            setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
          }
        >
          {theme === THEME.LIGHT ? '🌙' : '☀️'}
        </Button>

        <Button
          variant={BUTTON_VARIANT.ICON}
          title="Show Help"
          onClick={() => showModal(getDefaultGameConfig().HelpModal)}
        >
          ❓
        </Button>
      </div>
    </header>
  );
}
