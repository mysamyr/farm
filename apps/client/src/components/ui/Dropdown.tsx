import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BUTTON_VARIANT, ButtonVariant } from '../../constants';
import { classNames } from '../../utils';

import Button from './Button';

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
  menuClassName?: string;
  align?: 'left' | 'right';
};

export default function Dropdown({
  trigger,
  triggerTitle,
  items,
  triggerVariant = BUTTON_VARIANT.PRIMARY,
  menuClassName,
  align = 'left',
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        title={triggerTitle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen(open => !open)}
      >
        {trigger}
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
