import type { MatchResult } from '../types';
import { shuffle, type Rng } from './rng';

export interface KnockoutMatch {
  aId: string | null;
  bId: string | null;
  result: MatchResult | null;
}

export function seedKnockout(
  qualifierIds: string[],
  groupOf: Record<string, string>,
  rng: Rng,
): KnockoutMatch[] {
  const order = repairSameGroup(shuffle(qualifierIds, rng), groupOf);
  const matches: KnockoutMatch[] = [];
  for (let i = 0; i < order.length; i += 2) {
    matches.push({ aId: order[i], bId: order[i + 1], result: null });
  }
  return matches;
}

/** Desfaz confrontos de mesmo grupo trocando um dos jogadores com outro par. */
function repairSameGroup(order: string[], groupOf: Record<string, string>): string[] {
  const a = order.slice();
  for (let i = 0; i < a.length; i += 2) {
    if (groupOf[a[i]] !== groupOf[a[i + 1]]) continue;
    for (let j = 0; j < a.length; j++) {
      if (j === i || j === i + 1) continue;
      const partnerJ = j % 2 === 0 ? a[j + 1] : a[j - 1];
      const newPairIok = groupOf[a[i]] !== groupOf[a[j]];
      const newPairJok = groupOf[partnerJ] !== groupOf[a[i + 1]];
      if (newPairIok && newPairJok) {
        [a[i + 1], a[j]] = [a[j], a[i + 1]];
        break;
      }
    }
  }
  return a;
}

export function pairWinners(winnerIds: string[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  for (let i = 0; i < winnerIds.length; i += 2) {
    matches.push({ aId: winnerIds[i], bId: winnerIds[i + 1], result: null });
  }
  return matches;
}
