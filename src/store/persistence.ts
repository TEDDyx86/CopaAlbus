import type { GameState } from '../engine/tournament';
import type { Tier } from '../types';

const GAME_KEY = 'copa-albus-nexus:game:v1';
const HALL_KEY = 'copa-albus-nexus:hall:v1';

export interface HallEntry {
  champion: string;   // nome
  fighterId: string;  // fighter que o jogador levou
  tier: Tier;
  date: string;       // ISO
  seed: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadGame(): GameState | null {
  try {
    const g = safeParse<GameState>(localStorage.getItem(GAME_KEY));
    return g && g.version === 1 ? g : null;
  } catch {
    return null;
  }
}

export function saveGame(s: GameState | null): void {
  try {
    if (s) localStorage.setItem(GAME_KEY, JSON.stringify(s));
    else localStorage.removeItem(GAME_KEY);
  } catch {
    /* localStorage indisponível — segue sem persistir */
  }
}

export function loadHall(): HallEntry[] {
  try {
    return safeParse<HallEntry[]>(localStorage.getItem(HALL_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveHall(h: HallEntry[]): void {
  try {
    localStorage.setItem(HALL_KEY, JSON.stringify(h));
  } catch {
    /* idem */
  }
}
