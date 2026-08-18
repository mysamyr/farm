import { type FormEvent, type ReactElement, useState } from 'react';

import { VALIDATION } from '@game/shared/constants';

import { ButtonVariant } from '../../constants/index.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import { useModal } from '../../hooks/useModal.js';
import { isValidUsername, useUsername } from '../../hooks/useUsername.js';

import Button from '../Button.js';

import styles from './ChangeNameModal.module.css';

export type ChangeNameModalProps = {
  required?: boolean;
};

function ChangeNameModal({
  required = false,
}: ChangeNameModalProps): ReactElement {
  const { closeModal } = useModal();
  const { translation } = useLanguage();
  const { username, setUsername } = useUsername();
  const [draft, setDraft] = useState(username);
  const t = translation.changeName;

  const normalized = draft.trim();
  const length = [...normalized].length;
  const error =
    normalized.length === 0
      ? required
        ? translation.errors.userNameTooShort
        : null
      : length < VALIDATION.USER_NAME.MIN_LENGTH
        ? translation.errors.userNameTooShort
        : length > VALIDATION.USER_NAME.MAX_LENGTH
          ? translation.errors.userNameTooLong
          : null;

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!isValidUsername(draft)) {
      return;
    }
    setUsername(normalized);
    closeModal();
  }

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <h3 className={styles.title}>{t.title}</h3>
      <label className={styles.label} htmlFor="change-name-input">
        {t.placeholder}
      </label>
      <input
        id="change-name-input"
        className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
        type="text"
        value={draft}
        placeholder={t.placeholder}
        autoFocus
        autoComplete="nickname"
        maxLength={VALIDATION.USER_NAME.MAX_LENGTH}
        onChange={event => setDraft(event.target.value)}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        {!required && (
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            onClick={() => closeModal()}
          >
            {t.cancel}
          </Button>
        )}
        <Button type="submit" disabled={!isValidUsername(draft)}>
          {t.save}
        </Button>
      </div>
    </form>
  );
}

export default ChangeNameModal;
