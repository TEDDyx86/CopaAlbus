export type WinType = 'kill' | 'farm' | 'torre';
export type Tier = 'lendario' | 'epico' | 'raro' | 'comum';

export interface Player {
  id: string;
  name: string;
  kill: number;
  farm: number;
  torre: number;
}

export interface MatchResult {
  winnerId: string;
  loserId: string;
  winType: WinType;
  decisiveness: number;
  formWinner: number;
  formLoser: number;
}

export function overall(p: Player): number {
  return Math.round((p.kill + p.farm + p.torre) / 3);
}
