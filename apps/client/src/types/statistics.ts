export interface MatchResult {
  winner: boolean;
  players: number;
  autoWin?: boolean;
  durationMs?: number;
}

export interface MatchRecord extends MatchResult {
  id: string;
  timestamp: number;
}

export interface StatisticsStorage {
  version: 1;
  games: Record<string, MatchRecord[]>;
}
