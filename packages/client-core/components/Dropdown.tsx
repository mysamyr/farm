import { type ReactElement, type ReactNode, useRef, useState } from 'react';

import { ButtonVariant } from '../constants/index.js';
import { useClickOutside, useEscapeKey } from '../hooks/index.js';
import { classNames } from '../utils/index.js';

import Button from './Button.js';

import styles from './Dropdown.module.css';

type DropdownItem = {
  key: string;
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
};

type DropdownProps = {
  trigger: ReactNode;
  triggerTitle: string;
  items: DropdownItem[];
  triggerVariant?: ButtonVariant;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  disabled?: boolean;
};

export default function Dropdown({
  trigger,
  triggerTitle,
  items,
  triggerVariant = ButtonVariant.PRIMARY,
  triggerClassName,
  menuClassName,
  align = 'left',
  disabled = false,
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useClickOutside(containerRef, isOpen, close);
  useEscapeKey(isOpen, close);

  return (
    <div ref={containerRef} className={styles.container}>
      <Button
        variant={triggerVariant}
        className={triggerClassName}
        title={triggerTitle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className={styles.triggerLabel}>{trigger}</span>
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className={classNames(
            styles.dropdown,
            align === 'right' && styles.alignRight,
            menuClassName
          )}
        >
          {items.map(item => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={styles.item}
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
