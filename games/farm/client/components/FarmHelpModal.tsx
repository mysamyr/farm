import type { ReactElement } from 'react';

import { HelpModal } from '@game/client-core/components';

import {
  useFarmHelpTranslation,
  useFarmTranslation,
} from '../hooks/useFarmTranslation.js';

export default function FarmHelpModal(): ReactElement {
  const help = useFarmHelpTranslation();
  const { ruleLabels } = useFarmTranslation();

  return (
    <HelpModal>
      <h2>{help.title}</h2>
      <p>{help.goal}</p>

      <h2>{help.componentsHeader}</h2>
      {help.components.map((component, index) => (
        <p key={index}>{component}</p>
      ))}

      <h2>{help.turnHeader}</h2>
      {help.turnParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      <h2>{help.breedingHeader}</h2>
      {help.breedingParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      <h3>{help.examplesHeader}</h3>
      {help.examples.map((example, index) => (
        <p key={index}>{example}</p>
      ))}

      <h2>{help.predatorsHeader}</h2>
      {help.predators.map((predator, index) => (
        <p key={index}>{predator}</p>
      ))}

      <h2>{help.protectionHeader}</h2>
      {help.protection.map((protection, index) => (
        <p key={index}>{protection}</p>
      ))}

      <h2>{help.rulesHeader}</h2>
      <ul>
        {help.rules.map(rule => (
          <li key={rule.ruleName}>
            <b>{ruleLabels[rule.ruleName]}</b>: {rule.description}
          </li>
        ))}
      </ul>
    </HelpModal>
  );
}
