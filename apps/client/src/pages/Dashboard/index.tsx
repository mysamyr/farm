import { ReactElement, useState } from 'react';

import { VALIDATION, GAME_IDS } from '@game/shared/constants';

import GameSelector from '../../components/ui/GameSelector';
import { Header } from '../../components/ui/Header';
import { LOCAL_STORAGE_KEY } from '../../constants';
import { useActiveGame } from '../../hooks/useActiveGame';
import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';

import ActionBar from './components/ActionBar';
import ActiveRoom from './components/ActiveRoom';
import RoomCard from './components/RoomCard';

import styles from './Dashboard.module.css';

export default function Dashboard(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { activeGame } = useActiveGame();

  const [usernameInput, setUsernameInput] = useState(() => {
    const stored =
      window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME) ?? '';
    return [...stored].slice(0, VALIDATION.USER_NAME.MAX_LENGTH).join('');
  });

  const filteredRooms = rooms.filter(room => room.game === activeGame);

  const areMultipleGames = Object.keys(GAME_IDS).length > 1;

  return (
    <div className={styles.container}>
      <Header />

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
