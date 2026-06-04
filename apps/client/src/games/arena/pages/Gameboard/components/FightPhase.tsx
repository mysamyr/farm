import { type ReactElement, useCallback } from 'react';

import { ROOM_STATES } from '@game/shared/constants';
import { ARENA_EVENTS } from '@game/shared/constants/arena';
import type { Room } from '@game/shared/types/arena';

import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../../../socket/client';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation';
import { getActivePlayerId } from '../../../utils';

import BattleLog from './BattleLog';
import styles from './FightPhase.module.css';
import PlayerSkills from './PlayerSkills';
import PlayerStatsDisplay from './PlayerStats';

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
  const isGameOver = room.state === ROOM_STATES.FINISHED;
  const isMyTurn = !isGameOver && activePlayerId === socketId;
  const opponentId = room.players.find(p => p.id !== socketId)?.id ?? '';

  const handleUseSkill = useCallback(
    (skillId: string) => {
      if (!isMyTurn) return;
      emitEvent(
        ARENA_EVENTS.USE_SKILL,
        { roomId: room.id, skill: skillId, target: opponentId },
        res => {
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
                isWinner={room.winner === player.id}
                isLoser={isGameOver && !!room.winner && room.winner !== player.id}
                isMatchEnded={isGameOver}
                showStatuses
              />
            ))}
          </div>

          {room.players.map(player => {
            if (player.id !== socketId) return null;
            const isStunned = player.statuses.some(
              s => s.type === 'stun' && s.remainingDuration > 0
            );
            return (
              <PlayerSkills
                key={player.id}
                player={player}
                isMyTurn={isMyTurn}
                isGameOver={isGameOver}
                isStunned={isStunned}
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
