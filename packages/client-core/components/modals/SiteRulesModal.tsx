import type { ReactElement } from 'react';

import { useLanguage } from '../../hooks/index.js';

import HelpModal from './HelpModal.js';

import styles from './SiteRulesModal.module.css';

function SiteRulesModal(): ReactElement {
  const { translation } = useLanguage();
  const { title, intro, sections } = translation.siteRules;

  return (
    <HelpModal>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.intro}>{intro}</p>
      {sections.map(section => (
        <section key={section.heading} className={styles.section}>
          <h3>{section.heading}</h3>
          <p>{section.body}</p>
        </section>
      ))}
    </HelpModal>
  );
}

export default SiteRulesModal;
