import { useLanguage } from '../../../hooks/useLanguage';

export interface FarmTranslation {
  roomLeaveConfirmation: string;
  exchangeAnimalsHeader: string;
  winner: string;
  yourTurn: string;
  gameButton: {
    throwDice: string;
  };
}

export function useFarmTranslation(): FarmTranslation {
  const { translation } = useLanguage();
  return translation.game.farm as unknown as FarmTranslation;
}
