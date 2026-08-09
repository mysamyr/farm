import { type ReactElement, useState } from 'react';

import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';

import {
  ANIMALS,
  FARM_EVENTS,
  GAME_RULES,
  type Room as FarmRoom,
  type Player,
  type TradableAnimals,
} from '@game/game-farm/shared';

import { ANIMALS_ICONS_CONFIG } from '../../../constants';
import { useFarmTranslation } from '../../../hooks/useFarmTranslation';

import { getCurrentPlayerTurnId } from '../../../utils';

import styles from './PlayersSection.module.css';

export default function PlayersSection(): ReactElement {
  const room = useRoom();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();

  const currentRoom = room.currentRoom as FarmRoom;
  const currentPlayerId = getCurrentPlayerTurnId(currentRoom);

  const myId = getSocketId();
  const isYourTurn = currentPlayerId === myId;
  const tradeAllowed = currentRoom.rules[GAME_RULES.ALLOW_PLAYER_TRADE];
  const tradeActive = !!currentRoom.trade;

  const players = currentRoom.order
    .map(playerId => currentRoom.players.find(player => player.id === playerId))
    .filter(Boolean) as Player[];

  function handleTrade(targetPlayerId: string): void {
    emitGameEvent(
      FARM_EVENTS.GAME_TRADE_START,
      { roomId: currentRoom.id, targetPlayerId },
      (ack: { ok: boolean; error?: string }) => {
        if (ack && !ack.ok) {
          showSnackbar(resolveErrorMessage(ack.error, translation));
        }
      }
    );
  }

  return (
    <div className={styles.playersContainer}>
      {players.map(player => {
        const isActive = player.id === currentPlayerId;
        const isWinner = player.id === currentRoom.winner;
        const isCollapsed = !!collapsed[player.id];
        const isSelf = player.id === myId;
        const canTrade =
          isYourTurn && tradeAllowed && !tradeActive && !isSelf && !isWinner;

        return (
          <div
            key={player.id}
            className={classNames(
              styles.playerCard,
              isActive && styles.activeTurn,
              isWinner && styles.winner
            )}
          >
            <div className={styles.playerHeader}>
              <span className={styles.playerName}>{player.name}</span>
              <div className={styles.playerActions}>
                {canTrade && (
                  <button
                    type="button"
                    className={styles.tradeBtn}
                    onClick={() => handleTrade(player.id)}
                  >
                    {farmT.trade.buttonLabel}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.collapseBtn}
                  onClick={() =>
                    setCollapsed(prev => ({
                      ...prev,
                      [player.id]: !prev[player.id],
                    }))
                  }
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className={styles.animalGrid}>
                {Object.entries(ANIMALS_ICONS_CONFIG)
                  .filter(
                    ([animal]) =>
                      ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
                  )
                  .map(([animal, data]) => {
                    const count =
                      player.animals[animal as TradableAnimals] || 0;
                    return (
                      <div key={animal} className={styles.animalItem}>
                        <div className={styles.animalIcon}>{data.icon}</div>
                        <div className={styles.animalCount}>{count}</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
