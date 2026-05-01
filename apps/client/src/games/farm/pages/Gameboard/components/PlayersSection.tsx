import { type ReactElement, useState } from 'react';

import { ANIMALS, FARM_EVENTS, GAME_RULES } from '@game/shared/constants/farm';
import type {
  Room as FarmRoom,
  Player,
  TradableAnimals,
} from '@game/shared/types/farm';

import { useLanguage } from '../../../../../hooks/useLanguage';
import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../../../socket/client';
import { classNames } from '../../../../../utils';
import { resolveErrorMessage } from '../../../../../utils/language';
import { ANIMALS_ICONS_CONFIG } from '../../../constants';
import { useFarmTranslation } from '../../../hooks/useFarmTranslation';

import styles from './PlayersSection.module.css';

type PlayersSectionProps = {
  currentPlayerId?: string;
  winnerId?: string;
};

export default function PlayersSection({
  currentPlayerId,
  winnerId,
}: PlayersSectionProps): ReactElement {
  const { currentRoom } = useRoom();
  const room = currentRoom as FarmRoom;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();

  const myId = getSocketId();
  const isYourTurn = currentPlayerId === myId;
  const tradeAllowed = room.rules[GAME_RULES.ALLOW_PLAYER_TRADE];
  const tradeActive = !!room.trade;

  const players = room.order
    .map(playerId => room.players.find(player => player.id === playerId))
    .filter(Boolean) as Player[];

  function handleTrade(targetPlayerId: string): void {
    emitEvent(
      FARM_EVENTS.GAME_TRADE_START,
      { roomId: room.id, targetPlayerId },
      ack => {
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
        const isWinner = player.id === winnerId;
        const isCollapsed = !!collapsed[player.id];
        const isSelf = player.id === myId;
        const canTrade =
          isYourTurn && tradeAllowed && !tradeActive && !isSelf && !winnerId;

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
