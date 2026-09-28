import type { ReactElement } from 'react';

import { ChatIcon } from '@game/client-core/components';
import { useLanguage } from '@game/client-core/hooks';
import { classNames } from '@game/client-core/utils';

import { useChat } from '../../hooks/index.js';

import styles from './ChatButton.module.css';

const MAX_BADGE_COUNT = 99;

export function ChatButton(): ReactElement {
  const { isOpen, unread, setOpen } = useChat();
  const { translation } = useLanguage();
  const hasUnread = unread > 0;

  return (
    <button
      type="button"
      className={classNames(
        styles.button,
        hasUnread && styles.attention,
        isOpen && styles.open
      )}
      aria-label={translation.chat.open(unread)}
      aria-expanded={isOpen}
      aria-controls="room-chat"
      onClick={() => setOpen(!isOpen)}
    >
      <ChatIcon />
      {hasUnread && (
        <span className={styles.badge} aria-hidden="true">
          {unread > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unread}
        </span>
      )}
    </button>
  );
}
