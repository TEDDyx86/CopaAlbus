import type { MatchResult, Player } from '../types';
import { overall } from '../types';
import type { Group } from './draw';
import type { Rng } from './rng';

export interface GroupMatch {
  group: string;
  round: number; // 1..3
  aId: string;
  bId: string;
  result: MatchResult | null;
}

export interface Standing {
  playerId: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
}

// Pareamentos round-robin de 4 jogadores (índices), método do círculo.
const RR_ROUNDS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[0, 3], [1, 2]],
];

export function makeGroupFixtures(groups: Group[]): GroupMatch[] {
  const out: GroupMatch[] = [];
  for (const g of groups) {
    RR_ROUNDS.forEach((pairs, ri) => {
      for (const [i, j] of pairs) {
        out.push({ group: g.name, round: ri + 1, aId: g.playerIds[i], bId: g.playerIds[j], result: null });
      }
    });
  }
  return out;
}

export function computeGroupStandings(
  group: Group,
  matches: GroupMatch[],
  byId: Record<string, Player>,
  rng: Rng,
): Standing[] {
  const ids = group.playerIds;
  const stats: Record<string, Standing> = {};
  for (const id of ids) stats[id] = { playerId: id, played: 0, wins: 0, losses: 0, points: 0 };

  const played = matches.filter((m) => m.group === group.name && m.result);
  for (const m of played) {
    const r = m.result!;
    stats[r.winnerId].wins++;
    stats[r.winnerId].points += 3;
    stats[r.winnerId].played++;
    stats[r.loserId].losses++;
    stats[r.loserId].played++;
  }

  // chave de desempate aleatória, estável e determinística
  const tb: Record<string, number> = {};
  for (const id of ids) tb[id] = rng();

  // pontos que `x` fez contra `y` no confronto direto
  const h2h = (x: string, y: string): number => {
    let p = 0;
    for (const m of played) {
      const isPair = (m.aId === x && m.bId === y) || (m.aId === y && m.bId === x);
      if (isPair && m.result!.winnerId === x) p += 3;
    }
    return p;
  };

  const sorted = [...ids].sort((x, y) => {
    if (stats[y].points !== stats[x].points) return stats[y].points - stats[x].points;
    const hx = h2h(x, y), hy = h2h(y, x);
    if (hy !== hx) return hy - hx;
    const ox = overall(byId[x]), oy = overall(byId[y]);
    if (oy !== ox) return oy - ox;
    return tb[y] - tb[x];
  });

  return sorted.map((id) => stats[id]);
}

export interface Qualifiers {
  winners: string[];    // 7 (1º de cada grupo)
  runnersUp: string[];  // 7 (2º de cada grupo)
  bestThirds: string[]; // 2 melhores 3ºs
  all: string[];        // 16, na ordem winners → runnersUp → bestThirds
}

export function selectQualifiers(
  standingsByGroup: Record<string, Standing[]>,
  byId: Record<string, Player>,
  rng: Rng,
): Qualifiers {
  const winners: string[] = [];
  const runnersUp: string[] = [];
  const thirds: Standing[] = [];
  for (const name of Object.keys(standingsByGroup)) {
    const s = standingsByGroup[name];
    winners.push(s[0].playerId);
    runnersUp.push(s[1].playerId);
    thirds.push(s[2]);
  }

  const tb: Record<string, number> = {};
  for (const t of thirds) tb[t.playerId] = rng();

  const rankedThirds = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const oa = overall(byId[a.playerId]), ob = overall(byId[b.playerId]);
    if (ob !== oa) return ob - oa;
    return tb[b.playerId] - tb[a.playerId];
  });

  const bestThirds = rankedThirds.slice(0, 2).map((t) => t.playerId);
  return { winners, runnersUp, bestThirds, all: [...winners, ...runnersUp, ...bestThirds] };
}
