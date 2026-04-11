import { Div, Header, Paragraph } from '../components';
import { getLanguageConfig } from '../features/language';

export default (): HTMLDivElement => {
  const t = getLanguageConfig().help;

  return Div({
    className: ['modal-container', 'help-modal-container'],
    children: [
      Header(2, { text: t.title }),
      Paragraph({ text: t.goal }),

      Header(2, { text: t.componentsHeader }),
      ...t.components.map(p => Paragraph({ text: p })),

      Header(2, { text: t.turnHeader }),
      ...t.turnParagraphs.map(p => Paragraph({ text: p })),

      Header(2, { text: t.breedingHeader }),
      ...t.breedingParagraphs.map(p => Paragraph({ text: p })),

      Header(3, { text: t.examplesHeader }),
      ...t.examples.map(p => Paragraph({ text: p })),

      Header(2, { text: t.predatorsHeader }),
      ...t.predators.map(p => Paragraph({ text: p })),

      Header(2, { text: t.protectionHeader }),
      ...t.protection.map(p => Paragraph({ text: p })),

      Header(2, { text: t.rulesHeader }),
      ...t.rules.map(p => Paragraph({ text: p })),
    ],
  });
};
