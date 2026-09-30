import type { ReactElement, ReactNode } from 'react';

import { useModal } from '../../hooks/index.js';
import ModalHeader from '../Modal/ModalHeader.js';

import styles from './HelpModal.module.css';

function HelpModal({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement {
  const { closeModal } = useModal();

  return (
    <div className={styles.container}>
      <ModalHeader
        className={styles.header}
        titleClassName={styles.title}
        titleAs="h2"
        title={title}
        onClose={closeModal}
      />
      {children}
    </div>
  );
}

export default HelpModal;
