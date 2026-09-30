import { type ReactElement, useState } from 'react';

import {
  SKILLS,
  type Player,
  type Skill,
  SkillType,
} from '@game/game-arena/shared';

import SkillCard from './SkillCard.js';
import SkillDetailSheet from './SkillDetailSheet.js';

import styles from './SpectatorSkills.module.css';

type SpectatorSkillsProps = {
  player: Player;
};

function SpectatorSkills({ player }: SpectatorSkillsProps): ReactElement {
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);
  const selectedSkills = player.loadout
    .map(skillId => SKILLS[skillId])
    .filter((skill): skill is Skill => Boolean(skill));
  const activeSkills = selectedSkills.filter(
    skill => skill.type === SkillType.active
  );
  const supportSkills = selectedSkills.filter(
    skill => skill.type !== SkillType.active
  );

  const renderSkill = (skill: Skill): ReactElement => {
    const cooldown =
      skill.type === SkillType.passive
        ? undefined
        : player.skills.find(playerSkill => playerSkill.id === skill.id)
            ?.cooldown;

    return (
      <SkillCard
        key={skill.id}
        skill={skill}
        cooldown={cooldown}
        alwaysShowCooldown={skill.type !== SkillType.passive}
        disabled
        onClick={() => undefined}
        onOpenDetail={setDetailSkill}
      />
    );
  };

  return (
    <>
      <div className={styles.spectatorSkills}>
        <div className={styles.spectatorSkillRow}>
          {activeSkills.map(renderSkill)}
        </div>
        <div className={styles.spectatorSkillRow}>
          {supportSkills.map(renderSkill)}
        </div>
      </div>
      <SkillDetailSheet
        skill={detailSkill}
        onClose={() => setDetailSkill(null)}
      />
    </>
  );
}

export default SpectatorSkills;
