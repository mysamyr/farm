import { type ReactElement, useCallback, useEffect } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { FARM_EVENTS, GAME_RULES } from '@game/shared/constants/farm';
import type { Room } from '@game/shared/types/farm';

import { Navigate, useNavigate } from 'react-router-dom';

import Button from '../../../../components/ui/Button';
import { Header } from '../../../../components/ui/Header';
import { BUTTON_VARIANT, PATHS } from '../../../../constants';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useModal } from '../../../../hooks/useModal';
import { useRoom } from '../../../../hooks/useRoom';
import { useSnackbar } from '../../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../../socket/client';
import { resolveErrorMessage } from '../../../../utils/language';
import TradeModal from '../../components/TradeModal';
import { useFarmTranslation } from '../../hooks/useFarmTranslation';
import { getCurrentPlayerTurnId } from '../../utils';

import ActiveCardsSection from './components/ActiveCardsSection';
import DiceSection from './components/DiceSection';
import EmoteFloatingContainer from './components/EmoteFloatingContainer';
import ExchangeSection from './components/ExchangeSection';
import PlayersSection from './components/PlayersSection';
import WinningAnimation from './components/WinningAnimation';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const navigate = useNavigate();
  const { currentRoom: rawCurrentRoom, setCurrentRoom } = useRoom();
  const { showModal, closeModal } = useModal();
  const { translation } = useLanguage();
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

  const shouldConfirmLeave = currentRoom?.state === ROOM_STATES.RUNNING;

  const handleLeave = useCallback(() => {
    if (!rawCurrentRoom) {
      return;
    }
    emitEvent(FARM_EVENTS.ROOM_LEAVE, { roomId: rawCurrentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(PATHS.DASHBOARD);
    });
  }, [rawCurrentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  function onLeaveClick() {
    if (!shouldConfirmLeave || window.confirm(farmT.roomLeaveConfirmation)) {
      handleLeave();
    }
  }

  // Auto-open/close trade modal based on room trade state
  useEffect(() => {
    if (!currentRoom?.trade) {
      closeModal();
      return;
    }
    const myId = getSocketId();
    const isParticipant =
      currentRoom.trade.initiatorId === myId ||
      currentRoom.trade.targetId === myId;
    if (isParticipant) {
      showModal({
        component: TradeModal,
        onClose: () => {
          emitEvent(FARM_EVENTS.GAME_TRADE_CANCEL, { roomId: currentRoom.id });
        },
      });
    }
  }, [currentRoom?.trade, currentRoom?.id, showModal, closeModal]);

  if (!currentRoom) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  const currentPlayerId = getCurrentPlayerTurnId(currentRoom);
  const isYourTurn =
    currentRoom.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const isLimitedCardsRule = !currentRoom.rules[GAME_RULES.UNLIMITED_CARDS];

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
            {translation.roomButton.leaveRoom}
          </Button>
        }
      />

      <DiceSection isYourTurn={isYourTurn} />

      {isLimitedCardsRule && <ActiveCardsSection />}

      <PlayersSection />

      <ExchangeSection isYourTurn={isYourTurn} />

      <WinningAnimation />

      <EmoteFloatingContainer />
    </div>
  );
}
