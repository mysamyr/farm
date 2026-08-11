import type { ReactElement } from 'react';

import { HelpModal } from '@game/client-core/components';

import { useFarmHelpTranslation } from '../hooks/useFarmTranslation.js';

export default function FarmHelpModal(): ReactElement {
  const help = useFarmHelpTranslation();

  return (
    <HelpModal>
      <h2>{help.title}</h2>
      <p>{help.goal}</p>

      <h2>{help.componentsHeader}</h2>
      <p>{help.components}</p>

      <h2>{help.turnHeader}</h2>
      <p>{help.turnParagraphs}</p>

      <h2>{help.breedingHeader}</h2>
      <p>{help.breedingParagraphs}</p>

      <h3>{help.examplesHeader}</h3>
      <p>{help.examples}</p>

      <h2>{help.predatorsHeader}</h2>
      <p>{help.predators}</p>

      <h2>{help.protectionHeader}</h2>
      <p>{help.protection}</p>

      <h2>{help.rulesHeader}</h2>
      <p>{help.rules}</p>
    </HelpModal>
  );
}
