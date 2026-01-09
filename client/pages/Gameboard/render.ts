import { Button, Div } from '../../components';
import {
  ANIMALS,
  ANIMALS_ICONS_CONFIG,
  EVENTS,
  GAME_RULES,
} from '../../constants';
import Snackbar from '../../features/snackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { state } from '../../state/store';

import type { TradableAnimals } from '../../types';

export function renderExchangeGrid(isYourTurn: boolean): void {
  const container = document.getElementById('exchange-grid');
  if (!container) return;
  container.innerHTML = '';

  const room = state.currentRoom;
  if (!room) return;

  const me = room.players.find(p => p.id === getSocketId());
  if (!me) return;
  const have = me.animals;

  const isActionForbidden =
    room.rules[GAME_RULES.ONE_EXCHANGE] && me.exchangedThisTurn;

  type Pair = {
    left: TradableAnimals;
    right: TradableAnimals;
    leftCount: number;
    rightCount: number;
    special?: boolean;
  };

  const pairs: (Pair | 'separator')[] = [
    { left: ANIMALS.DUCK, right: ANIMALS.GOAT, leftCount: 6, rightCount: 1 },
    { left: ANIMALS.GOAT, right: ANIMALS.DUCK, leftCount: 1, rightCount: 6 },

    { left: ANIMALS.GOAT, right: ANIMALS.PIG, leftCount: 2, rightCount: 1 },
    { left: ANIMALS.PIG, right: ANIMALS.GOAT, leftCount: 1, rightCount: 2 },

    { left: ANIMALS.PIG, right: ANIMALS.HORSE, leftCount: 3, rightCount: 1 },
    { left: ANIMALS.HORSE, right: ANIMALS.PIG, leftCount: 1, rightCount: 3 },

    { left: ANIMALS.HORSE, right: ANIMALS.COW, leftCount: 2, rightCount: 1 },
    { left: ANIMALS.COW, right: ANIMALS.HORSE, leftCount: 1, rightCount: 2 },

    'separator',

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

  function canDo(pair: Pair): boolean {
    return (have[pair.left] || 0) >= pair.leftCount;
  }

  function label(pair: Pair): string {
    const leftIcon = ANIMALS_ICONS_CONFIG[pair.left].icon;
    const rightIcon = ANIMALS_ICONS_CONFIG[pair.right].icon;
    return `${pair.leftCount} ${leftIcon} → ${pair.rightCount} ${rightIcon}`;
  }

  const nodes: HTMLElement[] = [];

  for (const item of pairs) {
    if (item === 'separator') {
      nodes.push(Div({ className: 'separator' }));
      continue;
    }
    const enabled = isYourTurn && !isActionForbidden && canDo(item);
    nodes.push(
      Button({
        className: [
          'trade-btn',
          item.special ? 'special' : '',
          enabled ? '' : 'disabled',
        ].filter(Boolean),
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
      })
    );
  }

  container.append(...nodes);
}
