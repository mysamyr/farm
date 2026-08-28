import type { ReactElement, ReactNode } from 'react';

import styles from './Tag.module.css';

type TagProps = {
  children: ReactNode;
  title?: string;
};

export default function Tag({ children, title }: TagProps): ReactElement {
  return (
    <span className={styles.tag} title={title}>
      {children}
    </span>
  );
}
