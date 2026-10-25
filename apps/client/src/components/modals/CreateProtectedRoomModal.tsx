import { type SubmitEvent, type ReactElement, useState } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useModal, useRoom } from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS, VALIDATION } from '@game/shared/constants';
import type { GameId } from '@game/shared/constants';

import {
  graphemeLength,
  isValidRoomName,
  isValidRoomPassword,
} from '../../utils/index.js';

import styles from './CreateProtectedRoomModal.module.css';

type CreateProtectedRoomModalProps = {
  game: GameId;
  defaultName: string;
};

function CreateProtectedRoomModal({
  game,
  defaultName,
}: CreateProtectedRoomModalProps): ReactElement {
  const { closeModal } = useModal();
  const { translation } = useLanguage();
  const { rooms } = useRoom();
  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState('');
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translation.protectedRoom;

  const normalizedName = name.trim();
  const nameLength = graphemeLength(normalizedName);
  const isNameTaken = rooms.some(
    room => room.game === game && room.name === normalizedName
  );
  const nameError =
    nameLength < VALIDATION.ROOM_NAME.MIN_LENGTH
      ? translation.errors.roomNameTooShort
      : nameLength > VALIDATION.ROOM_NAME.MAX_LENGTH
        ? translation.errors.roomNameTooLong
        : isNameTaken
          ? translation.errors[ERROR.ROOM_NAME_TAKEN]
          : null;

  const passwordLength = graphemeLength(password);
  const passwordError = !isPasswordTouched
    ? null
    : passwordLength < VALIDATION.ROOM_PASSWORD.MIN_LENGTH
      ? translation.errors.roomPasswordTooShort
      : passwordLength > VALIDATION.ROOM_PASSWORD.MAX_LENGTH
        ? translation.errors.roomPasswordTooLong
        : null;

  const isValid =
    isValidRoomName(name) && !isNameTaken && isValidRoomPassword(password);

  function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    emitEvent(
      EVENTS.ROOM_CREATE,
      { game, name: normalizedName, password },
      res => {
        setIsSubmitting(false);
        if (!res.ok) {
          setServerError(resolveErrorMessage(res.error, translation));
          return;
        }
        closeModal();
      }
    );
  }

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <h3 className={styles.title}>{t.createTitle}</h3>
      <p className={styles.description}>{t.createDescription}</p>
      <label className={styles.label} htmlFor="protected-room-name-input">
        {t.nameLabel}
      </label>
      <input
        id="protected-room-name-input"
        className={`${styles.input}${nameError ? ` ${styles.inputError}` : ''}`}
        type="text"
        value={name}
        placeholder={t.nameLabel}
        autoComplete="off"
        maxLength={VALIDATION.ROOM_NAME.MAX_LENGTH}
        onChange={event => {
          setName(event.target.value);
          setServerError(null);
        }}
      />
      {nameError ? <p className={styles.error}>{nameError}</p> : null}
      <label className={styles.label} htmlFor="protected-room-password-input">
        {t.passwordLabel}
      </label>
      <input
        id="protected-room-password-input"
        className={`${styles.input}${passwordError ? ` ${styles.inputError}` : ''}`}
        type="text"
        value={password}
        placeholder={t.passwordPlaceholder}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        onChange={event => {
          setPassword(event.target.value);
          setIsPasswordTouched(true);
          setServerError(null);
        }}
      />
      {passwordError ? <p className={styles.error}>{passwordError}</p> : null}
      {serverError ? <p className={styles.error}>{serverError}</p> : null}
      <div className={styles.actions}>
        <Button
          type="button"
          variant={ButtonVariant.SECONDARY}
          onClick={() => closeModal()}
        >
          {translation.cancel}
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {t.create}
        </Button>
      </div>
    </form>
  );
}

export default CreateProtectedRoomModal;
