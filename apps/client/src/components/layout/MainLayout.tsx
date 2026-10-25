import { type ReactElement } from 'react';

import { useRoom } from '@game/client-core/hooks';
import { classNames } from '@game/client-core/utils';
import { Outlet } from 'react-router-dom';

import { ChatButton } from '../ui/ChatButton.js';
import { ChatPanel } from '../ui/ChatPanel.js';
import { Header } from '../ui/Header.js';

import styles from './MainLayout.module.css';

export function MainLayout(): ReactElement {
  const { currentRoom } = useRoom();
  const hasChat = Boolean(currentRoom);

  return (
    <div className={styles.shell}>
      <Header />
      <main className={classNames(styles.main, hasChat && styles.withChat)}>
        <Outlet />
      </main>
      {hasChat && (
        <>
          <ChatPanel />
          <ChatButton />
        </>
      )}
    </div>
  );
}
