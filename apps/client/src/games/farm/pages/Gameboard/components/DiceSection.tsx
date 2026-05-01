import type { ReactElement } from 'react';

import { FARM_EVENTS } from '@game/shared/constants/farm';
import type { Room as FarmRoom } from '@game/shared/types/farm';

import Button from '../../../../../components/ui/Button';
import { BUTTON_VARIANT } from '../../../../../constants';
import { useLanguage } from '../../../../../hooks/useLanguage';
import { useRoom } from '../../../../../hooks/useRoom';
import { useSnackbar } from '../../../../../hooks/useSnackbar';
import { emitEvent } from '../../../../../socket/client';
import { classNames } from '../../../../../utils';
import { resolveErrorMessage } from '../../../../../utils/language';
import { useFarmTranslation } from '../../../hooks/useFarmTranslation';
import { getDiceIcon, isWildAnimal } from '../../../utils';

import styles from './DiceSection.module.css';

import EmoteButton from './EmoteButton';

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
  const room = currentRoom as FarmRoom;

  const onRoll = () => {
    if (!isYourTurn) {
      return;
    }

    emitEvent(FARM_EVENTS.GAME_ROLL_DICE, { roomId: room.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  };

  const dice = room.dice;

  return (
    <div className={styles.container}>
      <div className={styles.diceContainer}>
        <div
          className={classNames(
            styles.dice,
            isWildAnimal(dice?.[0]) && styles.wildAnimal
          )}
        >
          {getDiceIcon(dice?.[0])}
        </div>
        <div
          className={classNames(
            styles.dice,
            isWildAnimal(dice?.[1]) && styles.wildAnimal
          )}
        >
          {getDiceIcon(dice?.[1])}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant={BUTTON_VARIANT.PRIMARY}
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
