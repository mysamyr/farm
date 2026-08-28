import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Dropdown } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { emitGameEvent } from '@game/client-core/socket';

import { EVENTS } from '@game/shared/constants';

import { EMOTES, type EmoteId } from '@game/game-farm/shared';

import styles from './EmoteButton.module.css';

type DropdownItemType = {
  key: string;
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
};

interface EmoteButtonProps {
  roomId: string;
}

export default function EmoteButton({
  roomId,
}: EmoteButtonProps): ReactElement {
  const [lastEmoteSendTime, setLastEmoteSendTime] = useState<number | null>(
    null
  );
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const isThrottled =
    lastEmoteSendTime !== null && now - lastEmoteSendTime < 5000;

  const handleEmoteSelect = useCallback(
    (emoteId: EmoteId): void => {
      if (isThrottled) {
        return;
      }

      emitGameEvent(
        EVENTS.GAME_ACTION,
        { roomId, action: { type: 'SEND_EMOTE', emoteId } },
        (res: { ok: boolean }) => {
          if (res.ok) {
            setLastEmoteSendTime(Date.now());
          }
        }
      );
    },
    [isThrottled, roomId]
  );

  const dropdownItems: DropdownItemType[] = useMemo(
    () =>
      EMOTES.map(emote => ({
        key: emote.id,
        label: <span className={styles.emoteOnly}>{emote.emoji}</span>,
        onSelect: () => handleEmoteSelect(emote.id),
        disabled: isThrottled,
      })),
    [handleEmoteSelect, isThrottled]
  );

  return (
    <div className={styles.container}>
      <Dropdown
        trigger={
          <span className={isThrottled ? styles.triggerDisabled : ''}>😊</span>
        }
        triggerTitle="Send an emote"
        items={dropdownItems}
        triggerVariant={ButtonVariant.SECONDARY}
        triggerClassName={styles.triggerButton}
        align="left"
        disabled={isThrottled}
      />
    </div>
  );
}
