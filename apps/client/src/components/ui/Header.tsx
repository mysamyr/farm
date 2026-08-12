import {
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import { Button, Dropdown, Sidebar } from '@game/client-core/components';
import {
  BUTTON_VARIANT,
  LANGUAGES_CONFIG,
  PATHS,
  THEME,
} from '@game/client-core/constants';
import {
  useConnection,
  useLanguage,
  useModal,
  useRoom,
  useSnackbar,
  useTheme,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import type { Language } from '@game/client-core/types';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const { online } = useConnection();
  const { currentRoom, setCurrentRoom } = useRoom();
  const { showModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const { setLanguage, translation } = useLanguage();
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
    if (!helpModal) return;
    setSidebarOpen(false);
    showModal({ component: helpModal });
  }

  function navigateToDashboard() {
    if (
      currentRoom?.state !== ROOM_STATES.RUNNING ||
      window.confirm('Leave the arena?')
    ) {
      emitEvent(EVENTS.ROOM_LEAVE, { roomId: currentRoom!.id }, (res: { ok: boolean; error?: string }) => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
        setCurrentRoom(null);
      });
    }
    void navigate(PATHS.DASHBOARD);
  }

  function toggleTheme() {
    setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT);
  }

  const defaultLeftSlot = useMemo(
    () => (
      <>
        <div className={styles.logo} onClick={navigateToDashboard}>Game Hub</div>
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
