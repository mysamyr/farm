import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import {
  ActionTarget,
  EffectId,
  LogEffectKind,
  type Player,
  type Room,
} from '@game/game-arena/shared';

import PlayerStatsDisplay from '../../components/PlayerStats.js';
import SpectatorSkills from '../../components/SpectatorSkills.js';

import { useArenaTranslation } from '../../hooks/useArenaTranslation.js';

import {
  getActivePlayerId,
  getDefaultTargetId,
  getOpponentsInTurnOrder,
  isPlayerEliminated,
} from '../../utils/index.js';

import BattleLog from './components/BattleLog.js';
import OpponentsZone from './components/OpponentsZone.js';
import SelfPanel from './components/SelfPanel.js';
import styles from './Fight.module.css';

type FightProps = {
  room: Room;
};

function SpectatorFight({ room }: FightProps): ReactElement {
  const activePlayerId = getActivePlayerId(room);
  const playersInTurnOrder = room.order
    .map(id => room.players.find(player => player.id === id))
    .filter((player): player is Player => Boolean(player));

  return (
    <div className={styles.spectatorLayout}>
      <main className={styles.spectatorMain}>
        <div className={styles.spectatorPlayers}>
          {playersInTurnOrder.map((player, index) => (
            <section key={player.id} className={styles.spectatorPlayer}>
              <PlayerStatsDisplay
                player={player}
                turnOrder={index + 1}
                isActive={activePlayerId === player.id}
                isEliminated={isPlayerEliminated(player)}
                isWinner={room.winner === player.id}
                isMatchEnded={Boolean(room.winner)}
                showStatuses
              />
              <SpectatorSkills player={player} />
            </section>
          ))}
        </div>
      </main>
      <aside className={styles.logRail}>
        <BattleLog steps={room.steps} />
      </aside>
    </div>
  );
}

function FightPlayer({ room }: FightProps): ReactElement {
  const { showSnackbar } = useSnackbar();
  const t = useArenaTranslation();

  const getCritHitEventKey = useCallback(
    (playerId: string): string | undefined => {
      const lastStep = room?.steps.at(-1);
      if (!lastStep) return undefined;

      const gotCritHit = lastStep.effects.some(effect => {
        if (effect.kind !== LogEffectKind.damage || !effect.isCrit)
          return false;
        const targetId =
          effect.target === ActionTarget.self
            ? lastStep.playerId
            : lastStep.targetId;
        return targetId === playerId;
      });

      return gotCritHit ? `${lastStep.step}-${playerId}` : undefined;
    },
    [room]
  );
  const hasStun = (player: Player | undefined): boolean =>
    Boolean(
      player?.statuses.some(
        status =>
          status.type === EffectId.stun &&
          status.remainingDuration &&
          status.remainingDuration > 0
      )
    );

  const [selectedTargetId, setSelectedTargetId] = useState<string>();
  const knownEliminatedRef = useRef<Set<string>>(new Set());

  const socketId = getSocketId();
  const self = room?.players.find(p => p.id === socketId);

  const opponents = useMemo(
    () => (room ? getOpponentsInTurnOrder(room, socketId) : []),
    [room, socketId]
  );

  const defaultTargetId = room ? getDefaultTargetId(room, socketId) : undefined;

  // Keep the target valid: fall back when it is eliminated, gone, or unset.
  useEffect(() => {
    if (!room) return;

    const current = selectedTargetId
      ? room.players.find(p => p.id === selectedTargetId)
      : undefined;

    if (!current || isPlayerEliminated(current)) {
      setSelectedTargetId(defaultTargetId);
    }
  }, [room, selectedTargetId, defaultTargetId]);

  // Announce eliminations that happen while the match continues.
  useEffect(() => {
    if (!room) return;

    const known = knownEliminatedRef.current;
    const stillPresent = new Set<string>();

    for (const player of room.players) {
      if (!isPlayerEliminated(player)) continue;
      stillPresent.add(player.id);

      if (!known.has(player.id)) {
        known.add(player.id);
        if (player.id !== socketId && room.state === ROOM_STATES.RUNNING) {
          showSnackbar(t.fight.playerEliminated.replace('{name}', player.name));
        }
      }
    }

    for (const id of known) {
      if (!stillPresent.has(id)) known.delete(id);
    }
  }, [room, socketId, showSnackbar, t.fight.playerEliminated]);

  const activePlayerId = room ? getActivePlayerId(room) : undefined;
  const isGameOver =
    !!room && (room.state === ROOM_STATES.FINISHED || Boolean(room.winner));
  const isSelfEliminated = self ? isPlayerEliminated(self) : false;
  const isMyTurn =
    !isGameOver && !isSelfEliminated && activePlayerId === socketId;

  const handleUseSkill = useCallback(
    (skillId: string) => {
      if (!room || !isMyTurn) return;

      emitGameEvent(
        EVENTS.GAME_ACTION,
        {
          roomId: room.id,
          action: {
            type: 'USE_SKILL',
            skill: skillId,
            target: selectedTargetId ?? defaultTargetId ?? '',
          },
        },
        (res: { ok: boolean }) => {
          if (!res.ok) showSnackbar(t.fight.failedToUseSkill);
        }
      );
    },
    [
      room,
      isMyTurn,
      selectedTargetId,
      defaultTargetId,
      showSnackbar,
      t.fight.failedToUseSkill,
    ]
  );

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <OpponentsZone
            opponents={opponents}
            turnOrder={room.order}
            activePlayerId={activePlayerId}
            selectedTargetId={selectedTargetId}
            winnerId={room.winner}
            isMatchEnded={isGameOver}
            getCritHitEventKey={getCritHitEventKey}
            onSelectTarget={setSelectedTargetId}
          />

          {self && (
            <SelfPanel
              player={self}
              turnOrder={room.order.indexOf(self.id) + 1}
              isActive={activePlayerId === self.id}
              isMyTurn={isMyTurn}
              isStunned={hasStun(self)}
              isGameOver={isGameOver}
              isWinner={room.winner === self.id}
              isLoser={isGameOver && !!room.winner && room.winner !== self.id}
              critHitEventKey={getCritHitEventKey(self.id)}
              onUseSkill={handleUseSkill}
            />
          )}
        </div>

        <aside className={styles.logRail}>
          <BattleLog steps={room.steps} />
        </aside>
      </div>
    </div>
  );
}

export default function Fight({
  room,
  isSpectator,
}: FightProps & { isSpectator: boolean }): ReactElement {
  return isSpectator ? (
    <SpectatorFight room={room} />
  ) : (
    <FightPlayer room={room} />
  );
}
