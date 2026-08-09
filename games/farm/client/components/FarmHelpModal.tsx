import type { ReactElement } from 'react';

import { HelpModal, type HelpSection } from '@game/client-core/components';

import { useFarmHelpTranslation } from '../hooks/useFarmTranslation';

export default function FarmHelpModal(): ReactElement {
  const help = useFarmHelpTranslation();

  const sections: HelpSection[] = [
    { header: help.title, content: help.goal },
    {
      header: help.componentsHeader,
      content: help.components,
    },
    {
      header: help.turnHeader,
      content: help.turnParagraphs,
    },
    {
      header: help.breedingHeader,
      content: help.breedingParagraphs,
    },
    {
      header: help.examplesHeader,
      headerLevel: 'h3',
      content: help.examples,
    },
    {
      header: help.predatorsHeader,
      content: help.predators,
    },
    {
      header: help.protectionHeader,
      content: help.protection,
    },
    { header: help.rulesHeader, content: help.rules },
  ];

  return <HelpModal sections={sections} />;
}
