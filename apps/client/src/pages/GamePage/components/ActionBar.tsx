import { useCallback } from 'react';

import { Button } from '@game/client-core/components';
import { getCatalogPath } from '@game/client-core/constants';
import {
  useActiveGame,
  useLanguage,
  useRoom,
  useSnackbar,
  useUsername,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS } from '@game/shared/constants';
import { Link } from 'react-router-dom';

import styles from './ActionBar.module.css';

export default function ActionBar() {
  const { translation } = useLanguage();
  const { currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { activeGame, cleanupCurrentIdleRoom } = useActiveGame();
  const { isValid } = useUsername();

  const onRoomCreate = useCallback(() => {
    if (!isValid) {
      showSnackbar(translation.errors[ERROR.NO_USERNAME]);
      return;
    }

    if (!activeGame) {
      return;
    }

    if (currentRoom) {
      showSnackbar(translation.errors[ERROR.ALREADY_IN_ROOM]);
      return;
    }

    emitEvent(EVENTS.ROOM_CREATE, { game: activeGame }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [activeGame, currentRoom, isValid, showSnackbar, translation]);

  return (
    <section className={styles.container}>
      <Link
        to={getCatalogPath()}
        className={styles.backLink}
        onClick={() => cleanupCurrentIdleRoom()}
      >
        <span className={styles.backArrow} aria-hidden="true">
          ←
        </span>
        {translation.dashboard.backToGames}
      </Link>
      <Button onClick={onRoomCreate}>
        {translation.dashboard.createRoomBtn}
      </Button>
    </section>
  );
}
