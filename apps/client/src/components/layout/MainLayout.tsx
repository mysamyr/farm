import { type ReactElement } from 'react';

import { Outlet } from 'react-router-dom';

import { Header } from '../ui/Header.js';

import styles from './MainLayout.module.css';

export function MainLayout(): ReactElement {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
