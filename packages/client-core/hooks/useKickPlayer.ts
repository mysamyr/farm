import { useCallback } from 'react';

import { EVENTS } from '@game/shared/constants';
import type { BasePlayer } from '@game/shared/types';

import ConfirmationModal from '../components/modals/ConfirmationModal.js';
import { emitEvent } from '../socket/index.js';
import { resolveErrorMessage } from '../utils/index.js';

import { useLanguage } from './useLanguage.js';
import { useModal } from './useModal.js';
import { useSnackbar } from './useSnackbar.js';

export function useKickPlayer(): (roomId: string, player: BasePlayer) => void {
  const { showModal } = useModal();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  return useCallback(
    (roomId: string, player: BasePlayer): void => {
      showModal({
        component: ConfirmationModal,
        props: {
          title: translation.kick.confirmTitle,
          message: translation.kick.confirmMessage(player.name),
          confirmLabel: translation.kick.confirmButton,
          cancelLabel: translation.kick.cancelButton,
          onConfirm: () => {
            emitEvent(
              EVENTS.ROOM_KICK,
              { roomId, playerId: player.id },
              res => {
                if (!res.ok) {
                  showSnackbar(resolveErrorMessage(res.error, translation));
                }
              }
            );
          },
        },
      });
    },
    [showModal, showSnackbar, translation]
  );
}
