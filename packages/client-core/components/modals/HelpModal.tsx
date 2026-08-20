import type { ReactElement, ReactNode } from 'react';

import { classNames } from '../../utils/index.js';

import styles from './HelpModal.module.css';

function HelpModal({ children }: { children: ReactNode }): ReactElement {
  return <div className={classNames(styles.container)}>{children}</div>;
}

export default HelpModal;
