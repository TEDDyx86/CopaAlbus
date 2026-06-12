import type { Tier } from '../types';
import { players, byId } from '../data/players';
import { makeRng, randomSeed } from './rng';
import { roll } from './fighterRoll';
import { simMatch } from './simMatch';
import { drawGroups, type Group } from './draw';
import {
  makeGroupFixtures, computeGroupStandings, selectQualifiers,
  type GroupMatch, type Standing,
} from './groupStage';
import { seedKnockout, pairWinners, type KnockoutMatch } from './bracket';

export type Phase =
  | 'ROLL_FIGHTER' | 'DRAW' | 'GROUP_STAGE'
  | 'R16' | 'QF' | 'SF' | 'BRONZE' | 'FINAL' | 'CHAMPION';

export type KnockoutKey = 'R16' | 'QF' | 'SF' | 'BRONZE' | 'FINAL';

export interface GameState {
  version: 1;
  phase: Phase;
  seed: number;
  rngState: number;
  fighterId: string;
  fighterTier: Tier;
  rerollsLeft: number;
  groups: Group[] | null;
  groupMatches: GroupMatch[] | null;
  groupRoundsPlayed: number; // 0..3
  standings: Record<string, Standing[]> | null;
  knockout: Partial<Record<KnockoutKey, KnockoutMatch[]>>;
  championId: string | null;
  bronzeId: string | null;
}

export function createGame(seed: number = randomSeed()): GameState {
  const rng = makeRng(seed);
  const first = roll(rng.next);
  return {
    version: 1,
    phase: 'ROLL_FIGHTER',
    seed,
    rngState: rng.state,
    fighterId: first.fighter.id,
    fighterTier: first.tier,
    rerollsLeft: 2,
    groups: null,
    groupMatches: null,
    groupRoundsPlayed: 0,
    standings: null,
    knockout: {},
    championId: null,
    bronzeId: null,
  };
}

export function reroll(s: GameState): GameState {
  if (s.phase !== 'ROLL_FIGHTER' || s.rerollsLeft <= 0) return s;
  const rng = makeRng(s.rngState);
  const r = roll(rng.next, s.fighterId);
  return { ...s, fighterId: r.fighter.id, fighterTier: r.tier, rerollsLeft: s.rerollsLeft - 1, rngState: rng.state };
}

export function keepFighter(s: GameState): GameState {
  if (s.phase !== 'ROLL_FIGHTER') return s;
  const rng = makeRng(s.rngState);
  const groups = drawGroups(players.map((p) => p.id), rng.next);
  const groupMatches = makeGroupFixtures(groups);
  return { ...s, phase: 'DRAW', groups, groupMatches, rngState: rng.state };
}

export function confirmDraw(s: GameState): GameState {
  if (s.phase !== 'DRAW') return s;
  return { ...s, phase: 'GROUP_STAGE' };
}

export function playGroupRound(s: GameState): GameState {
  if (s.phase !== 'GROUP_STAGE' || !s.groupMatches || s.groupRoundsPlayed >= 3) return s;
  const rng = makeRng(s.rngState);
  const round = s.groupRoundsPlayed + 1;
  const groupMatches = s.groupMatches.map((m) =>
    m.round === round && !m.result ? { ...m, result: simMatch(byId[m.aId], byId[m.bId], rng.next) } : m,
  );
  let next: GameState = { ...s, groupMatches, groupRoundsPlayed: round, rngState: rng.state };
  if (round === 3) next = finishGroupStage(next);
  return next;
}

function finishGroupStage(s: GameState): GameState {
  const rng = makeRng(s.rngState);
  const standings: Record<string, Standing[]> = {};
  for (const g of s.groups!) {
    standings[g.name] = computeGroupStandings(g, s.groupMatches!, byId, rng.next);
  }
  const quals = selectQualifiers(standings, byId, rng.next);
  const groupOf: Record<string, string> = {};
  for (const g of s.groups!) for (const id of g.playerIds) groupOf[id] = g.name;
  const r16 = seedKnockout(quals.all, groupOf, rng.next);
  return { ...s, standings, knockout: { R16: r16 }, phase: 'R16', rngState: rng.state };
}

const NEXT_OF: Record<KnockoutKey, Phase> = {
  R16: 'QF', QF: 'SF', SF: 'BRONZE', BRONZE: 'FINAL', FINAL: 'CHAMPION',
};

export function playKnockoutRound(s: GameState): GameState {
  const key = s.phase as KnockoutKey;
  const round = s.knockout[key];
  if (!round) return s;
  const rng = makeRng(s.rngState);
  const played = round.map((m) =>
    m.result ? m : { ...m, result: simMatch(byId[m.aId!], byId[m.bId!], rng.next) },
  );
  const winners = played.map((m) => m.result!.winnerId);
  const losers = played.map((m) => m.result!.loserId);
  const knockout: GameState['knockout'] = { ...s.knockout, [key]: played };
  let next: GameState = { ...s, knockout, rngState: rng.state };

  if (key === 'SF') {
    knockout.FINAL = pairWinners(winners);
    knockout.BRONZE = [{ aId: losers[0], bId: losers[1], result: null }];
    next = { ...next, knockout, phase: 'BRONZE' };
  } else if (key === 'BRONZE') {
    next = { ...next, bronzeId: winners[0], phase: 'FINAL' };
  } else if (key === 'FINAL') {
    next = { ...next, championId: winners[0], phase: 'CHAMPION' };
  } else {
    knockout[NEXT_OF[key] as KnockoutKey] = pairWinners(winners);
    next = { ...next, knockout, phase: NEXT_OF[key] };
  }
  return next;
}
