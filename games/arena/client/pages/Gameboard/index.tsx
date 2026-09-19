import { type ReactElement } from 'react';

import { useRoom, useRoomRole } from '@game/client-core/hooks';

import { type Room } from '@game/game-arena/shared';

import { isAllPlayersReady } from '../../utils/index.js';

import FightPhase from './components/FightPhase.js';
import PreparationPhase from './components/PreparationPhase.js';
import SpectatorPhase from './components/SpectatorPhase.js';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { isSpectator } = useRoomRole();
  const currentRoom = rawCurrentRoom as unknown as Room | null;

  if (!currentRoom) {
    return <></>;
  }

  const isPreparationPhase = !isAllPlayersReady(currentRoom);

  return (
    <div className={styles.container}>
      {isSpectator ? (
        <SpectatorPhase
          room={currentRoom}
          preparation={isPreparationPhase}
        />
      ) : isPreparationPhase ? (
        <PreparationPhase />
      ) : (
        <FightPhase />
      )}
    </div>
  );
}
