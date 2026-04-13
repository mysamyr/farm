import React from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { GAME_RULES } from '@game/shared/constants/farm';

import { Navigate } from 'react-router-dom';

import WinningAnimation from '../../components/ui/WinningAnimation';
import { PATHS } from '../../constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { getSocketId } from '../../socket/client';
import { getCurrentPlayerTurnId } from '../../utils/game';

import ActiveCardsSection from './components/ActiveCardsSection';
import DiceSection from './components/DiceSection';
import ExchangeSection from './components/ExchangeSection';
import Header from './components/Header';
import PlayersSection from './components/PlayersSection';

import styles from './Gameboard.module.css';

export default function Gameboard(): React.ReactElement {
  const { currentRoom: room } = useRoom();
  const { translation } = useLanguage();

  if (!room) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

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

      <WinningAnimation title={translation.youWon} />
    </div>
  );
}
