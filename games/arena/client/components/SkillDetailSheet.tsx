import { memo, type ReactElement, useState } from 'react';

import { Modal, ModalHeader } from '@game/client-core/components';

import type { Skill } from '@game/game-arena/shared';

import SkillDetails, { SkillTitle } from './SkillDetails.js';
import styles from './SkillDetailSheet.module.css';

type SkillDetailSheetProps = {
  skill: Skill | null;
  onClose: () => void;
};

function SkillDetailSheet({
  skill,
  onClose,
}: SkillDetailSheetProps): ReactElement {
  // Keep the last skill rendered while the sheet animates out.
  const [shownSkill, setShownSkill] = useState(skill);
  if (skill && skill !== shownSkill) {
    setShownSkill(skill);
  }

  return (
    <Modal
      open={skill !== null}
      onClose={onClose}
      placement="bottom"
      layer="panel"
    >
      {shownSkill && (
        <div className={styles.content}>
          <ModalHeader
            className={styles.header}
            title={<SkillTitle skill={shownSkill} />}
            onClose={onClose}
          />
          <SkillDetails skill={shownSkill} />
        </div>
      )}
    </Modal>
  );
}

export default memo(SkillDetailSheet);
