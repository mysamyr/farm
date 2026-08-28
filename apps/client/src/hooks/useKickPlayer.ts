import { useCallback } from 'react';

import { ConfirmationModal } from '@game/client-core/components';
import { useLanguage, useModal, useSnackbar } from '@game/client-core/hooks';
import { emitEvent } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS } from '@game/shared/constants';
import type { BasePlayer } from '@game/shared/types';

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
