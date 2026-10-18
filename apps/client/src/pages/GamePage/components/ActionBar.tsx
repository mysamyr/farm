import { useCallback, useState } from 'react';

import { SplitButton } from '@game/client-core/components';
import { LOCAL_STORAGE_KEY } from '@game/client-core/constants';
import {
  useLanguage,
  useModal,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS } from '@game/shared/constants';
import { Link } from 'react-router-dom';

import { CreateProtectedRoomModal } from '../../../components/index.js';
import { getCatalogPath } from '../../../constants/index.js';
import { useActiveGame, useUsername } from '../../../hooks/index.js';
import { generateRoomName } from '../../../utils/index.js';

import styles from './ActionBar.module.css';

enum CreateRoomMode {
  NORMAL = 'normal',
  PROTECTED = 'protected',
}

function getStoredCreateRoomMode(): CreateRoomMode {
  const stored = window.localStorage.getItem(
    LOCAL_STORAGE_KEY.CREATE_ROOM_MODE
  );
  return stored === CreateRoomMode.PROTECTED
    ? CreateRoomMode.PROTECTED
    : CreateRoomMode.NORMAL;
}

export default function ActionBar() {
  const { translation, language } = useLanguage();
  const { rooms, currentRoom } = useRoom();
  const { showSnackbar } = useSnackbar();
  const { showModal } = useModal();
  const { activeGame, cleanupCurrentIdleRoom } = useActiveGame();
  const { isValid } = useUsername();
  const [createMode, setCreateMode] = useState(getStoredCreateRoomMode);

  const onCreateModeChange = useCallback((mode: CreateRoomMode) => {
    setCreateMode(mode);
    window.localStorage.setItem(LOCAL_STORAGE_KEY.CREATE_ROOM_MODE, mode);
  }, []);

  const prepareRoomCreate = useCallback(() => {
    if (!isValid) {
      showSnackbar(translation.errors[ERROR.NO_USERNAME]);
      return null;
    }

    if (!activeGame) {
      return null;
    }

    if (currentRoom) {
      showSnackbar(translation.errors[ERROR.ALREADY_IN_ROOM]);
      return null;
    }

    const existingNames = rooms
      .filter(r => r.game === activeGame)
      .map(r => r.name);
    const name = generateRoomName(language, existingNames);

    return { game: activeGame, name };
  }, [
    activeGame,
    currentRoom,
    isValid,
    language,
    rooms,
    showSnackbar,
    translation,
  ]);

  const onRoomCreate = useCallback(() => {
    const payload = prepareRoomCreate();
    if (!payload) {
      return;
    }

    emitEvent(EVENTS.ROOM_CREATE, payload, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [prepareRoomCreate, showSnackbar, translation]);

  const onProtectedRoomCreate = useCallback(() => {
    const payload = prepareRoomCreate();
    if (!payload) {
      return;
    }

    showModal({
      component: CreateProtectedRoomModal,
      props: { game: payload.game, defaultName: payload.name },
    });
  }, [prepareRoomCreate, showModal]);

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
      <SplitButton
        options={[
          {
            key: CreateRoomMode.NORMAL,
            label: translation.dashboard.createRoomBtn,
            onClick: onRoomCreate,
          },
          {
            key: CreateRoomMode.PROTECTED,
            label: translation.dashboard.createProtectedRoomBtn,
            onClick: onProtectedRoomCreate,
          },
        ]}
        selectedKey={createMode}
        onSelectedKeyChange={onCreateModeChange}
        menuTitle={translation.dashboard.createRoomOptions}
      />
    </section>
  );
}
