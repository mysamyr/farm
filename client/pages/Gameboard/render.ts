import { Button } from '../../components';
import {
  ANIMALS,
  ANIMALS_ICONS_CONFIG,
  EVENTS,
  GAME_RULES,
} from '../../constants';
import Snackbar from '../../features/snackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { state } from '../../state/store';

import { canExchange } from './helpers';

import type { TradableAnimals } from '../../types';

type Pair = {
  left: TradableAnimals;
  right: TradableAnimals;
  leftCount: number;
  rightCount: number;
  special?: boolean;
};

function label(pair: Pair): string {
  const leftIcon = ANIMALS_ICONS_CONFIG[pair.left].icon;
  const rightIcon = ANIMALS_ICONS_CONFIG[pair.right].icon;
  return `${pair.leftCount} ${leftIcon} → ${pair.rightCount} ${rightIcon}`;
}

export function renderExchangeGrid(isYourTurn: boolean): void {
  const container = document.getElementById('exchange-grid');
  if (!container) return;
  container.innerHTML = '';

  const room = state.currentRoom;
  if (!room) return;

  const me = room.players.find(p => p.id === getSocketId());
  if (!me) return;

  const isActionForbidden =
    room.rules[GAME_RULES.ONE_EXCHANGE] && me.exchangedThisTurn;

  const pairs: Pair[] = [
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

  const exchangeBtns: HTMLElement[] = pairs.map(item => {
    const enabled =
      isYourTurn &&
      !isActionForbidden &&
      canExchange(me.animals, item.left, item.leftCount);
    return Button({
      className: ['trade-btn', item.special ? 'special' : ''].filter(Boolean),
      text: label(item),
      disabled: !enabled,
      onClick: (): void => {
        if (!enabled) return;
        emitEvent(
          EVENTS.GAME_EXCHANGE,
          { roomId: room.id, from: item.left, to: item.right },
          (res: { ok: boolean; error?: string }): void => {
            if (!res.ok) {
              Snackbar.displayMsg(res.error as string);
            }
          }
        );
      },
    });
  });

  container.append(...exchangeBtns);
}
