import type { ReactElement } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { GAME_RULES } from '@game/shared/constants/farm';
import type { Room as FarmRoom } from '@game/shared/types/farm';

import { Navigate } from 'react-router-dom';

import { PATHS } from '../../../../constants';
import { useRoom } from '../../../../hooks/useRoom';
import { getSocketId } from '../../../../socket/client';
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

  if (!currentRoom) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  const room = currentRoom as unknown as FarmRoom;
  const currentPlayerId = getCurrentPlayerTurnId(room);
  const isYourTurn =
    room.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const isLimitedCardsRule = !room.rules[GAME_RULES.UNLIMITED_CARDS];

  return (
    <div className={styles.container}>
      <Header />

      <DiceSection isYourTurn={isYourTurn} />

      {isLimitedCardsRule && <ActiveCardsSection />}

      <PlayersSection
        currentPlayerId={currentPlayerId}
        winnerId={room.winner}
      />

      <ExchangeSection isYourTurn={isYourTurn} />

      <WinningAnimation />

      <EmoteFloatingContainer />
    </div>
  );
}
