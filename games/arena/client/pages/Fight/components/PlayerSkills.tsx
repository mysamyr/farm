import { type ReactElement, memo, useMemo } from 'react';

import { noop } from '@game/client-core/utils';

import {
  type Player,
  SkillId,
  SKILLS,
  SkillType,
} from '../../../../shared/index.js';

import SkillCard from '../../../components/SkillCard.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './PlayerSkills.module.css';

type PlayerSkillsProps = {
  player: Player;
  isMyTurn: boolean;
  isStunned: boolean;
  disabled?: boolean;
  label?: string;
  onUseSkill?: (skillId: SkillId) => void;
};

function PlayerSkills({
  player,
  isMyTurn,
  isStunned,
  disabled = false,
  label,
  onUseSkill,
}: PlayerSkillsProps): ReactElement {
  const t = useArenaTranslation();

  const skillsByType = useMemo(() => {
    const baseSkillIds = new Set([SkillId.attack, SkillId.skip]);

    return player.skills.reduce(
      (acc, playerSkill) => {
        const skillDef = SKILLS[playerSkill.id];
        if (!skillDef) return acc;

        if (baseSkillIds.has(playerSkill.id)) {
          acc.base.push(playerSkill);
        } else if (skillDef.type === SkillType.active) {
          acc.active.push(playerSkill);
        } else if (skillDef.type === SkillType.healing) {
          acc.healing.push(playerSkill);
        }

        return acc;
      },
      {
        base: [] as Player['skills'],
        active: [] as Player['skills'],
        healing: [] as Player['skills'],
      }
    );
  }, [player.skills]);

  const renderSkill = (playerSkill: Player['skills'][number]) => {
    const skillDef = SKILLS[playerSkill.id];
    if (!skillDef) return null;

    const skillDisabled =
      disabled ||
      !isMyTurn ||
      (isStunned ? playerSkill.id !== SkillId.skip : playerSkill.cooldown > 0);

    return (
      <SkillCard
        key={playerSkill.id}
        skill={skillDef}
        cooldown={playerSkill.cooldown}
        disabled={skillDisabled}
        onClick={onUseSkill ?? noop}
      />
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>
          {label ?? t.fight.yourSkillsLabel}
        </span>
      </div>

      <div className={styles.skillsGrid}>
        {[...skillsByType.base, ...skillsByType.healing].map(renderSkill)}
      </div>
      <div className={styles.skillsGrid}>
        {skillsByType.active.map(renderSkill)}
      </div>

    </div>
  );
}

export default memo(PlayerSkills);
