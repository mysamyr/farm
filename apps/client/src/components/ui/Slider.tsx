import React, { ReactElement } from 'react';

import styles from './Slider.module.css';

type SliderProps = {
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Slider({
  label,
  checked,
  onChange,
}: SliderProps): ReactElement {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <span className={styles.switch}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className={styles.slider} />
      </span>
    </label>
  );
}
