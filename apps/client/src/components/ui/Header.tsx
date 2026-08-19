import { type ReactElement, type ReactNode, useState } from 'react';

import {
  Button,
  ChangeNameModal,
  Dropdown,
  Sidebar,
  SiteRulesModal,
} from '@game/client-core/components';
import {
  ButtonVariant,
  getCatalogPath,
  getGamePath,
  isGameBoardPathname,
  LANGUAGES_CONFIG,
  Theme,
} from '@game/client-core/constants';
import {
  useActiveGame,
  useConnection,
  useLanguage,
  useModal,
  useRoom,
  useSnackbar,
  useTheme,
  useUsername,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useGameConfig } from '../../hooks/index.js';

import styles from './Header.module.css';

type HeaderProps = {
  additionalActions?: ReactNode;
};

export function Header({ additionalActions }: HeaderProps): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { online } = useConnection();
  const { showModal } = useModal();
  const { setLanguage, translation } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { username } = useUsername();
  const { activeGame, cleanupCurrentIdleRoom } = useActiveGame();
  const { currentRoom, setCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { config: gameConfig } = useGameConfig(activeGame);

  const headerCopy = translation.header;
  const helpModal = activeGame ? gameConfig?.HelpModal : SiteRulesModal;
  const showLeaveRoom = isGameBoardPathname(location.pathname) && !!currentRoom;
  const displayName = username.trim() || headerCopy.setName;
  const isLightTheme = theme === Theme.LIGHT;

  const languageItems = LANGUAGES_CONFIG.map(item => ({
    key: item.code,
    label: item.name,
    onSelect: () => {
      setLanguage(item.code);
      setSidebarOpen(false);
    },
  }));

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function openHelp() {
    if (!helpModal) {
      return;
    }
    closeSidebar();
    showModal({ component: helpModal });
  }

  function openChangeName() {
    closeSidebar();
    showModal({ component: ChangeNameModal });
  }

  function toggleTheme() {
    setTheme(isLightTheme ? Theme.DARK : Theme.LIGHT);
  }

  function handleLeaveRoom() {
    if (!currentRoom) {
      return;
    }

    if (
      currentRoom.state === ROOM_STATES.RUNNING &&
      !window.confirm(headerCopy.leaveRoomConfirmation)
    ) {
      return;
    }

    const { id: roomId, game } = currentRoom;

    emitEvent(EVENTS.ROOM_LEAVE, { roomId }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(getGamePath(game));
    });
  }

  function renderTools(placement: 'desktop' | 'sidebar') {
    const inSidebar = placement === 'sidebar';
    const toolVariant = inSidebar ? ButtonVariant.SECONDARY : ButtonVariant.ICON;
    const toolClassName = inSidebar ? styles.sidebarControl : undefined;
    const themeIcon = isLightTheme ? '🌙' : '☀️';
    const themeLabel = isLightTheme ? headerCopy.darkMode : headerCopy.lightMode;

    return (
      <>
        <Button
          variant={ButtonVariant.TEXT}
          className={classNames(
            styles.username,
            inSidebar && styles.sidebarControl
          )}
          title={translation.changeName.title}
          onClick={openChangeName}
        >
          {displayName}
        </Button>

        <Dropdown
          triggerVariant={toolVariant}
          triggerTitle={headerCopy.changeLanguage}
          trigger={inSidebar ? `🌐 ${headerCopy.language}` : '🌐'}
          items={languageItems}
          align={inSidebar ? 'left' : 'right'}
          triggerClassName={toolClassName}
        />

        <Button
          variant={toolVariant}
          className={toolClassName}
          title={headerCopy.toggleTheme}
          onClick={() => {
            toggleTheme();
            if (inSidebar) {
              closeSidebar();
            }
          }}
        >
          {inSidebar ? `${themeIcon} ${themeLabel}` : themeIcon}
        </Button>

        <Button
          variant={toolVariant}
          className={toolClassName}
          title={headerCopy.showRules}
          onClick={openHelp}
          disabled={!helpModal}
        >
          {inSidebar ? `❓ ${headerCopy.rules}` : '❓'}
        </Button>
      </>
    );
  }

  function renderExtraActions(inSidebar: boolean) {
    if (!showLeaveRoom && !additionalActions) {
      return null;
    }

    return (
      <>
        {showLeaveRoom ? (
          <Button
            variant={ButtonVariant.SECONDARY}
            className={inSidebar ? styles.sidebarControl : undefined}
            onClick={() => {
              closeSidebar();
              handleLeaveRoom();
            }}
          >
            {translation.roomButton.leaveRoom}
          </Button>
        ) : null}
        {additionalActions}
      </>
    );
  }

  const extraActionsDesktop = renderExtraActions(false);
  const extraActionsSidebar = renderExtraActions(true);

  return (
    <header className={styles.container}>
      <div className={styles.left}>
        <Link
          to={getCatalogPath()}
          className={styles.logo}
          onClick={() => cleanupCurrentIdleRoom()}
        >
          Game Hub
        </Link>
        <div className={styles.onlineIndicator}>
          <span className={styles.dot} />
          <span>{headerCopy.online(online)}</span>
        </div>
      </div>

      <div className={styles.desktopTools}>
        <div className={styles.rightSlot}>{renderTools('desktop')}</div>
        {extraActionsDesktop ? (
          <div className={styles.additionalActions}>{extraActionsDesktop}</div>
        ) : null}
      </div>

      <Button
        variant={ButtonVariant.ICON}
        className={styles.burger}
        title={headerCopy.openMenu}
        onClick={() => setSidebarOpen(true)}
      >
        <span className={styles.burgerGlyph}>☰</span>
      </Button>

      <Sidebar open={sidebarOpen} onClose={closeSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSlot}>{renderTools('sidebar')}</div>
            {extraActionsSidebar ? (
              <div className={styles.sidebarSlot}>{extraActionsSidebar}</div>
            ) : null}
          </div>
        </div>
      </Sidebar>
    </header>
  );
}
