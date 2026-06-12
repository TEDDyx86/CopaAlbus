import type { Player, Tier } from '../types';
import { overall } from '../types';
import { players } from '../data/players';
import { pickIndexWeighted, type Rng } from './rng';

export interface TierDef {
  tier: Tier;
  label: string;
  min: number; // overall mínimo (inclusivo)
  max: number; // overall máximo (inclusivo)
  chance: number;
}

export const TIERS: TierDef[] = [
  { tier: 'lendario', label: 'Lendário', min: 95, max: 999, chance: 0.04 },
  { tier: 'epico', label: 'Épico', min: 88, max: 94, chance: 0.16 },
  { tier: 'raro', label: 'Raro', min: 82, max: 87, chance: 0.35 },
  { tier: 'comum', label: 'Comum', min: 0, max: 81, chance: 0.45 },
];

export function tierOf(p: Player): Tier {
  const o = overall(p);
  return TIERS.find((t) => o >= t.min && o <= t.max)!.tier;
}

export interface RollResult {
  fighter: Player;
  tier: Tier;
}

export function roll(rng: Rng, excludeId?: string): RollResult {
  const pool = players.filter((p) => p.id !== excludeId);
  const present = TIERS.filter((t) => pool.some((p) => tierOf(p) === t.tier));
  const chosen = present[pickIndexWeighted(present.map((t) => t.chance), rng)];
  const candidates = pool.filter((p) => tierOf(p) === chosen.tier);
  const fighter = candidates[Math.floor(rng() * candidates.length)];
  return { fighter, tier: chosen.tier };
}
