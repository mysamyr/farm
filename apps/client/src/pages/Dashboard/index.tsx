import { ReactElement, useState, useEffect } from 'react';

import { VALIDATION, GAME_IDS } from '@game/shared/constants';
import type { GameId } from '@game/shared/types';

import GameSelector from '../../components/ui/GameSelector';
import { LOCAL_STORAGE_KEY } from '../../constants';
import { getGameConfig } from '../../games/registry';
import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { useTheme } from '../../hooks/useTheme';
import { applyAccentColor } from '../../utils/theme';

import ActionBar from './components/ActionBar';
import ActiveRoom from './components/ActiveRoom';
import Header from './components/Header';
import RoomCard from './components/RoomCard';

import styles from './Dashboard.module.css';

export default function Dashboard(): ReactElement {
  const { rooms, currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { theme } = useTheme();

  const [usernameInput, setUsernameInput] = useState(() => {
    const stored =
      window.localStorage.getItem(LOCAL_STORAGE_KEY.USERNAME) ?? '';
    return [...stored].slice(0, VALIDATION.USER_NAME.MAX_LENGTH).join('');
  });

  const [activeGame, setActiveGame] = useState<GameId>(GAME_IDS.FARM);

  const filteredRooms = rooms.filter(room => room.game === activeGame);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply accent color when active game changes
  useEffect(() => {
    const gameConfig = getGameConfig(activeGame);
    applyAccentColor(gameConfig.color);
  }, [activeGame]);

  return (
    <div className={styles.container}>
      <Header />

      <GameSelector activeGame={activeGame} onGameChange={setActiveGame} />

      <ActionBar
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        activeGame={activeGame}
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
