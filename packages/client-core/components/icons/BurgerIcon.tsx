import { ReactElement } from 'react';

function BurgerIcon(): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="2" y1="2" x2="22" y2="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="2" y1="18" x2="22" y2="18" />
    </svg>
  );
}

export default BurgerIcon;
