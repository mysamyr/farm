import { type SubmitEvent, type ReactElement, useState } from 'react';

import { Button } from '@game/client-core/components';
import { ButtonVariant } from '@game/client-core/constants';
import { useLanguage, useModal } from '@game/client-core/hooks';
import { VALIDATION } from '@game/shared/constants';

import { useUsername } from '../../hooks/index.js';
import { isValidUsername } from '../../utils/index.js';

import styles from './ChangeNameModal.module.css';

function ChangeNameModal(): ReactElement {
  const { closeModal } = useModal();
  const { translation } = useLanguage();
  const { username, setUsername } = useUsername();
  const [draft, setDraft] = useState(username);
  const t = translation.changeName;

  const normalized = draft.trim();
  const length = [...normalized].length;
  const error =
    normalized.length === 0
      ? translation.errors.userNameTooShort
      : length < VALIDATION.USER_NAME.MIN_LENGTH
        ? translation.errors.userNameTooShort
        : length > VALIDATION.USER_NAME.MAX_LENGTH
          ? translation.errors.userNameTooLong
          : null;

  function onSubmit(event: SubmitEvent): void {
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
      <p className={styles.description}>{t.description}</p>
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
        <Button
          type="button"
          variant={ButtonVariant.SECONDARY}
          onClick={() => closeModal()}
        >
          {translation.cancel}
        </Button>
        <Button type="submit" disabled={!isValidUsername(draft)}>
          {t.save}
        </Button>
      </div>
    </form>
  );
}

export default ChangeNameModal;
