import React, { ReactElement } from 'react';

import styles from './Tag.module.css';

type TagProps = {
  children: React.ReactNode;
};

export default function Tag({ children }: TagProps): ReactElement {
  return <span className={styles.tag}>{children}</span>;
}
