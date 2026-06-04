import { type ReactElement, useCallback } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { ARENA_EVENTS } from '@game/shared/constants/arena';
import type { Room } from '@game/shared/types/arena';

import { Navigate, useNavigate } from 'react-router-dom';

import Button from '../../../../components/ui/Button';
import { Header } from '../../../../components/ui/Header';
import { WinningAnimation } from '../../../../components/ui/WinningAnimation';
import { BUTTON_VARIANT, PATHS } from '../../../../constants';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useRoom } from '../../../../hooks/useRoom';
import { useSnackbar } from '../../../../hooks/useSnackbar';
import { emitEvent } from '../../../../socket/client';

import { resolveErrorMessage } from '../../../../utils/language';
import { isAllPlayersReady } from '../../utils';

import FightPhase from './components/FightPhase';
import PreparationPhase from './components/PreparationPhase';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const navigate = useNavigate();
  const { currentRoom: rawCurrentRoom, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

  const handleLeave = useCallback(() => {
    if (!rawCurrentRoom) return;
    emitEvent(ARENA_EVENTS.ROOM_LEAVE, { roomId: rawCurrentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(PATHS.DASHBOARD);
    });
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
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  const isFightPhase = isAllPlayersReady(currentRoom);

  console.log('Current Room:', currentRoom);

  return (
    <div className={styles.container}>
      <Header
        centerSlot={<h1 className={styles.roomTitle}>{currentRoom.name}</h1>}
        additionalActions={
          <Button
            variant={BUTTON_VARIANT.SECONDARY}
            className={styles.leaveHeaderButton}
            onClick={onLeaveClick}
          >
            Leave
          </Button>
        }
      />
      {isFightPhase ? <FightPhase /> : <PreparationPhase />}
      <WinningAnimation />
    </div>
  );
}
