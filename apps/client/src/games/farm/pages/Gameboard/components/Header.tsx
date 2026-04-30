import { ReactElement, useCallback } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { FARM_EVENTS } from '@game/shared/constants/farm';

import { useNavigate } from 'react-router-dom';

import Button from '../../../../../components/ui/Button';
import { BUTTON_VARIANT, PATHS } from '../../../../../constants';
import { useLanguage } from '../../../../../hooks/useLanguage';
import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent } from '../../../../../socket/client';
import { resolveErrorMessage } from '../../../../../utils/language';
import { useFarmTranslation } from '../../../hooks/useFarmTranslation';

import styles from './Header.module.css';

export default function Header(): ReactElement {
  const navigate = useNavigate();
  const { currentRoom, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();

  const room = currentRoom!;

  const shouldConfirmLeave = room.state === ROOM_STATES.RUNNING;

  const onLeave = useCallback(() => {
    emitEvent(FARM_EVENTS.ROOM_LEAVE, { roomId: room.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(PATHS.DASHBOARD);
    });
  }, [room, showSnackbar, translation, setCurrentRoom, navigate]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{room.name}</h1>

      <Button
        variant={BUTTON_VARIANT.SECONDARY}
        className={styles.leaveButton}
        onClick={() => {
          if (
            !shouldConfirmLeave ||
            window.confirm(farmT.roomLeaveConfirmation)
          ) {
            onLeave();
          }
        }}
      >
        {translation.roomButton.leaveRoom}
      </Button>
    </div>
  );
}
