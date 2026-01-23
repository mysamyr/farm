import { Button, Div, NoEl, Span } from '../../components';
import {
  ANIMALS,
  ANIMALS_DEFAULT_QUANTITY,
  ANIMALS_ICONS_CONFIG,
  EVENTS,
  GAME_RULES,
} from '../../constants';
import { getLanguageConfig } from '../../features/language';
import Snackbar from '../../features/snackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import { state } from '../../state/store';

import {
  canExchange,
  getActivePlayerId,
  getUsedAnimalCards,
  isLimitedCardsRule,
} from './helpers';

import type { Player, Room, TradableAnimals } from '../../types';

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

export function getLeftCardsSection(room: Room): HTMLDivElement {
  if (!isLimitedCardsRule(room)) {
    return NoEl();
  }
  const animalGridItems = Object.entries(ANIMALS_ICONS_CONFIG)
    .filter(
      ([animalKey]) =>
        ![ANIMALS.FOX, ANIMALS.BEAR].includes(animalKey as ANIMALS)
    )
    .map(([animalKey, animalData]) => {
      const count = getUsedAnimalCards(room, animalKey as TradableAnimals);
      const cardsLeft =
        ANIMALS_DEFAULT_QUANTITY[animalKey as TradableAnimals] - count;
      return Div({
        className: 'animal-item',
        children: [
          Div({ className: 'animal-icon', text: animalData.icon }),
          Div({ className: 'animal-count', text: cardsLeft.toString() }),
        ],
      });
    });

  return Div({
    className: 'active-card-section',
    children: animalGridItems,
  });
}

export function getPlayerCard(player: Player): HTMLDivElement {
  const isActive: boolean = player.id === getActivePlayerId();
  const isWinner: boolean = player.id === state.currentRoom?.winner;

  const animalGridItems = Object.entries(ANIMALS_ICONS_CONFIG)
    .filter(
      ([animalKey]) =>
        ![ANIMALS.FOX, ANIMALS.BEAR].includes(animalKey as ANIMALS)
    )
    .map(([animalKey, animalData]) => {
      const count = player.animals[animalKey as TradableAnimals] || 0;
      return Div({
        className: 'animal-item',
        children: [
          Div({ className: 'animal-icon', text: animalData.icon }),
          Div({ className: 'animal-count', text: count.toString() }),
        ],
      });
    });

  return Div({
    className: `player-card ${isActive || isWinner ? 'active-turn' : ''}`,
    children: [
      Div({
        className: 'player-header',
        children: [
          Span({ className: 'player-name', text: player.name }),
          Span({
            className: 'turn-indicator',
            text: isWinner
              ? getLanguageConfig().gameboard.winner
              : isActive
                ? getLanguageConfig().gameboard.yourTurn
                : '',
          }),
        ],
      }),
      Div({
        className: 'animal-grid',
        children: animalGridItems,
      }),
    ],
  });
}

export function getExchangeGrid(isYourTurn: boolean): HTMLDivElement {
  const room = state.currentRoom!;
  const me = room.players.find(p => p.id === getSocketId())!;

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

  return Div({ className: 'exchange-grid', children: exchangeBtns });
}
