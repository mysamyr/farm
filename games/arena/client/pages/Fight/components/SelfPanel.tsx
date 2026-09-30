import { memo, type ReactElement } from 'react';

import { type Player, type SkillId } from '../../../../shared/index.js';

import PlayerStatsDisplay from '../../../components/PlayerStats.js';
import {
  isPlayerEliminated,
  type PlayerFxKeys,
} from '../../../utils/index.js';

import PlayerSkills from './PlayerSkills.js';
import styles from './SelfPanel.module.css';

type SelfPanelProps = {
  player: Player;
  turnOrder: number;
  isActive: boolean;
  isMyTurn: boolean;
  isStunned: boolean;
  isGameOver: boolean;
  isWinner: boolean;
  fx?: PlayerFxKeys;
  onUseSkill: (skillId: SkillId) => void;
};

function SelfPanel({
  player,
  turnOrder,
  isActive,
  isMyTurn,
  isStunned,
  isGameOver,
  isWinner,
  fx,
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
          fx={fx}
          isWinner={isWinner}
          isMatchEnded={isGameOver}
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

export default memo(SelfPanel);
