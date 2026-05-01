import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';

import { ANIMALS, FARM_EVENTS } from '@game/shared/constants/farm';
import type {
  FarmAnimals,
  Room as FarmRoom,
  Player,
  TradeOffer,
} from '@game/shared/types/farm';

import { useLanguage } from '../../../hooks/useLanguage';
import { useRoom } from '../../../hooks/useRoom';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { emitEvent, getSocketId } from '../../../socket/client';
import { resolveErrorMessage } from '../../../utils/language';
import { ANIMALS_ICONS_CONFIG } from '../constants';
import { useFarmTranslation } from '../hooks/useFarmTranslation';

import styles from './TradeModal.module.css';

const TRADE_ANIMALS: FarmAnimals[] = [
  ANIMALS.DUCK,
  ANIMALS.GOAT,
  ANIMALS.PIG,
  ANIMALS.HORSE,
  ANIMALS.COW,
];

export default function TradeModal(): ReactElement {
  const { currentRoom } = useRoom();
  const room = currentRoom as unknown as FarmRoom;
  const farmT = useFarmTranslation();
  const { showSnackbar } = useSnackbar();
  const { translation } = useLanguage();
  const myId = getSocketId();

  const trade = room?.trade;
  const isParticipant =
    trade && (trade.initiatorId === myId || trade.targetId === myId);

  const opponentId =
    trade && myId === trade.initiatorId ? trade.targetId : trade?.initiatorId;
  const opponent = room?.players.find((p: Player) => p.id === opponentId);
  const me = room?.players.find((p: Player) => p.id === myId);

  const [myOffer, setMyOffer] = useState<TradeOffer>({});
  const pendingUpdate = useRef(false);

  const myLocked = !!(trade?.locked && myId && trade.locked[myId]);
  const opponentLocked = !!(trade?.locked && opponentId && trade.locked[opponentId]);
  const bothLocked = myLocked && opponentLocked;

  const opponentOffer =
    trade?.offers && opponentId ? trade.offers[opponentId] : undefined;

  // Sync local offer from server state when locks reset
  useEffect(() => {
    if (!trade?.offers || !myId) return;
    const serverOffer = trade.offers[myId];
    if (serverOffer && !pendingUpdate.current) {
      setMyOffer(serverOffer);
    }
    pendingUpdate.current = false;
  }, [trade?.offers, myId]);

  const emitUpdate = useCallback(
    (offer: TradeOffer): void => {
      if (!room || !isParticipant) return;
      pendingUpdate.current = true;
      emitEvent(FARM_EVENTS.GAME_TRADE_UPDATE, { roomId: room.id, offer }, ack => {
        if (ack && !ack.ok) {
          pendingUpdate.current = false;
          showSnackbar(resolveErrorMessage(ack.error, translation));
        }
      });
    },
    [room, isParticipant, showSnackbar, translation]
  );

  function handleIncrement(animal: FarmAnimals): void {
    if (!me) return;
    const current = myOffer[animal] || 0;
    if (current >= me.animals[animal]) return;
    const next = { ...myOffer, [animal]: current + 1 };
    setMyOffer(next);
    emitUpdate(next);
  }

  function handleDecrement(animal: FarmAnimals): void {
    const current = myOffer[animal] || 0;
    if (current <= 0) return;
    const next = { ...myOffer, [animal]: current - 1 };
    setMyOffer(next);
    emitUpdate(next);
  }

  function handleLock(): void {
    if (!room || !isParticipant) return;
    emitEvent(FARM_EVENTS.GAME_TRADE_LOCK, { roomId: room.id }, ack => {
      if (ack && !ack.ok) {
        showSnackbar(resolveErrorMessage(ack.error, translation));
      }
    });
  }

  function handleConfirm(): void {
    if (!room || !isParticipant) return;
    emitEvent(FARM_EVENTS.GAME_TRADE_CONFIRM, { roomId: room.id }, ack => {
      if (ack && !ack.ok) {
        showSnackbar(resolveErrorMessage(ack.error, translation));
      }
    });
  }

  function handleCancel(): void {
    if (!room) return;
    emitEvent(FARM_EVENTS.GAME_TRADE_CANCEL, { roomId: room.id }, ack => {
      if (ack && !ack.ok) {
        showSnackbar(resolveErrorMessage(ack.error, translation));
      }
    });
  }

  if (!trade || !isParticipant || !me) {
    return <div className={styles.container}>{null}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {farmT.trade.modalTitle} {opponent?.name ?? ''}
      </div>

      {/* Your offer (what you give) */}
      <div className={`${styles.section} ${myLocked ? styles.sectionLocked : ''}`}>
        <div className={styles.sectionLabel}>
          {farmT.trade.youGive}
          {myLocked && <span className={styles.lockIcon}> 🔒</span>}
        </div>
        <div className={styles.animalsRow}>
          {TRADE_ANIMALS.map(animal => {
            const count = myOffer[animal] || 0;
            const max = me.animals[animal] || 0;
            return (
              <div key={animal} className={styles.animalControl}>
                <div className={styles.animalIcon}>
                  {ANIMALS_ICONS_CONFIG[animal].icon}
                </div>
                <div className={styles.counterRow}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    disabled={count <= 0 || myLocked}
                    onClick={() => handleDecrement(animal)}
                  >
                    −
                  </button>
                  <span className={styles.counterValue}>{count}</span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    disabled={count >= max || myLocked}
                    onClick={() => handleIncrement(animal)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What you receive (opponent's offer) */}
      <div className={`${styles.section} ${opponentLocked ? styles.sectionLocked : ''}`}>
        <div className={styles.sectionLabel}>
          {farmT.trade.youReceive}
          {opponentLocked && <span className={styles.lockIcon}> 🔒</span>}
        </div>
        <div className={styles.animalsRow}>
          {TRADE_ANIMALS.map(animal => {
            const count = opponentOffer?.[animal] || 0;
            return (
              <div key={animal} className={styles.animalControl}>
                <div className={styles.animalIcon}>
                  {ANIMALS_ICONS_CONFIG[animal].icon}
                </div>
                <span className={styles.counterValue}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className={styles.status}>
        {myLocked && !opponentLocked && farmT.trade.waitingForOpponent}
        {!myLocked && opponentLocked && (
          <span className={styles.statusConfirmed}>
            {farmT.trade.opponentLocked}
          </span>
        )}
        {bothLocked && (
          <span className={styles.statusConfirmed}>
            {farmT.trade.bothLocked}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancel}
        >
          {farmT.trade.cancel}
        </button>

        {!myLocked && (
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleLock}
          >
            {farmT.trade.lock}
          </button>
        )}

        {bothLocked && (
          <button
            type="button"
            className={styles.exchangeBtn}
            onClick={handleConfirm}
          >
            {farmT.trade.confirm}
          </button>
        )}
      </div>
    </div>
  );
}
