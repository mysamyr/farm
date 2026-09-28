import {
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button, CloseIcon, SendIcon } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useRoomRole } from '@game/client-core/hooks';
import { getSocketId } from '@game/client-core/socket';
import { classNames } from '@game/client-core/utils';
import { VALIDATION } from '@game/shared/constants';

import { isValidChatInput, useChat } from '../../hooks/index.js';

import styles from './ChatPanel.module.css';

const MAX_LENGTH = VALIDATION.CHAT_MESSAGE.MAX_LENGTH;
const COUNTER_THRESHOLD = MAX_LENGTH - 30;

export function ChatPanel(): ReactElement {
  const { isOpen, messages, setOpen, sendMessage } = useChat();
  const { translation } = useLanguage();
  const { isSpectator } = useRoomRole();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketId = getSocketId();

  const draftLength = [...draft.trim()].length;
  const canSend = !isSpectator && !sending && isValidChatInput(draft);

  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen && !isSpectator) inputRef.current?.focus();
  }, [isOpen, isSpectator]);

  const close = (): void => setOpen(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    sendMessage(draft, ok => {
      setSending(false);
      if (ok) setDraft('');
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  };

  return (
    <div className={classNames(styles.root, !isOpen && styles.closed)}>
      <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      <div
        id="room-chat"
        role="dialog"
        aria-label={translation.chat.title}
        className={styles.panel}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{translation.chat.title}</h3>
          <Button
            variant={ButtonVariant.ICON}
            onClick={close}
            aria-label={translation.close}
          >
            <CloseIcon />
          </Button>
        </div>

        <ol ref={listRef} className={styles.messages} aria-live="polite">
          {messages.length === 0 && (
            <li className={styles.empty}>{translation.chat.empty}</li>
          )}
          {messages.map((message, index) => {
            const isOwn = message.authorId === socketId;
            const isGrouped =
              messages[index - 1]?.authorId === message.authorId;
            return (
              <li
                key={message.id}
                className={classNames(
                  styles.message,
                  isOwn && styles.own,
                  isGrouped && styles.grouped
                )}
              >
                {!isGrouped && (
                  <span className={styles.author}>
                    {isOwn ? translation.you : message.authorName}
                  </span>
                )}
                <span className={styles.text}>{message.text}</span>
              </li>
            );
          })}
        </ol>

        {isSpectator ? (
          <p className={styles.readOnly}>{translation.chat.readOnly}</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder={translation.chat.placeholder}
              aria-label={translation.chat.placeholder}
              maxLength={MAX_LENGTH * 2}
              autoComplete="off"
              enterKeyHint="send"
            />
            {draftLength > COUNTER_THRESHOLD && (
              <span
                className={classNames(
                  styles.counter,
                  draftLength > MAX_LENGTH && styles.counterExceeded
                )}
              >
                {MAX_LENGTH - draftLength}
              </span>
            )}
            <Button
              type="submit"
              variant={ButtonVariant.ICON}
              className={styles.send}
              disabled={!canSend}
              aria-label={translation.chat.send}
            >
              <SendIcon />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
