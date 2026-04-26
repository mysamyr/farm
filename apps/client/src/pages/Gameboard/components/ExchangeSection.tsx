import type { ReactElement } from 'react';

import { ANIMALS, FARM_EVENTS, GAME_RULES } from '@game/shared/constants/farm';
import type { Player, TradableAnimals } from '@game/shared/types/farm';

import { ANIMALS_ICONS_CONFIG } from '../../../constants';
import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../socket/client';
import { canExchange } from '../../../utils/game';
import { resolveErrorMessage } from '../../../utils/language';

import styles from './ExchangeSection.module.css';

type ExchangePair = {
  left: TradableAnimals;
  right: TradableAnimals;
  leftCount: number;
  rightCount: number;
  special?: boolean;
};

type ExchangeGroup = {
  id: string;
  leftTrade: ExchangePair;
  rightTrade: ExchangePair;
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

  const exchangeGroups: ExchangeGroup[] = [
    {
      id: 'duck-goat',
      leftTrade: {
        left: ANIMALS.DUCK,
        right: ANIMALS.GOAT,
        leftCount: 6,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.GOAT,
        right: ANIMALS.DUCK,
        leftCount: 1,
        rightCount: 6,
      },
    },
    {
      id: 'goat-pig',
      leftTrade: {
        left: ANIMALS.GOAT,
        right: ANIMALS.PIG,
        leftCount: 2,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.PIG,
        right: ANIMALS.GOAT,
        leftCount: 1,
        rightCount: 2,
      },
    },
    {
      id: 'pig-horse',
      leftTrade: {
        left: ANIMALS.PIG,
        right: ANIMALS.HORSE,
        leftCount: 3,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.HORSE,
        right: ANIMALS.PIG,
        leftCount: 1,
        rightCount: 3,
      },
    },
    {
      id: 'horse-cow',
      leftTrade: {
        left: ANIMALS.HORSE,
        right: ANIMALS.COW,
        leftCount: 2,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.COW,
        right: ANIMALS.HORSE,
        leftCount: 1,
        rightCount: 2,
      },
    },
    {
      id: 'goat-small-dog',
      leftTrade: {
        left: ANIMALS.GOAT,
        right: ANIMALS.SMALL_DOG,
        leftCount: 1,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.SMALL_DOG,
        right: ANIMALS.GOAT,
        leftCount: 1,
        rightCount: 1,
      },
      special: true,
    },
    {
      id: 'horse-big-dog',
      leftTrade: {
        left: ANIMALS.HORSE,
        right: ANIMALS.BIG_DOG,
        leftCount: 1,
        rightCount: 1,
      },
      rightTrade: {
        left: ANIMALS.BIG_DOG,
        right: ANIMALS.HORSE,
        leftCount: 1,
        rightCount: 1,
      },
      special: true,
    },
  ];

  const isExchangeEnabled = (pair: ExchangePair): boolean =>
    !!me &&
    isYourTurn &&
    (!oneExchangeRuleEnabled || !me.exchangedThisTurn) &&
    canExchange(me.animals, pair.left, pair.leftCount);

  const onExchange = (pair: ExchangePair) => {
    emitEvent(
      FARM_EVENTS.GAME_EXCHANGE,
      {
        roomId: currentRoom!.id,
        from: pair.left,
        to: pair.right,
      },
      res => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
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
        {exchangeGroups.map(group => {
          const leftEnabled = isExchangeEnabled(group.rightTrade);
          const rightEnabled = isExchangeEnabled(group.leftTrade);

          return (
            <div
              key={group.id}
              className={`${styles.splitCard} ${group.special ? styles.special : ''}`.trim()}
            >
              <button
                type="button"
                className={styles.tradeHalf}
                disabled={!leftEnabled}
                onClick={() => {
                  if (!leftEnabled) {
                    return;
                  }
                  onExchange(group.rightTrade);
                }}
                aria-label={`${group.rightTrade.leftCount} ${group.rightTrade.left} to ${group.rightTrade.rightCount} ${group.rightTrade.right}`}
              >
                <span className={styles.count}>
                  {group.leftTrade.leftCount}
                </span>
                <span className={styles.emoji}>
                  {ANIMALS_ICONS_CONFIG[group.leftTrade.left].icon}
                </span>
              </button>

              <div className={styles.divider} />

              <button
                type="button"
                className={styles.tradeHalf}
                disabled={!rightEnabled}
                onClick={() => {
                  if (!rightEnabled) {
                    return;
                  }
                  onExchange(group.leftTrade);
                }}
                aria-label={`${group.leftTrade.leftCount} ${group.leftTrade.left} to ${group.leftTrade.rightCount} ${group.leftTrade.right}`}
              >
                <span className={styles.count}>
                  {group.rightTrade.leftCount}
                </span>
                <span className={styles.emoji}>
                  {ANIMALS_ICONS_CONFIG[group.rightTrade.left].icon}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
