import { Div, Span } from '../../components';
import { ANIMALS, ANIMALS_ICONS_CONFIG } from '../../constants';
import { getLanguageConfig } from '../../features/language';
import { state } from '../../state/store';

import type { DiceAnimals, Player, Room, TradableAnimals } from '../../types';

export function isWildAnimal(animal: DiceAnimals): boolean {
  return [ANIMALS.FOX, ANIMALS.BEAR].includes(animal);
}

export function getCurrentPlayerTurnId(room: Room): string | undefined {
  return room.order?.[room.turn ?? 0];
}

export function getDiceIcon(dice?: DiceAnimals): string {
  if (!dice) return '?';
  return ANIMALS_ICONS_CONFIG[dice].icon;
}

export function getActivePlayerId(): string {
  return state.currentRoom!.order![state.currentRoom!.turn!]!;
}

export function getPlayerCard(player: Player): HTMLDivElement {
  const isActive: boolean = player.id === getActivePlayerId();
  const isWinner: boolean = player.id === state.currentRoom?.winner;

  const animalGridItems = Object.entries(ANIMALS_ICONS_CONFIG)
    .map(([animalKey, animalData]) => {
      if ([ANIMALS.FOX, ANIMALS.BEAR].includes(animalKey as ANIMALS)) return;
      const count = player.animals[animalKey as TradableAnimals] || 0;
      return Div({
        className: 'animal-item',
        children: [
          Div({ className: 'animal-icon', text: animalData.icon }),
          Div({ className: 'animal-count', text: count.toString() }),
        ],
      });
    })
    .filter(Boolean) as HTMLDivElement[];

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

export function canExchange(
  animals: Record<TradableAnimals, number>,
  fromAnimal: TradableAnimals,
  count: number
): boolean {
  return (animals[fromAnimal] || 0) >= count;
}
