import { type ReactElement } from 'react';

import { useLanguage, useRoom } from '@game/client-core/hooks';
import { ROOM_STATES } from '@game/shared/constants';
import { Navigate } from 'react-router-dom';

import { getCatalogPath } from '../../constants/index.js';
import { useActiveGame } from '../../hooks/index.js';

import ActionBar from './components/ActionBar.js';
import ActiveRoom from './components/ActiveRoom.js';
import LastMatchSummary from './components/LastMatchSummary.js';
import RoomCard from './components/RoomCard.js';

import styles from './GamePage.module.css';

export default function GamePage(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { activeGame } = useActiveGame();

  if (!activeGame) {
    return <Navigate to={getCatalogPath()} replace />;
  }

  const filteredRooms = rooms.filter(
    room =>
      room.game === activeGame &&
      room.state === ROOM_STATES.IDLE &&
      room.id !== currentRoom?.id
  );
  const showActiveRoom = currentRoom?.game === activeGame;

  return (
    <div className={styles.container}>
      <ActionBar />
      
      <LastMatchSummary gameId={activeGame} />

      <div className={styles.dashboardGrid}>
        <div>
          <h2>{translation.dashboard.openRoomsHeader}</h2>
          <div className={styles.roomsGrid}>
            {!filteredRooms.length ? (
              <p>
                {translation.dashboard.noActiveRooms}
                {!currentRoom && ' ' + translation.dashboard.createRoom}
              </p>
            ) : (
              filteredRooms.map(room => <RoomCard key={room.id} room={room} />)
            )}
          </div>
        </div>

        {showActiveRoom && <ActiveRoom />}
      </div>
    </div>
  );
}
