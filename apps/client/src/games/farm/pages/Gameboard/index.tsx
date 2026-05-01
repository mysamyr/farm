import { type ReactElement, useEffect } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { FARM_EVENTS, GAME_RULES } from '@game/shared/constants/farm';
import type { Room as FarmRoom } from '@game/shared/types/farm';

import { Navigate } from 'react-router-dom';

import { PATHS } from '../../../../constants';
import { useModal } from '../../../../hooks/useModal';
import { useRoom } from '../../../../hooks/useRoom';
import { emitEvent, getSocketId } from '../../../../socket/client';
import TradeModal from '../../components/TradeModal';
import { getCurrentPlayerTurnId } from '../../utils';

import ActiveCardsSection from './components/ActiveCardsSection';
import DiceSection from './components/DiceSection';
import EmoteFloatingContainer from './components/EmoteFloatingContainer';
import ExchangeSection from './components/ExchangeSection';
import Header from './components/Header';
import PlayersSection from './components/PlayersSection';
import WinningAnimation from './components/WinningAnimation';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const { currentRoom } = useRoom();
  const { showModal, closeModal } = useModal();

  const room = currentRoom as unknown as FarmRoom | null;

  // Auto-open/close trade modal based on room trade state
  useEffect(() => {
    if (!room?.trade) {
      closeModal();
      return;
    }
    const myId = getSocketId();
    const isParticipant =
      room.trade.initiatorId === myId || room.trade.targetId === myId;
    if (isParticipant) {
      showModal({
        component: TradeModal,
        onClose: () => {
          emitEvent(FARM_EVENTS.GAME_TRADE_CANCEL, { roomId: room.id });
        },
      });
    }
  }, [room?.trade, room?.id, showModal, closeModal]);

  if (!currentRoom) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  const farmRoom = room!;
  const currentPlayerId = getCurrentPlayerTurnId(farmRoom);
  const isYourTurn =
    farmRoom.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const isLimitedCardsRule = !farmRoom.rules[GAME_RULES.UNLIMITED_CARDS];

  return (
    <div className={styles.container}>
      <Header />

      <DiceSection isYourTurn={isYourTurn} />

      {isLimitedCardsRule && <ActiveCardsSection />}

      <PlayersSection
        currentPlayerId={currentPlayerId}
        winnerId={farmRoom.winner}
      />

      <ExchangeSection isYourTurn={isYourTurn} />

      <WinningAnimation />

      <EmoteFloatingContainer />
    </div>
  );
}
