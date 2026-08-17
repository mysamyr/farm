import { type ReactElement, useCallback, useEffect } from 'react';

import { Header } from '@game/client/components';
import { Button, WinningAnimation } from '@game/client-core/components';

import { ButtonVariant, getDashboardPath } from '@game/client-core/constants';
import {
  useLanguage,
  useModal,
  useRoom,
  useSnackbar,
} from '@game/client-core/hooks';
import { emitGameEvent, getSocketId } from '@game/client-core/socket';
import { resolveErrorMessage } from '@game/client-core/utils';
import { EVENTS, ROOM_STATES } from '@game/shared/constants';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { GAME_RULES, type Room } from '@game/game-farm/shared';

import FarmHelpModal from '../../components/FarmHelpModal.js';

import TradeModal from '../../components/TradeModal.js';
import { useFarmTranslation } from '../../hooks/useFarmTranslation.js';
import { getCurrentPlayerTurnId } from '../../utils/index.js';

import ActiveCardsSection from './components/ActiveCardsSection.js';
import DiceSection from './components/DiceSection.js';
import EmoteFloatingContainer from './components/EmoteFloatingContainer.js';
import ExchangeSection from './components/ExchangeSection.js';
import PlayersSection from './components/PlayersSection.js';

import styles from './Gameboard.module.css';

export default function Gameboard(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentRoom: rawCurrentRoom, setCurrentRoom } = useRoom();
  const { showModal, closeModal } = useModal();
  const { translation } = useLanguage();
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();

  const currentRoom = rawCurrentRoom as unknown as Room | null;

  const handleLeave = useCallback(() => {
    if (!rawCurrentRoom) {
      return;
    }
    emitGameEvent(
      EVENTS.ROOM_LEAVE,
      { roomId: rawCurrentRoom.id },
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok) {
          showSnackbar(resolveErrorMessage(res.error, translation));
        }
        setCurrentRoom(null);
        void navigate(getDashboardPath(rawCurrentRoom.game));
      }
    );
  }, [rawCurrentRoom, navigate, setCurrentRoom, showSnackbar, translation]);

  function onLeaveClick() {
    if (
      currentRoom?.state !== ROOM_STATES.RUNNING ||
      window.confirm(farmT.roomLeaveConfirmation)
    ) {
      handleLeave();
    }
  }

  // Auto-open/close trade modal based on room trade state
  useEffect(() => {
    if (!currentRoom?.trade) {
      closeModal();
      return;
    }
    const myId = getSocketId();
    const isParticipant =
      currentRoom.trade.initiatorId === myId ||
      currentRoom.trade.targetId === myId;
    if (isParticipant) {
      showModal({
        component: TradeModal,
        onClose: () => {
          emitGameEvent(EVENTS.GAME_ACTION, {
            roomId: currentRoom.id,
            action: { type: 'TRADE_CANCEL' },
          });
        },
      });
    }
  }, [currentRoom?.trade, currentRoom?.id, showModal, closeModal]);

  if (!currentRoom) {
    return (
      <Navigate
        to={getDashboardPath(searchParams.get('game') ?? undefined)}
        replace
      />
    );
  }

  const currentPlayerId = getCurrentPlayerTurnId(currentRoom);
  const isYourTurn =
    currentRoom.state === ROOM_STATES.RUNNING &&
    !!currentPlayerId &&
    currentPlayerId === getSocketId();

  const isLimitedCardsRule = !currentRoom.rules[GAME_RULES.UNLIMITED_CARDS];

  return (
    <div className={styles.container}>
      <Header
        centerSlot={<h1 className={styles.roomTitle}>{currentRoom.name}</h1>}
        helpModal={FarmHelpModal}
        additionalActions={
          <Button
            variant={ButtonVariant.SECONDARY}
            className={styles.leaveHeaderButton}
            onClick={onLeaveClick}
          >
            {translation.roomButton.leaveRoom}
          </Button>
        }
      />

      <DiceSection isYourTurn={isYourTurn} />

      {isLimitedCardsRule && <ActiveCardsSection />}

      <PlayersSection />

      <ExchangeSection isYourTurn={isYourTurn} />

      <WinningAnimation />

      <EmoteFloatingContainer />
    </div>
  );
}
