import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  ChangeNameModal,
  Dropdown,
  Sidebar,
} from '@game/client-core/components';
import {
  ButtonVariant,
  getCatalogPath,
  LANGUAGES_CONFIG,
  Theme,
} from '@game/client-core/constants';
import {
  useActiveGame,
  useConnection,
  useLanguage,
  useModal,
  useTheme,
  useUsername,
} from '@game/client-core/hooks';
import type { Language } from '@game/client-core/types';
import { classNames } from '@game/client-core/utils';
import { Link } from 'react-router-dom';

import styles from './Header.module.css';

export interface MainHeaderProps {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  additionalActions?: ReactNode;
  /** Help modal component to show when help button is clicked */
  helpModal?: ComponentType;
}

export function Header({
  leftSlot,
  centerSlot,
  rightSlot,
  additionalActions,
  helpModal,
}: MainHeaderProps): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { online } = useConnection();
  const { showModal } = useModal();
  const { setLanguage, translation } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { username } = useUsername();
  const { cleanupCurrentIdleRoom } = useActiveGame();

  const languageItems = LANGUAGES_CONFIG.map((item: Language) => ({
    key: item.code,
    label: item.name,
    onSelect: () => {
      setLanguage(item.code);
      setSidebarOpen(false);
    },
  }));

  function openHelp() {
    if (!helpModal) return;
    setSidebarOpen(false);
    showModal({ component: helpModal });
  }

  function openChangeName() {
    setSidebarOpen(false);
    showModal({ component: ChangeNameModal });
  }

  function toggleTheme() {
    setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }

  const displayName = username.trim() || translation.header.setName;

  const usernameControl = (
    <button
      type="button"
      className={styles.username}
      onClick={openChangeName}
      title={translation.changeName.title}
    >
      {displayName}
    </button>
  );

  const defaultLeftSlot = useMemo(
    () => (
      <>
        <Link
          to={getCatalogPath()}
          className={styles.logo}
          onClick={() => cleanupCurrentIdleRoom()}
        >
          Game Hub
        </Link>
        <div className={styles.onlineIndicator}>
          <span className={styles.dot} />
          <span>{online} Online</span>
        </div>
      </>
    ),
    [cleanupCurrentIdleRoom, online]
  );

  const defaultDesktopRightSlot = (
    <>
      <Dropdown
        triggerVariant={ButtonVariant.ICON}
        triggerTitle="Change Language"
        trigger="🌐"
        items={languageItems}
        align="right"
      />

      <Button
        variant={ButtonVariant.ICON}
        title="Toggle Theme"
        onClick={toggleTheme}
      >
        {theme === Theme.LIGHT ? '🌙' : '☀️'}
      </Button>

      <Button
        variant={ButtonVariant.ICON}
        title="Show Rules"
        onClick={openHelp}
      >
        ❓
      </Button>

      {usernameControl}
    </>
  );

  const defaultSidebarRightSlot = (
    <>
      <Dropdown
        triggerVariant={ButtonVariant.SECONDARY}
        triggerTitle="Change Language"
        trigger="🌐 Language"
        items={languageItems}
        triggerClassName={styles.sidebarControl}
      />

      <Button
        variant={ButtonVariant.SECONDARY}
        className={styles.sidebarControl}
        onClick={() => {
          toggleTheme();
          setSidebarOpen(false);
        }}
      >
        {theme === Theme.LIGHT ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </Button>

      <Button
        variant={ButtonVariant.SECONDARY}
        className={styles.sidebarControl}
        onClick={openHelp}
      >
        ❓ Rules
      </Button>

      <button
        type="button"
        className={classNames(styles.username, styles.sidebarUsername)}
        onClick={openChangeName}
        title={translation.changeName.title}
      >
        {displayName}
      </button>
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
        variant={ButtonVariant.ICON}
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
