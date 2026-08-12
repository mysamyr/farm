import type { ReactElement, ReactNode } from 'react';

import type { Skill } from '@game/game-arena/shared';

import {
  getSkillCooldownText,
  getSkillEffects,
  getSkillIcon,
  getSkillName,
} from '../../../constants/index.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';

import styles from './SkillDetailSheet.module.css';

type SkillDetailSheetProps = {
  skill: Skill;
  onClose: () => void;
  actions?: ReactNode;
};

export default function SkillDetailSheet({
  skill,
  onClose,
  actions,
}: SkillDetailSheetProps): ReactElement {
  const t = useArenaTranslation();

  const icon = getSkillIcon(skill.id);
  const name = getSkillName(skill.id, t.skillNames);
  const effects = getSkillEffects(
    skill,
    t.skillEffectLabels,
    t.statLabels,
    t.effectLabels,
    t.util
  );
  const cooldownText = getSkillCooldownText(skill, t.skillEffectLabels);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetHeader}>
          <span className={styles.sheetIcon}>{icon}</span>
          <span className={styles.sheetName}>{name}</span>
        </div>
        <ul className={styles.sheetEffects}>
          {effects.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
          {cooldownText && (
            <li key="cooldown" className={styles.sheetCooldown}>
              {cooldownText}
            </li>
          )}
        </ul>
        {actions && <div className={styles.sheetActions}>{actions}</div>}
      </div>
    </>
  );
}
