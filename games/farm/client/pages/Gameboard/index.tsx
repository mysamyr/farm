import { type ReactElement, useCallback, useEffect } from 'react';

import { Header } from '@game/client/components';
import { Button, WinningAnimation } from '@game/client-core/components';

import { BUTTON_VARIANT, PATHS } from '@game/client-core/constants';
import {
  useLanguage,
  useModal,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ROOM_STATES } from '@game/shared/constants';
import { Navigate, useNavigate } from 'react-router-dom';

import { FARM_EVENTS, GAME_RULES, type Room } from '@game/game-farm/shared';

import FarmHelpModal from '../../components/FarmHelpModal';

import TradeModal from '../../components/TradeModal';
import { useFarmTranslation } from '../../hooks/useFarmTranslation';
import { getCurrentPlayerTurnId } from '../../utils';

import ActiveCardsSection from './components/ActiveCardsSection';
import DiceSection from './components/DiceSection';
import EmoteFloatingContainer from './components/EmoteFloatingContainer';
import ExchangeSection from './components/ExchangeSection';
import PlayersSection from './components/PlayersSection';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const navigate = useNavigate();
  const { currentRoom: rawCurrentRoom, setCurrentRoom } = useRoom();
  const { showModal, closeModal } = useModal();
  const { translation } = useLanguage();
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

  const handleLeave = useCallback(() => {
    if (!rawCurrentRoom) {
      return;
    }
    emitGameEvent(
      FARM_EVENTS.ROOM_LEAVE,
      { roomId: rawCurrentRoom.id },
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
        setCurrentRoom(null);
        void navigate(PATHS.DASHBOARD);
      }
    );
  }, [rawCurrentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  function onLeaveClick() {
    if (
      currentRoom?.state !== ROOM_STATES.RUNNING ||
      window.confirm(farmT.roomLeaveConfirmation)
    ) {
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
          emitGameEvent(FARM_EVENTS.GAME_TRADE_CANCEL, {
            roomId: currentRoom.id,
          });
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
        helpModal={FarmHelpModal}
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
