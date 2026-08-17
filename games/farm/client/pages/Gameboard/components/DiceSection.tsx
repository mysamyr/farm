import type { ReactElement } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useRoom, useSnackbar } from '@game/client-core/hooks';
import { emitGameEvent } from '@game/client-core/socket';
import { classNames, resolveErrorMessage } from '@game/client-core/utils';

import { EVENTS } from '@game/shared/constants';

import { type Room } from '@game/game-farm/shared';

import { useFarmTranslation } from '../../../hooks/useFarmTranslation.js';
import { getDiceIcon, isWildAnimal } from '../../../utils/index.js';

import styles from './DiceSection.module.css';

import EmoteButton from './EmoteButton.js';

type DiceSectionProps = {
  isYourTurn: boolean;
};

export default function DiceSection({
  isYourTurn,
}: DiceSectionProps): ReactElement {
  const farmT = useFarmTranslation();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const { currentRoom } = useRoom();
  const room = currentRoom as Room;

  const onRoll = () => {
    if (!isYourTurn) {
      return;
    }

    emitGameEvent(
      EVENTS.GAME_ACTION,
      { roomId: room.id, action: { type: 'ROLL_DICE' } },
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
      }
    );
  };

  const dice = room.dice;

  return (
    <div className={styles.container}>
      <div className={styles.diceContainer}>
        <div
          className={classNames(
            styles.dice,
            styles.blueDice,
            isWildAnimal(dice?.[0]) && styles.wildAnimal
          )}
        >
          {getDiceIcon(dice?.[0])}
        </div>
        <div
          className={classNames(
            styles.dice,
            styles.orangeDice,
            isWildAnimal(dice?.[1]) && styles.wildAnimal
          )}
        >
          {getDiceIcon(dice?.[1])}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant={ButtonVariant.PRIMARY}
          disabled={!isYourTurn || !!room.trade}
          onClick={onRoll}
        >
          {farmT.gameButton.throwDice}
        </Button>

        <EmoteButton roomId={room.id} />
      </div>
    </div>
  );
}
