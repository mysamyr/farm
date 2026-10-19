import { type SubmitEvent, type ReactElement, useState } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useModal, useSnackbar } from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { ERROR, EVENTS, VALIDATION } from '@game/shared/constants';

import { graphemeLength, isValidRoomPassword } from '../../utils/index.js';

import styles from './RoomPasswordModal.module.css';

type RoomPasswordModalProps = {
  roomId: string;
  roomName: string;
};

function RoomPasswordModal({
  roomId,
  roomName,
}: RoomPasswordModalProps): ReactElement {
  const { closeModal } = useModal();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const [password, setPassword] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translation.protectedRoom;

  const length = graphemeLength(password);
  const validationError = !isTouched
    ? null
    : length < VALIDATION.ROOM_PASSWORD.MIN_LENGTH
      ? translation.errors.roomPasswordTooShort
      : length > VALIDATION.ROOM_PASSWORD.MAX_LENGTH
        ? translation.errors.roomPasswordTooLong
        : null;
  const error = validationError ?? serverError;
  const isValid = isValidRoomPassword(password);

  function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    emitEvent(EVENTS.ROOM_JOIN, { roomId, password }, res => {
      setIsSubmitting(false);
      if (res.ok) {
        closeModal();
        return;
      }
      if (res.error === ERROR.WRONG_ROOM_PASSWORD) {
        setServerError(translation.errors[ERROR.WRONG_ROOM_PASSWORD]);
        return;
      }
      showSnackbar(resolveErrorMessage(res.error, translation));
      closeModal();
    });
  }

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <h3 className={styles.title}>{t.joinTitle}</h3>
      <p className={styles.description}>{t.joinDescription(roomName)}</p>
      <label className={styles.label} htmlFor="room-password-input">
        {t.passwordLabel}
      </label>
      <input
        id="room-password-input"
        className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
        type="text"
        value={password}
        placeholder={t.passwordPlaceholder}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        onChange={event => {
          setPassword(event.target.value);
          setIsTouched(true);
          setServerError(null);
        }}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <Button
          type="button"
          variant={ButtonVariant.SECONDARY}
          onClick={() => closeModal()}
        >
          {translation.cancel}
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {t.join}
        </Button>
      </div>
    </form>
  );
}

export default RoomPasswordModal;
