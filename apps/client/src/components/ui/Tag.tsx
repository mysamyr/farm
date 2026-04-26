import type { ReactElement, ReactNode } from 'react';

import styles from './Tag.module.css';

type TagProps = {
  children: ReactNode;
};

export default function Tag({ children }: TagProps): ReactElement {
  return <span className={styles.tag}>{children}</span>;
}
