import { type ReactElement } from 'react';

import { type Player } from '@game/game-arena/shared';

import { isPlayerEliminated } from '../../../utils/index.js';

import PlayerSkills from './PlayerSkills.js';
import PlayerStatsDisplay from './PlayerStats.js';
import styles from './SelfPanel.module.css';

type SelfPanelProps = {
  player: Player;
  turnOrder: number;
  isActive: boolean;
  isMyTurn: boolean;
  isStunned: boolean;
  isGameOver: boolean;
  isWinner: boolean;
  isLoser: boolean;
  critHitEventKey?: string;
  onUseSkill: (skillId: string) => void;
};

export default function SelfPanel({
  player,
  turnOrder,
  isActive,
  isMyTurn,
  isStunned,
  isGameOver,
  isWinner,
  isLoser,
  critHitEventKey,
  onUseSkill,
}: SelfPanelProps): ReactElement {
  const eliminated = isPlayerEliminated(player);

  return (
    <section className={styles.panel}>
      <div className={styles.statsSlot}>
        <PlayerStatsDisplay
          player={player}
          turnOrder={turnOrder}
          isSelf
          isActive={isActive}
          isEliminated={eliminated}
          critHitEventKey={critHitEventKey}
          isWinner={isWinner}
          isLoser={isLoser}
          isMatchEnded={isGameOver}
          showStatuses
        />
      </div>
      <div className={styles.skillsSlot}>
        <PlayerSkills
          player={player}
          isMyTurn={isMyTurn}
          isStunned={isStunned}
          disabled={isGameOver || eliminated}
          onUseSkill={onUseSkill}
        />
      </div>
    </section>
  );
}
