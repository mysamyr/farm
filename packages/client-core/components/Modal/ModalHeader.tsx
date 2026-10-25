import type { ReactElement, ReactNode } from 'react';

import { ButtonVariant } from '../../constants/index.js';
import { useLanguage } from '../../hooks/index.js';
import { classNames } from '../../utils/index.js';
import Button from '../Button.js';
import { CloseIcon } from '../icons/index.js';

import styles from './ModalHeader.module.css';

type ModalHeaderProps = {
  title: ReactNode;
  titleId?: string;
  titleAs?: 'h2' | 'h3';
  /** Renders the close (X) button when provided. */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  titleClassName?: string;
};

export default function ModalHeader({
  title,
  titleId,
  titleAs: Title = 'h3',
  onClose,
  closeLabel,
  className,
  titleClassName,
}: ModalHeaderProps): ReactElement {
  const { translation } = useLanguage();
  const label = closeLabel ?? translation.close;

  return (
    <div className={classNames(styles.header, className)}>
      <Title id={titleId} className={classNames(styles.title, titleClassName)}>
        {title}
      </Title>
      {onClose ? (
        <Button
          variant={ButtonVariant.ICON}
          aria-label={label}
          title={label}
          onClick={onClose}
        >
          <CloseIcon />
        </Button>
      ) : null}
    </div>
  );
}
