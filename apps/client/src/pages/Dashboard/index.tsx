import React, { ReactElement, useState, useEffect } from 'react';

import { LOCAL_STORAGE_KEY } from '../../constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { useTheme } from '../../hooks/useTheme';

import ActionBar from './components/ActionBar';
import ActiveRoom from './components/ActiveRoom';
import Header from './components/Header';
import RoomCard from './components/RoomCard';

import styles from './Dashboard.module.css';

export default function Dashboard(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { theme } = useTheme();

  const [usernameInput, setUsernameInput] = useState(
    window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME) ?? ''
  );

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.container}>
      <Header />

      <ActionBar
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
      />

      <div className={styles.dashboardGrid}>
        <div>
          <h2>{translation.dashboard.openRoomsHeader}</h2>
          <div className={styles.roomsGrid}>
            {!rooms.length ? (
              <p>{translation.dashboard.noActiveRooms}</p>
            ) : (
              rooms.map(room => (
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
