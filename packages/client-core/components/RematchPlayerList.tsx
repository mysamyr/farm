import type { ReactElement } from 'react';

import type { BasePlayer } from '@game/shared/types';

import { useLanguage } from '../hooks/index.js';
import { classNames } from '../utils/index.js';

import styles from './RematchPlayerList.module.css';

type RematchPlayerListProps = {
  players: BasePlayer[];
  readyIds: Set<string>;
  myId: string | undefined;
  showStatus: boolean;
};

export function RematchPlayerList({
  players,
  readyIds,
  myId,
  showStatus,
}: RematchPlayerListProps): ReactElement {
  const { translation } = useLanguage();
  const t = translation.postGame;

  return (
    <ul className={styles.players}>
      {players.map(player => {
        const isReady = readyIds.has(player.id);
        return (
          <li
            key={player.id}
            className={classNames(
              styles.player,
              showStatus && isReady && styles.playerReady
            )}
          >
            <span>
              {player.name}
              {player.id === myId && ` (${translation.you})`}
            </span>
            {showStatus && <span>{isReady ? t.ready : t.waiting}</span>}
          </li>
        );
      })}
    </ul>
  );
}
