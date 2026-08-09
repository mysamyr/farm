import { ReactElement, useState } from 'react';

import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import {
  useActiveGame,
  useGames,
  useLanguage,
  useRoom,
} from '@game/client-core/hooks';
import { VALIDATION } from '@game/shared/constants';

import { GameSelector, Header } from '../../components';
import { useGameConfig } from '../../hooks';

import ActionBar from './components/ActionBar';
import ActiveRoom from './components/ActiveRoom';
import RoomCard from './components/RoomCard';

import styles from './Dashboard.module.css';

export default function Dashboard(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { activeGame } = useActiveGame();
  const { games } = useGames();
  const { config: gameConfig } = useGameConfig(activeGame);

  const [usernameInput, setUsernameInput] = useState(() => {
    const stored =
      window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME) ?? '';
    return [...stored].slice(0, VALIDATION.USER_NAME.MAX_LENGTH).join('');
  });

  const filteredRooms = rooms.filter(room => room.game === activeGame);

  const areMultipleGames = games.length > 1;

  return (
    <div className={styles.container}>
      <Header helpModal={gameConfig?.HelpModal} />

      {areMultipleGames && <GameSelector />}

      <ActionBar
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
      />

      <div className={styles.dashboardGrid}>
        <div>
          <h2>{translation.dashboard.openRoomsHeader}</h2>
          <div className={styles.roomsGrid}>
            {!filteredRooms.length ? (
              <p>{translation.dashboard.noActiveRooms}</p>
            ) : (
              filteredRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  usernameInput={usernameInput}
                />
              ))
            )}
          </div>
        </div>

        {currentRoom && <ActiveRoom />}
      </div>
    </div>
  );
}
