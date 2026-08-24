import { type ReactElement, type ReactNode, useState } from 'react';

import {
  Button,
  ChangeNameModal,
  ConfirmationModal,
  Dropdown,
  Sidebar,
  SiteRulesModal,
  BurgerIcon,
} from '@game/client-core/components';
import {
  ButtonVariant,
  getCatalogPath,
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
import { resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import { Link, useLocation } from 'react-router-dom';

import { useGameConfig } from '../../hooks/index.js';

import styles from './Header.module.css';

type HeaderProps = {
  additionalActions?: ReactNode;
};

export function Header({ additionalActions }: HeaderProps): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { online } = useConnection();
  const { showModal } = useModal();
  const { setLanguage, translation } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { username } = useUsername();
  const { activeGame, cleanupCurrentIdleRoom } = useActiveGame();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { config: gameConfig } = useGameConfig(activeGame);

  const headerCopy = translation.header;
  const inGameCopy = translation.inGame;
  const helpModal = activeGame ? gameConfig?.HelpModal : SiteRulesModal;
  const isOnPlayRoute = isGameBoardPathname(location.pathname);
  const showLeaveRoom = isOnPlayRoute && !!currentRoom;
  const isRunningGame =
    isOnPlayRoute && currentRoom?.state === ROOM_STATES.RUNNING;
  const displayName = username.trim() || headerCopy.setName;
  const isLightTheme = theme === Theme.LIGHT;

  const languageItems = LANGUAGES_CONFIG.map(item => ({
    key: item.code,
    label: item.name,
    onSelect: () => {
      setLanguage(item.code);
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

    const { id: roomId } = currentRoom;

    emitEvent(EVENTS.ROOM_LEAVE, { roomId }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }

  function handleReturnToLobby() {
    if (!currentRoom) {
      return;
    }
    const { id: roomId } = currentRoom;
    emitEvent(EVENTS.GAME_RETURN_TO_LOBBY, { roomId }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }

  function handleRematch() {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_REMATCH, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }

  function openReturnToLobbyConfirm() {
    closeSidebar();
    showModal({
      component: ConfirmationModal,
      props: {
        title: inGameCopy.lobbyConfirmTitle,
        message: inGameCopy.lobbyConfirmMessage,
        confirmLabel: inGameCopy.lobbyConfirmButton,
        cancelLabel: inGameCopy.cancel,
        onConfirm: handleReturnToLobby,
      },
    });
  }

  function renderExtraActions() {
    const handleLeaveRoomClick = () => {
      closeSidebar();
      handleLeaveRoom();
    };

    const leaveRoomButton = showLeaveRoom ? (
      <Button
        variant={isRunningGame ? ButtonVariant.DANGER : ButtonVariant.SECONDARY}
        className={styles.sidebarControl}
        onClick={handleLeaveRoomClick}
      >
        {translation.roomButton.leaveRoom}
      </Button>
    ) : null;

    if (!showLeaveRoom && !additionalActions) {
      return null;
    }

    if (isRunningGame) {
      const postGameCopy = translation.postGame;
      return (
        <>
          <Button
            variant={ButtonVariant.SECONDARY}
            className={styles.sidebarControl}
            onClick={() => {
              closeSidebar();
              handleRematch();
            }}
          >
            🔄 {postGameCopy.rematch}
          </Button>
          <Button
            variant={ButtonVariant.SECONDARY}
            className={styles.sidebarControl}
            onClick={openReturnToLobbyConfirm}
          >
            🏠 {inGameCopy.lobby}
          </Button>
          {leaveRoomButton}
          {additionalActions}
        </>
      );
    }

    return (
      <>
        {leaveRoomButton}
        {additionalActions}
      </>
    );
  }

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

      <Button
        variant={ButtonVariant.ICON}
        title={headerCopy.openMenu}
        onClick={() => setSidebarOpen(true)}
      >
        <BurgerIcon />
      </Button>

      <Sidebar open={sidebarOpen} onClose={closeSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarSection}>
            <Button
              variant={ButtonVariant.TEXT}
              className={styles.sidebarControl}
              title={translation.changeName.title}
              onClick={openChangeName}
            >
              {displayName}
            </Button>

            <Dropdown
              triggerVariant={ButtonVariant.SECONDARY}
              triggerTitle={headerCopy.changeLanguage}
              trigger={`🌐 ${headerCopy.language}`}
              items={languageItems}
              align="left"
              triggerClassName={styles.sidebarControl}
            />

            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles.sidebarControl}
              title={headerCopy.toggleTheme}
              onClick={toggleTheme}
            >
              {isLightTheme
                ? '🌙' + ' ' + headerCopy.darkMode
                : '☀️' + ' ' + headerCopy.lightMode}
            </Button>

            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles.sidebarControl}
              title={headerCopy.showRules}
              onClick={openHelp}
              disabled={!helpModal}
            >
              {`❓ ${headerCopy.rules}`}
            </Button>

            {renderExtraActions()}
          </div>
        </div>
      </Sidebar>
    </header>
  );
}
