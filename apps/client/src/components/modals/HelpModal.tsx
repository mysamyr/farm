import type { ReactElement } from 'react';

import { useLanguage } from '../../hooks/useLanguage';

function HelpModal(): ReactElement {
  const { translation } = useLanguage();
  const help = translation.help;

  return (
    <div className="modal-container help-modal-container">
      <h2>{help.title}</h2>
      <p>{help.goal}</p>

      <h2>{help.componentsHeader}</h2>
      {help.components.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h2>{help.turnHeader}</h2>
      {help.turnParagraphs.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h2>{help.breedingHeader}</h2>
      {help.breedingParagraphs.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h3>{help.examplesHeader}</h3>
      {help.examples.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h2>{help.predatorsHeader}</h2>
      {help.predators.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h2>{help.protectionHeader}</h2>
      {help.protection.map(item => (
        <p key={item}>{item}</p>
      ))}

      <h2>{help.rulesHeader}</h2>
      {help.rules.map(item => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

export default HelpModal;
