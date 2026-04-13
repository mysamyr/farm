import React, { ReactElement } from 'react';

import { ANIMALS, FARM_EVENTS, GAME_RULES } from '@game/shared/constants/farm';
import type { Player, TradableAnimals } from '@game/shared/types/farm';

import { ANIMALS_ICONS_CONFIG } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../socket/client';
import { canExchange } from '../../../utils/game';

import styles from './ExchangeSection.module.css';

type ExchangePair = {
  left: TradableAnimals;
  right: TradableAnimals;
  leftCount: number;
  rightCount: number;
  special?: boolean;
};

type ExchangeSectionProps = {
  isYourTurn: boolean;
};

export default function ExchangeSection({
  isYourTurn,
}: ExchangeSectionProps): ReactElement {
  const { currentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const me = currentRoom?.players.find(
    (player: Player) => player.id === getSocketId()
  );
  const oneExchangeRuleEnabled = !!currentRoom?.rules[GAME_RULES.ONE_EXCHANGE];

  const exchangePairs: ExchangePair[] = [
    { left: ANIMALS.DUCK, right: ANIMALS.GOAT, leftCount: 6, rightCount: 1 },
    { left: ANIMALS.GOAT, right: ANIMALS.DUCK, leftCount: 1, rightCount: 6 },
    { left: ANIMALS.GOAT, right: ANIMALS.PIG, leftCount: 2, rightCount: 1 },
    { left: ANIMALS.PIG, right: ANIMALS.GOAT, leftCount: 1, rightCount: 2 },
    { left: ANIMALS.PIG, right: ANIMALS.HORSE, leftCount: 3, rightCount: 1 },
    { left: ANIMALS.HORSE, right: ANIMALS.PIG, leftCount: 1, rightCount: 3 },
    { left: ANIMALS.HORSE, right: ANIMALS.COW, leftCount: 2, rightCount: 1 },
    { left: ANIMALS.COW, right: ANIMALS.HORSE, leftCount: 1, rightCount: 2 },
    {
      left: ANIMALS.GOAT,
      right: ANIMALS.SMALL_DOG,
      leftCount: 1,
      rightCount: 1,
      special: true,
    },
    {
      left: ANIMALS.SMALL_DOG,
      right: ANIMALS.GOAT,
      leftCount: 1,
      rightCount: 1,
      special: true,
    },
    {
      left: ANIMALS.HORSE,
      right: ANIMALS.BIG_DOG,
      leftCount: 1,
      rightCount: 1,
      special: true,
    },
    {
      left: ANIMALS.BIG_DOG,
      right: ANIMALS.HORSE,
      leftCount: 1,
      rightCount: 1,
      special: true,
    },
  ];

  const onExchange = (pair: ExchangePair) => {
    emitEvent(
      FARM_EVENTS.GAME_EXCHANGE,
      {
        roomId: currentRoom?.id,
        from: pair.left,
        to: pair.right,
      },
      (res: { ok: boolean; error?: string }): void => {
        if (!res.ok) {
          showSnackbar(res.error || translation.dashboard.errors.cannotStart);
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {translation.gameboard.exchangeAnimalsHeader}
      </h3>
      <div className={styles.exchangeGrid}>
        {exchangePairs.map(pair => {
          const enabled =
            !!me &&
            isYourTurn &&
            (!oneExchangeRuleEnabled || !me.exchangedThisTurn) &&
            canExchange(me.animals, pair.left, pair.leftCount);

          return (
            <button
              key={`${pair.left}-${pair.right}`}
              type="button"
              className={`${styles.tradeButton} ${pair.special ? styles.special : ''}`.trim()}
              disabled={!enabled}
              onClick={() => {
                if (!enabled) {
                  return;
                }
                onExchange(pair);
              }}
            >
              {pair.leftCount} {ANIMALS_ICONS_CONFIG[pair.left].icon}{' '}
              {pair.rightCount} {ANIMALS_ICONS_CONFIG[pair.right].icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
