import { type ReactElement, type ReactNode, useRef, useState } from 'react';

import { ButtonVariant } from '../../constants/index.js';
import { useClickOutside, useEscapeKey } from '../../hooks/index.js';
import { classNames } from '../../utils/index.js';
import Button from '../Button.js';

import styles from './SplitButton.module.css';

export type SplitButtonOption<TKey extends string = string> = {
  key: TKey;
  label: ReactNode;
  onClick: () => void;
};

type SplitButtonProps<TKey extends string> = {
  options: SplitButtonOption<TKey>[];
  selectedKey: TKey;
  onSelectedKeyChange: (key: TKey) => void;
  menuTitle: string;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
};

/**
 * Button split vertically: the main part runs the selected option,
 * the arrow part opens a menu that only changes which option is selected.
 */
export default function SplitButton<TKey extends string>({
  options,
  selectedKey,
  onSelectedKeyChange,
  menuTitle,
  variant = ButtonVariant.PRIMARY,
  className,
  disabled = false,
}: SplitButtonProps<TKey>): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useClickOutside(containerRef, isOpen, close);
  useEscapeKey(isOpen, close);

  const selected =
    options.find(option => option.key === selectedKey) ?? options[0];

  return (
    <div ref={containerRef} className={classNames(styles.container, className)}>
      <Button
        variant={variant}
        className={styles.main}
        disabled={disabled || !selected}
        onClick={() => {
          close();
          selected?.onClick();
        }}
      >
        {selected?.label}
      </Button>
      <Button
        variant={variant}
        className={styles.toggle}
        title={menuTitle}
        aria-label={menuTitle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => setIsOpen(open => !open)}
      >
        <span
          className={classNames(styles.arrow, isOpen && styles.arrowOpen)}
          aria-hidden="true"
        >
          ▾
        </span>
      </Button>

      {isOpen ? (
        <div role="menu" className={styles.menu}>
          {options.map(option => (
            <button
              key={option.key}
              type="button"
              role="menuitemradio"
              aria-checked={option.key === selected?.key}
              className={classNames(
                styles.item,
                option.key === selected?.key && styles.itemSelected
              )}
              onClick={() => {
                onSelectedKeyChange(option.key);
                close();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
