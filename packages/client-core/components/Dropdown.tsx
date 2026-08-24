import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';

import { ButtonVariant } from '../constants/index.js';
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
  const showIndicator =
    triggerVariant !== ButtonVariant.TEXT &&
    triggerVariant !== ButtonVariant.ICON;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
        <span className={styles.triggerContent}>
          <span className={styles.triggerLabel}>{trigger}</span>
          {showIndicator ? (
            <span className={styles.triggerIndicator} aria-hidden="true">
              ▾
            </span>
          ) : null}
        </span>
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
