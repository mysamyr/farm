import { type ReactElement, useCallback } from 'react';

import { useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';

import { EVENTS, ROOM_STATES } from '@game/shared/constants';

import {
  ActionTarget,
  EffectId,
  LogEffectKind,
  type Room,
} from '@game/game-arena/shared';

import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import { getActivePlayerId } from '../../../utils/index.js';

import BattleLog from './BattleLog.js';
import styles from './FightPhase.module.css';
import PlayerSkills from './PlayerSkills.js';
import PlayerStatsDisplay from './PlayerStats.js';

function getCritHitEventKey(room: Room, playerId: string): string | undefined {
  const lastStep = room.steps.at(-1);
  if (!lastStep) return undefined;

  const opponentId = room.players.find(p => p.id !== lastStep.playerId)?.id;
  if (!opponentId) return undefined;

  const gotCritHit = lastStep.effects.some(effect => {
    if (effect.kind !== LogEffectKind.damage || !effect.isCrit) return false;

    const targetId =
      effect.target === ActionTarget.self ? lastStep.playerId : opponentId;
    return targetId === playerId;
  });

  return gotCritHit ? `${lastStep.step}-${playerId}` : undefined;
}

export default function FightPhase(): ReactElement {
  const { currentRoom: rawCurrentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const t = useArenaTranslation();
  const room = rawCurrentRoom as unknown as Room | null;

  if (!room) {
    return <></>;
  }

  const socketId = getSocketId();
  const activePlayerId = getActivePlayerId(room);
  const isGameOver =
    room.state === ROOM_STATES.FINISHED || Boolean(room.winner);
  const isMyTurn = !isGameOver && activePlayerId === socketId;
  const opponentId = room.players.find(p => p.id !== socketId)?.id ?? '';

  const handleUseSkill = useCallback(
    (skillId: string) => {
      if (!isMyTurn) return;
      emitGameEvent(
        EVENTS.GAME_ACTION,
        {
          roomId: room.id,
          action: { type: 'USE_SKILL', skill: skillId, target: opponentId },
        },
        (res: { ok: boolean }) => {
          if (!res.ok) {
            showSnackbar(t.fight.failedToUseSkill);
          }
        }
      );
    },
    [isMyTurn, room.id, opponentId, showSnackbar]
  );

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <div className={styles.playersRow}>
            {room.players.map(player => (
              <PlayerStatsDisplay
                key={player.id}
                player={player}
                isActive={activePlayerId === player.id}
                critHitEventKey={getCritHitEventKey(room, player.id)}
                isWinner={room.winner === player.id}
                isLoser={
                  isGameOver && !!room.winner && room.winner !== player.id
                }
                isMatchEnded={isGameOver}
                showStatuses
              />
            ))}
          </div>

          {room.players.map(player => {
            if (player.id !== socketId) return null;
            const isStunned = player.statuses.some(
              s =>
                s.type === EffectId.stun &&
                s.remainingDuration &&
                s.remainingDuration > 0
            );
            return (
              <PlayerSkills
                key={player.id}
                player={player}
                isMyTurn={isMyTurn}
                isStunned={isStunned}
                disabled={isGameOver}
                onUseSkill={handleUseSkill}
              />
            );
          })}
        </div>

        <aside>
          <BattleLog steps={room.steps} />
        </aside>
      </div>
    </div>
  );
}
