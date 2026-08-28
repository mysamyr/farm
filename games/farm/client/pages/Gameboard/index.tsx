import { type ReactElement, useEffect } from 'react';

import { WinningAnimation } from '@game/client-core/components';
import { useModal, useRoom } from '@game/client-core/hooks';
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
  const { showModal, closeModal } = useModal();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

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
          emitGameEvent(EVENTS.GAME_ACTION, {
            roomId: currentRoom.id,
            action: { type: 'TRADE_CANCEL' },
          });
        },
      });
    }
  }, [currentRoom?.trade, currentRoom?.id, showModal, closeModal]);

  if (!currentRoom) {
    return <></>;
  }

  const currentPlayerId = getCurrentPlayerTurnId(currentRoom);
  const isYourTurn =
    currentRoom.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const isLimitedCardsRule = !currentRoom.rules[GAME_RULES.UNLIMITED_CARDS];

  return (
    <div className={styles.container}>
      <DiceSection isYourTurn={isYourTurn} />

      {isLimitedCardsRule && <ActiveCardsSection />}

      <PlayersSection />

      <ExchangeSection isYourTurn={isYourTurn} />

      <WinningAnimation />

      <EmoteFloatingContainer />
    </div>
  );
}
