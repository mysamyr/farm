import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import {
  ActionTarget,
  EffectId,
  LogEffectKind,
  type Player,
  type Room,
} from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import {
  getActivePlayerId,
  getDefaultTargetId,
  getOpponentsInTurnOrder,
  isPlayerEliminated,
} from '../../../utils/index.js';

import BattleLog from './BattleLog.js';
import styles from './FightPhase.module.css';
import OpponentsZone from './OpponentsZone.js';
import SelfPanel from './SelfPanel.js';
import TurnBanner from './TurnBanner.js';

function getCritHitEventKey(room: Room, playerId: string): string | undefined {
  const lastStep = room.steps.at(-1);
  if (!lastStep) return undefined;

  const gotCritHit = lastStep.effects.some(effect => {
    if (effect.kind !== LogEffectKind.damage || !effect.isCrit) return false;

    const targetId =
      effect.target === ActionTarget.self
        ? lastStep.playerId
        : lastStep.targetId;
    return targetId === playerId;
  });

  return gotCritHit ? `${lastStep.step}-${playerId}` : undefined;
}

function hasStun(player: Player | undefined): boolean {
  return Boolean(
    player?.statuses.some(
      s =>
        s.type === EffectId.stun &&
        s.remainingDuration &&
        s.remainingDuration > 0
    )
  );
}

export default function FightPhase(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const t = useArenaTranslation();
  const room = rawCurrentRoom as unknown as Room | null;

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
          if (!res.ok) {
            showSnackbar(t.fight.failedToUseSkill);
          }
        }
      );
    },
    [
      isMyTurn,
      room,
      selectedTargetId,
      defaultTargetId,
      showSnackbar,
      t.fight.failedToUseSkill,
    ]
  );

  if (!room) {
    return <></>;
  }

  const activePlayer = room.players.find(p => p.id === activePlayerId);
  const targetPlayer = room.players.find(p => p.id === selectedTargetId);
  const winner = room.players.find(p => p.id === room.winner);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <TurnBanner
            isGameOver={isGameOver}
            winnerName={winner?.name}
            isSelfEliminated={isSelfEliminated}
            isMyTurn={isMyTurn}
            isStunned={hasStun(self)}
            activePlayerName={activePlayer?.name}
            targetName={targetPlayer?.name}
            showTargetHint={isMyTurn && opponents.length > 1}
          />

          <OpponentsZone
            opponents={opponents}
            activePlayerId={activePlayerId}
            selectedTargetId={selectedTargetId}
            winnerId={room.winner}
            isMatchEnded={isGameOver}
            getCritHitEventKey={playerId => getCritHitEventKey(room, playerId)}
            onSelectTarget={setSelectedTargetId}
          />

          {self && (
            <SelfPanel
              player={self}
              isActive={activePlayerId === self.id}
              isMyTurn={isMyTurn}
              isStunned={hasStun(self)}
              isGameOver={isGameOver}
              isWinner={room.winner === self.id}
              isLoser={isGameOver && !!room.winner && room.winner !== self.id}
              critHitEventKey={getCritHitEventKey(room, self.id)}
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
