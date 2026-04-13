import type { ReactElement } from 'react';

import styles from './IconButton.module.css';

type IconButtonProps = {
  icon: React.ReactNode | string;
  onClick: () => void;
  title: string;
};

export default function IconButton({
  icon,
  onClick,
  title,
}: IconButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.btn}
      title={title}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
