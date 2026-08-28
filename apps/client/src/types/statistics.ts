export interface MatchResult {
  winner: boolean;
  players: number;
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
