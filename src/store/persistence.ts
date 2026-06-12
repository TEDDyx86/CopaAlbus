import type { RunPhase, RunState } from '../engine/run';
import type { Tier } from '../types';

const GAME_KEY = 'copa-albus-nexus:run:v2';
const HALL_KEY = 'copa-albus-nexus:hall:v2';

export interface HallEntry {
  fighter: string;                 // nome do fighter que você levou
  fighterId: string;
  tier: Tier;
  result: 'CHAMPION' | RunPhase;   // CHAMPION ou a fase em que a run terminou
  reached: string;                 // rótulo legível ("Campeão", "Quartas de final"…)
  date: string;                    // ISO
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

export function loadGame(): RunState | null {
  try {
    const g = safeParse<RunState>(localStorage.getItem(GAME_KEY));
    return g && g.version === 2 ? g : null;
  } catch {
    return null;
  }
}

export function saveGame(s: RunState | null): void {
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
