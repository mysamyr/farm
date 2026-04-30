import type { ReactElement } from 'react';

import HelpModal from '../../../components/modals/HelpModal';
import type { HelpSection } from '../../../components/modals/HelpModal';
import { useLanguage } from '../../../hooks/useLanguage';

export default function FarmHelpModal(): ReactElement {
  const { translation } = useLanguage();
  const help = translation.help.farm;

  const sections: HelpSection[] = [
    { header: help.title as string, content: help.goal as string },
    { header: help.componentsHeader as string, content: help.components as string[] },
    { header: help.turnHeader as string, content: help.turnParagraphs as string[] },
    { header: help.breedingHeader as string, content: help.breedingParagraphs as string[] },
    { header: help.examplesHeader as string, headerLevel: 'h3', content: help.examples as string[] },
    { header: help.predatorsHeader as string, content: help.predators as string[] },
    { header: help.protectionHeader as string, content: help.protection as string[] },
    { header: help.rulesHeader as string, content: help.rules as string[] },
  ];

  return <HelpModal sections={sections} />;
}
