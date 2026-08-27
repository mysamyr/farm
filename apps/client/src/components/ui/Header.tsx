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
import { emitEvent, getSocketId } from '@game/client-core/socket';
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

  const headerT = translation.header;
  const inGameT = translation.inGame;
  const helpModal = activeGame ? gameConfig?.HelpModal : SiteRulesModal;
  const isOnPlayRoute = isGameBoardPathname(location.pathname);
  const isInRoom = isOnPlayRoute && !!currentRoom;
  const isRunningGame = isInRoom && currentRoom?.state === ROOM_STATES.RUNNING;
  const displayName = username.trim() || headerT.setName;
  const isLightTheme = theme === Theme.LIGHT;
  const isRoomOwner = currentRoom?.ownerId === getSocketId();

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
      !window.confirm(headerT.leaveRoomConfirmation)
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
        title: inGameT.lobbyConfirmTitle,
        message: inGameT.lobbyConfirmMessage,
        confirmLabel: inGameT.lobbyConfirmButton,
        cancelLabel: inGameT.cancel,
        onConfirm: handleReturnToLobby,
      },
    });
  }

  function renderExtraActions() {
    if (!isInRoom && !additionalActions) {
      return null;
    }

    const handleLeaveRoomClick = () => {
      closeSidebar();
      handleLeaveRoom();
    };

    return (
      <>
        {isRunningGame && (
          <>
            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles.sidebarControl}
              onClick={() => {
                closeSidebar();
                handleRematch();
              }}
            >
              🔄 {translation.postGame.rematch}
            </Button>
            {isRoomOwner && (
              <Button
                variant={ButtonVariant.SECONDARY}
                className={styles.sidebarControl}
                onClick={openReturnToLobbyConfirm}
              >
                🏠 {inGameT.lobby}
              </Button>
            )}
          </>
        )}
        {additionalActions}
        {isInRoom && (
          <Button
            variant={
              isRunningGame ? ButtonVariant.DANGER : ButtonVariant.SECONDARY
            }
            className={styles.sidebarControl}
            onClick={handleLeaveRoomClick}
          >
            {translation.roomButton.leaveRoom}
          </Button>
        )}
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
          <span>{headerT.online(online)}</span>
        </div>
      </div>

      <Button
        variant={ButtonVariant.ICON}
        title={headerT.openMenu}
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
              triggerTitle={headerT.changeLanguage}
              trigger={`🌐 ${headerT.language}`}
              items={languageItems}
              align="left"
              triggerClassName={styles.sidebarControl}
            />

            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles.sidebarControl}
              title={headerT.toggleTheme}
              onClick={toggleTheme}
            >
              {isLightTheme
                ? '🌙' + ' ' + headerT.darkMode
                : '☀️' + ' ' + headerT.lightMode}
            </Button>

            <Button
              variant={ButtonVariant.SECONDARY}
              className={styles.sidebarControl}
              title={headerT.showRules}
              onClick={openHelp}
              disabled={!helpModal}
            >
              {`❓ ${headerT.rules}`}
            </Button>

            {renderExtraActions()}
          </div>
        </div>
      </Sidebar>
    </header>
  );
}
