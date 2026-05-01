import { useLanguage } from '../../../hooks/useLanguage';

export interface FarmTradeTranslation {
  buttonLabel: string;
  modalTitle: string;
  youGive: string;
  youReceive: string;
  lock: string;
  confirm: string;
  cancel: string;
  waitingForOpponent: string;
  opponentLocked: string;
  bothLocked: string;
}

export interface FarmTranslation {
  roomLeaveConfirmation: string;
  exchangeAnimalsHeader: string;
  winner: string;
  yourTurn: string;
  gameButton: {
    throwDice: string;
  };
  trade: FarmTradeTranslation;
}

export function useFarmTranslation(): FarmTranslation {
  const { translation } = useLanguage();
  return translation.game.farm as unknown as FarmTranslation;
}
