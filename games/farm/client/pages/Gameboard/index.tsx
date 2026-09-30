import { type ReactElement, useEffect } from 'react';

import { useModal, useRoom, useRoomRole } from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import { GAME_RULES, type Room } from '@game/game-farm/shared';

import TradeModal from '../../components/TradeModal.js';
import { getCurrentPlayerTurnId } from '../../utils/index.js';

import ActiveCardsSection from './components/ActiveCardsSection.js';
import DiceSection from './components/DiceSection.js';
import EmoteFloatingContainer from './components/EmoteFloatingContainer.js';
import ExchangeSection from './components/ExchangeSection.js';
import PlayersSection from './components/PlayersSection.js';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { isSpectator } = useRoomRole();
  const { showModal, closeModal } = useModal();

  const currentRoom = rawCurrentRoom as unknown as Room | null;
  const socketId = getSocketId();

  // Auto-open/close trade modal based on room trade state
  useEffect(() => {
    if (isSpectator) {
      closeModal();
      return;
    }
    if (!currentRoom?.trade) {
      closeModal();
      return;
    }
    const isParticipant =
      currentRoom.trade.initiatorId === socketId ||
      currentRoom.trade.targetId === socketId;
    if (isParticipant) {
      showModal({
        component: TradeModal,
        onClose: () => {
          emitGameEvent(EVENTS.GAME_ACTION, {
            roomId: currentRoom.id,
            action: { type: 'TRADE_CANCEL' },
          });
        },
      });
    }
  }, [
    currentRoom?.trade,
    currentRoom?.id,
    isSpectator,
    socketId,
    showModal,
    closeModal,
  ]);

  if (!currentRoom) {
    return <></>;
  }

  const currentPlayerId = getCurrentPlayerTurnId(currentRoom);
  const isYourTurn =
    currentRoom.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === socketId;

  const isLimitedCardsRule = !currentRoom.rules[GAME_RULES.UNLIMITED_CARDS];

  return (
    <div className={styles.container}>
      <DiceSection
        room={currentRoom}
        isYourTurn={isYourTurn}
        isSpectator={isSpectator}
      />

      {isLimitedCardsRule && <ActiveCardsSection room={currentRoom} />}

      <PlayersSection room={currentRoom} isSpectator={isSpectator} />

      {!isSpectator && (
        <ExchangeSection room={currentRoom} isYourTurn={isYourTurn} />
      )}

      <EmoteFloatingContainer />
    </div>
  );
}
