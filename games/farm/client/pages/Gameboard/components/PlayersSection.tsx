import { memo, type ReactElement, useMemo, useState } from 'react';

import {
  useLanguage,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';

import { EVENTS } from '@game/shared/constants';

import {
  ANIMALS,
  GAME_RULES,
  type Room as FarmRoom,
  type Player,
} from '@game/game-farm/shared';

import { ANIMALS_ICONS_CONFIG } from '../../../constants/index.js';
import { useFarmTranslation } from '../../../hooks/useFarmTranslation.js';

import { getCurrentPlayerTurnId } from '../../../utils/index.js';

import styles from './PlayersSection.module.css';

const DISPLAYED_ANIMALS = [
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.HORSE,
  ANIMALS.COW,
  ANIMALS.SMALL_DOG,
  ANIMALS.BIG_DOG,
] as const;

type PlayersSectionProps = {
  room: FarmRoom;
  isSpectator: boolean;
};

function PlayersSection({
  room,
  isSpectator,
}: PlayersSectionProps): ReactElement {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();

  const currentPlayerId = getCurrentPlayerTurnId(room);

  const myId = getSocketId();
  const isYourTurn = currentPlayerId === myId;
  const tradeAllowed = room.rules[GAME_RULES.ALLOW_PLAYER_TRADE];
  const tradeActive = !!room.trade;

  const players = useMemo(
    () =>
      room.order
        .map(playerId => room.players.find(player => player.id === playerId))
        .filter((player): player is Player => Boolean(player)),
    [room.order, room.players]
  );

  function handleTrade(targetPlayerId: string): void {
    emitGameEvent(
      EVENTS.GAME_ACTION,
      {
        roomId: room.id,
        action: { type: 'TRADE_START', targetPlayerId },
      },
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
        const isWinner = player.id === room.winner;
        const isCollapsed = !!collapsed[player.id];
        const isSelf = player.id === myId;
        const canTrade =
          !isSpectator &&
          isYourTurn &&
          tradeAllowed &&
          !tradeActive &&
          !isSelf &&
          !isWinner;

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
                {DISPLAYED_ANIMALS.map(animal => {
                  const count = player.animals[animal] || 0;
                  return (
                    <div key={animal} className={styles.animalItem}>
                      <div className={styles.animalIcon}>
                        {ANIMALS_ICONS_CONFIG[animal].icon}
                      </div>
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

export default memo(PlayersSection);
