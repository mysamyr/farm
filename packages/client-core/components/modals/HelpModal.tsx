import type { ReactElement, ReactNode } from 'react';

import { ButtonVariant } from '../../constants/index.js';
import { useModal } from '../../hooks/index.js';
import { classNames } from '../../utils/index.js';
import Button from '../Button.js';
import { CloseIcon } from '../icons/index.js';

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
   <div className={classNames(styles.container)}>
     <div className={styles.header}>
       <h2 className={styles.title}>{title}</h2>
       <Button className={styles.closeButton} variant={ButtonVariant.ICON} onClick={closeModal} aria-label="Close help modal">
         <CloseIcon />
       </Button>
     </div>
     {children}
   </div>
  );
}

export default HelpModal;
