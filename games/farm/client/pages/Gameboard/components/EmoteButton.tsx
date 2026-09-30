import {
  memo,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

function EmoteButton({
  roomId,
}: EmoteButtonProps): ReactElement {
  const [isThrottled, setIsThrottled] = useState(false);
  const cooldownTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current !== undefined) {
        window.clearTimeout(cooldownTimer.current);
      }

    };
  }, []);

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
            setIsThrottled(true);
            cooldownTimer.current = window.setTimeout(() => {
              setIsThrottled(false);
            }, 5000);
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

export default memo(EmoteButton);
