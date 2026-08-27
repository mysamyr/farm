import { useCallback } from 'react';

import { EVENTS } from '@game/shared/constants';
import { useNavigate } from 'react-router-dom';

import { getGamePath } from '../constants/index.js';
import { emitEvent } from '../socket/index.js';
import { resolveErrorMessage } from '../utils/index.js';

import { useLanguage } from './useLanguage.js';
import { useRoom } from './useRoom.js';
import { useSnackbar } from './useSnackbar.js';

export function useRematchActions() {
  const navigate = useNavigate();
  const { currentRoom, setCurrentRoom } = useRoom();
  const { translation } = useLanguage();
  const { showSnackbar } = useSnackbar();

  const handleLeave = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.ROOM_LEAVE, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
      setCurrentRoom(null);
      void navigate(getGamePath(currentRoom.game));
    });
  }, [currentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  const handleRematch = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_REMATCH, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [currentRoom, showSnackbar, translation]);

  const handleDeclineRematch = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_REMATCH_DECLINE, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [currentRoom, showSnackbar, translation]);

  const handleLobby = useCallback(() => {
    if (!currentRoom) {
      return;
    }
    emitEvent(EVENTS.GAME_RETURN_TO_LOBBY, { roomId: currentRoom.id }, res => {
      if (!res.ok) {
        showSnackbar(resolveErrorMessage(res.error, translation));
      }
    });
  }, [currentRoom, showSnackbar, translation]);

  return {
    handleLeave,
    handleRematch,
    handleDeclineRematch,
    handleLobby,
  };
}
