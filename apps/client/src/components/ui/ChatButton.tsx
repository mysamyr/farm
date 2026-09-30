import type { ReactElement } from 'react';

import { ChatIcon, FloatingButton } from '@game/client-core/components';
import { useLanguage } from '@game/client-core/hooks';

import { useChat } from '../../hooks/index.js';

import styles from './ChatButton.module.css';

const MAX_BADGE_COUNT = 99;

export function ChatButton(): ReactElement {
  const { isOpen, unread, setOpen } = useChat();
  const { translation } = useLanguage();
  const hasUnread = unread > 0;

  return (
    <FloatingButton
      side="left"
      className={isOpen ? styles.open : undefined}
      active={isOpen}
      attention={hasUnread}
      badge={
        hasUnread
          ? unread > MAX_BADGE_COUNT
            ? `${MAX_BADGE_COUNT}+`
            : unread
          : undefined
      }
      badgeTone="error"
      aria-label={translation.chat.open(unread)}
      aria-expanded={isOpen}
      aria-controls="room-chat"
      onClick={() => setOpen(!isOpen)}
    >
      <ChatIcon />
    </FloatingButton>
  );
}
