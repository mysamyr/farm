import type { ReactElement } from 'react';

import { classNames } from '../../utils';


import styles from './HelpModal.module.css';

export interface HelpSection {
  header: string;
  headerLevel?: 'h2' | 'h3';
  content: string | string[];
}

interface HelpModalProps {
  sections: HelpSection[];
}

// TODO: very basic and strict. impossible to add h2 and h3 in the same section.

function HelpModal({ sections }: HelpModalProps): ReactElement {
  return (
    <div className={classNames(styles.container)}>
      {sections.map(section => {
        const Header = section.headerLevel ?? 'h2';
        return (
          <div key={section.header}>
            <Header>{section.header}</Header>
            {Array.isArray(section.content) ? (
              section.content.map(item => <p key={item}>{item}</p>)
            ) : (
              <p>{section.content}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HelpModal;
