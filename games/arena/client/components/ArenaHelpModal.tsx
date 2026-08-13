import type { ReactElement } from 'react';

import { HelpModal } from '@game/client-core/components';

import { EffectId, StatId } from '@game/game-arena/shared';

import { getEffectIcon } from '../constants/index.js';
import {
  useArenaHelpTranslation,
  useArenaTranslation,
} from '../hooks/useArenaTranslation.js';

const STAT_IDS = Object.values(StatId);
const EFFECT_IDS = Object.values(EffectId);

export default function ArenaHelpModal(): ReactElement {
  const help = useArenaHelpTranslation();
  const { statLabels, effectLabels } = useArenaTranslation();

  return (
    <HelpModal>
      <h2>{help.title}</h2>
      <p>{help.goal}</p>

      <h2>{help.statsHeader}</h2>
      <p>{help.statsIntro}</p>
      <ul>
        {STAT_IDS.map(id => (
          <li key={id}>
            {statLabels[id]} — {help.stats[id]}
          </li>
        ))}
      </ul>

      <h2>{help.skillsHeader}</h2>
      <p>{help.skillsIntro}</p>
      <p>{help.activeSkills}</p>
      <p>{help.healingSkills}</p>
      <p>{help.passiveSkills}</p>

      <h2>{help.effectsHeader}</h2>
      <p>{help.effectsIntro}</p>
      <ul>
        {EFFECT_IDS.map(id => (
          <li key={id}>
            {getEffectIcon(id)} {effectLabels[id]} — {help.effects[id]}
          </li>
        ))}
      </ul>

      <h2>{help.turnHeader}</h2>
      <p>{help.turnIntro}</p>
      <ol>
      {help.turnSteps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
      </ol>
    </HelpModal>
  );
}
