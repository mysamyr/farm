import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { ButtonVariant } from '../constants/index.js';
import { classNames } from '../utils/index.js';

import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string | undefined> = {
  [ButtonVariant.PRIMARY]: styles.primary,
  [ButtonVariant.SECONDARY]: styles.secondary,
  [ButtonVariant.DANGER]: styles.danger,
  [ButtonVariant.SUCCESS]: styles.success,
  [ButtonVariant.ICON]: styles.icon,
  [ButtonVariant.TEXT]: styles.text,
};

export default function Button({
  children,
  className,
  variant = ButtonVariant.PRIMARY,
  type = 'button',
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={classNames(styles.button, variantClassMap[variant], className)}
      onMouseUp={e => {
        e.currentTarget.blur();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
