import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { BUTTON_VARIANT, ButtonVariant } from '../../constants';
import { classNames } from '../../utils';

import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string | undefined> = {
  [BUTTON_VARIANT.PRIMARY]: styles.primary,
  [BUTTON_VARIANT.SECONDARY]: styles.secondary,
  [BUTTON_VARIANT.DANGER]: styles.danger,
  [BUTTON_VARIANT.SUCCESS]: styles.success,
  [BUTTON_VARIANT.ICON]: styles.icon,
};

export default function Button({
  children,
  className,
  variant = BUTTON_VARIANT.PRIMARY,
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
