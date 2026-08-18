import { type ReactElement, useCallback } from 'react';

import { Header } from '@game/client/components';
import { Button, WinningAnimation } from '@game/client-core/components';

import { ButtonVariant, getGamePath } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

import { type Room } from '@game/game-arena/shared';

import ArenaHelpModal from '../../components/ArenaHelpModal.js';

import { isAllPlayersReady } from '../../utils/index.js';

import FightPhase from './components/FightPhase.js';
import PreparationPhase from './components/PreparationPhase.js';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const navigate = useNavigate();
  const { currentRoom: rawCurrentRoom, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

  const handleLeave = useCallback(() => {
    if (!rawCurrentRoom) return;
    emitGameEvent(
      EVENTS.ROOM_LEAVE,
      { roomId: rawCurrentRoom.id },
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
        setCurrentRoom(null);
        void navigate(getGamePath(rawCurrentRoom.game));
      }
    );
  }, [rawCurrentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  function onLeaveClick() {
    if (
      currentRoom?.state !== ROOM_STATES.RUNNING ||
      window.confirm('Leave the arena?')
    ) {
      handleLeave();
    }
  }

  if (!currentRoom) {
    return <></>;
  }

  const isPreparationPhase = !isAllPlayersReady(currentRoom);

  return (
    <div className={styles.container}>
      <Header
        centerSlot={<h1 className={styles.roomTitle}>{currentRoom.name}</h1>}
        helpModal={ArenaHelpModal}
        additionalActions={
          <Button
            variant={ButtonVariant.SECONDARY}
            className={styles.leaveHeaderButton}
            onClick={onLeaveClick}
          >
            Leave
          </Button>
        }
      />
      {isPreparationPhase ? <PreparationPhase /> : <FightPhase />}
      <WinningAnimation />
    </div>
  );
}
