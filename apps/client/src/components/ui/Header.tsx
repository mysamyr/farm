import { type ReactElement, type ReactNode, useMemo, useState } from 'react';

import { BUTTON_VARIANT } from '../../constants';
import { LANGUAGES_CONFIG } from '../../constants/language';
import { THEME } from '../../constants/theme';
import { getGameConfig } from '../../games/registry';
import { useActiveGame } from '../../hooks/useActiveGame';
import { useConnection } from '../../hooks/useConnection';
import { useLanguage } from '../../hooks/useLanguage';
import { useModal } from '../../hooks/useModal';
import { useTheme } from '../../hooks/useTheme';
import type { Language } from '../../types/language';
import { classNames } from '../../utils';

import Button from './Button';
import Dropdown from './Dropdown';
import styles from './Header.module.css';
import { Sidebar } from './Sidebar';

export interface MainHeaderProps {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  additionalActions?: ReactNode;
}

export function Header({
  leftSlot,
  centerSlot,
  rightSlot,
  additionalActions,
}: MainHeaderProps): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { online } = useConnection();
  const { showModal } = useModal();
  const { setLanguage } = useLanguage();
  const { activeGame } = useActiveGame();
  const { theme, setTheme } = useTheme();

  const languageItems = LANGUAGES_CONFIG.map((item: Language) => ({
    key: item.code,
    label: item.name,
    onSelect: () => {
      setLanguage(item.code);
      setSidebarOpen(false);
    },
  }));

  function openHelp() {
    setSidebarOpen(false);
    showModal({ component: getGameConfig(activeGame).HelpModal });
  }

  function toggleTheme() {
    setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT);
  }

  const defaultLeftSlot = useMemo(
    () => (
      <>
        <div className={styles.logo}>Game Hub</div>
        <div className={styles.onlineIndicator}>
          <span className={styles.dot} />
          <span>{online} Online</span>
        </div>
      </>
    ),
    [online]
  );

  const defaultDesktopRightSlot = (
    <>
      <Dropdown
        triggerVariant={BUTTON_VARIANT.ICON}
        triggerTitle="Change Language"
        trigger="🌐"
        items={languageItems}
        align="right"
      />

      <Button
        variant={BUTTON_VARIANT.ICON}
        title="Toggle Theme"
        onClick={toggleTheme}
      >
        {theme === THEME.LIGHT ? '🌙' : '☀️'}
      </Button>

      <Button
        variant={BUTTON_VARIANT.ICON}
        title="Show Rules"
        onClick={openHelp}
      >
        ❓
      </Button>
    </>
  );

  const defaultSidebarRightSlot = (
    <>
      <Dropdown
        triggerVariant={BUTTON_VARIANT.SECONDARY}
        triggerTitle="Change Language"
        trigger="🌐 Language"
        items={languageItems}
        triggerClassName={styles.sidebarControl}
      />

      <Button
        variant={BUTTON_VARIANT.SECONDARY}
        className={styles.sidebarControl}
        onClick={() => {
          toggleTheme();
          setSidebarOpen(false);
        }}
      >
        {theme === THEME.LIGHT ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </Button>

      <Button
        variant={BUTTON_VARIANT.SECONDARY}
        className={styles.sidebarControl}
        onClick={openHelp}
      >
        ❓ Rules
      </Button>
    </>
  );

  const resolvedLeftSlot = leftSlot ?? defaultLeftSlot;
  const resolvedCenterSlot = centerSlot ?? null;
  const resolvedDesktopRightSlot = rightSlot ?? defaultDesktopRightSlot;
  const resolvedSidebarRightSlot = rightSlot ?? defaultSidebarRightSlot;

  return (
    <header className={styles.container}>
      <div className={styles.left}>{resolvedLeftSlot}</div>

      <div className={styles.center}>{resolvedCenterSlot}</div>

      <div className={styles.desktopTools}>
        <div className={styles.rightSlot}>{resolvedDesktopRightSlot}</div>
        {additionalActions ? (
          <div className={styles.additionalActions}>{additionalActions}</div>
        ) : null}
      </div>

      <Button
        variant={BUTTON_VARIANT.ICON}
        className={classNames(styles.burger)}
        title="Open menu"
        onClick={() => setSidebarOpen(true)}
      >
        <span className={styles.burgerGlyph}>☰</span>
      </Button>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSlot}>{resolvedSidebarRightSlot}</div>
            {additionalActions ? (
              <div className={styles.sidebarSlot}>{additionalActions}</div>
            ) : null}
          </div>
        </div>
      </Sidebar>
    </header>
  );
}
