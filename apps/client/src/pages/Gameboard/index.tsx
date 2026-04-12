import React from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import {
  ANIMALS,
  ANIMALS_DEFAULT_QUANTITY,
  FARM_EVENTS,
  GAME_RULES,
} from '@game/shared/constants/farm';

import type { Player, TradableAnimals } from '@game/shared/types/farm';
import { Navigate, useNavigate } from 'react-router-dom';

import WinningAnimation from '../../components/ui/WinningAnimation';
import { ANIMALS_ICONS_CONFIG, PATHS } from '../../constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useRoom } from '../../hooks/useRoom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../socket/client';
import {
  canExchange,
  getCurrentPlayerTurnId,
  getDiceIcon,
  isWildAnimal,
} from '../../utils/game';

function Gameboard(): React.ReactElement {
  const navigate = useNavigate();
  const { currentRoom: room, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  if (!room) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  const currentPlayerId = getCurrentPlayerTurnId(room);
  const isYourTurn =
    room.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const me = room.players.find(player => player.id === getSocketId());

  const sortedPlayers = room.order
    .map(playerId => room.players.find(player => player.id === playerId))
    .filter(Boolean) as Player[];

  const isLimitedCardsRule = !room.rules[GAME_RULES.UNLIMITED_CARDS];

  const usedCardsByAnimal: Partial<Record<TradableAnimals, number>> = {};
  if (isLimitedCardsRule) {
    for (const player of room.players) {
      for (const [animal, count] of Object.entries(player.animals)) {
        const key = animal as TradableAnimals;
        usedCardsByAnimal[key] = (usedCardsByAnimal[key] || 0) + count;
      }
    }
  }

  const exchangePairs: Array<{
    left: TradableAnimals;
    right: TradableAnimals;
    leftCount: number;
    rightCount: number;
    special?: boolean;
  }> = [
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

  return (
    <>
      <div className="game-header">
        <div className="room-info">
          <h1>
            <span>{translation.gameboard.room}: </span>
            <span>{room.name}</span>
          </h1>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (
              room.state !== ROOM_STATES.RUNNING ||
              confirm(translation.gameboard.roomLeaveConfirmation)
            ) {
              emitEvent(
                FARM_EVENTS.ROOM_LEAVE,
                { roomId: room.id },
                (res: { ok: boolean; error?: string }): void => {
                  if (!res.ok) {
                    showSnackbar(
                      res.error || translation.dashboard.errors.cannotJoin
                    );
                  }
                  setCurrentRoom(null);
                  void navigate(PATHS.DASHBOARD);
                }
              );
            }
          }}
        >
          {translation.roomButton.leaveRoom}
        </button>
      </div>

      <div className="dice-section">
        <div className="dice-container">
          <div
            className={`dice ${isWildAnimal(room.dice?.[0]) ? 'wild-animal' : ''}`}
          >
            {getDiceIcon(room.dice?.[0])}
          </div>
          <div
            className={`dice ${isWildAnimal(room.dice?.[1]) ? 'wild-animal' : ''}`}
          >
            {getDiceIcon(room.dice?.[1])}
          </div>
        </div>

        <button
          id="roll-btn"
          type="button"
          className="btn btn-primary"
          disabled={!isYourTurn}
          onClick={() => {
            if (!isYourTurn) {
              return;
            }
            emitEvent(
              FARM_EVENTS.GAME_ROLL_DICE,
              { roomId: room.id },
              (res: { ok: boolean; error?: string }): void => {
                if (!res.ok) {
                  showSnackbar(
                    res.error || translation.dashboard.errors.cannotStart
                  );
                }
              }
            );
          }}
        >
          {translation.gameboard.gameButton.throwDice}
        </button>
      </div>

      {isLimitedCardsRule ? (
        <div className="active-card-section">
          {Object.entries(ANIMALS_ICONS_CONFIG)
            .filter(
              ([animal]) =>
                ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
            )
            .map(([animal, data]) => {
              const key = animal as TradableAnimals;
              const cardsLeft =
                ANIMALS_DEFAULT_QUANTITY[key] - (usedCardsByAnimal[key] || 0);
              return (
                <div className="animal-item" key={animal}>
                  <div className="animal-icon">{data.icon}</div>
                  <div className="animal-count">{cardsLeft}</div>
                </div>
              );
            })}
        </div>
      ) : null}

      <div className="players-container" id="players-wrapper">
        {sortedPlayers.map(player => {
          const isActive = player.id === currentPlayerId;
          const isWinner = player.id === room.winner;

          return (
            <div
              key={player.id}
              className={`player-card ${isActive || isWinner ? 'active-turn' : ''}`}
            >
              <div className="player-header">
                <span className="player-name">{player.name}</span>
                <span className="turn-indicator">
                  {isWinner
                    ? translation.gameboard.winner
                    : isActive
                      ? translation.gameboard.yourTurn
                      : ''}
                </span>
              </div>

              <div className="animal-grid">
                {Object.entries(ANIMALS_ICONS_CONFIG)
                  .filter(
                    ([animal]) =>
                      ![ANIMALS.FOX, ANIMALS.BEAR].includes(animal as ANIMALS)
                  )
                  .map(([animal, data]) => {
                    const count =
                      player.animals[animal as TradableAnimals] || 0;
                    return (
                      <div key={animal} className="animal-item">
                        <div className="animal-icon">{data.icon}</div>
                        <div className="animal-count">{count}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="exchange-section">
        <h3>{translation.gameboard.exchangeAnimalsHeader}</h3>
        <div className="exchange-grid">
          {exchangePairs.map(pair => {
            const enabled =
              !!me &&
              isYourTurn &&
              (!room.rules[GAME_RULES.ONE_EXCHANGE] || !me.exchangedThisTurn) &&
              canExchange(me.animals, pair.left, pair.leftCount);

            return (
              <button
                key={`${pair.left}-${pair.right}`}
                type="button"
                className={`trade-btn ${pair.special ? 'special' : ''}`.trim()}
                disabled={!enabled}
                onClick={() => {
                  if (!enabled) {
                    return;
                  }
                  emitEvent(
                    FARM_EVENTS.GAME_EXCHANGE,
                    {
                      roomId: room.id,
                      from: pair.left,
                      to: pair.right,
                    },
                    (res: { ok: boolean; error?: string }): void => {
                      if (!res.ok) {
                        showSnackbar(
                          res.error || translation.dashboard.errors.cannotStart
                        );
                      }
                    }
                  );
                }}
              >
                {pair.leftCount} {ANIMALS_ICONS_CONFIG[pair.left].icon} →{' '}
                {pair.rightCount} {ANIMALS_ICONS_CONFIG[pair.right].icon}
              </button>
            );
          })}
        </div>
      </div>

      <WinningAnimation title={translation.youWon} />
    </>
  );
}

export default Gameboard;
