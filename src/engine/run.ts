import type { MatchResult, Tier } from '../types';
import { players, byId } from '../data/players';
import { makeRng, randomSeed, type Rng } from './rng';
import { roll } from './fighterRoll';
import { simMatch } from './simMatch';

export type RunPhase =
  | 'ROLL' | 'GROUPS' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'CHAMPION' | 'ELIMINATED';

export type SeriesKey = 'R16' | 'QF' | 'SF' | 'FINAL';

/** Vitórias necessárias por fase: MD3 = 2, MD5 = 3. */
export const FORMAT_OF: Record<SeriesKey, number> = { R16: 2, QF: 2, SF: 2, FINAL: 3 };

const KO_ORDER: SeriesKey[] = ['R16', 'QF', 'SF', 'FINAL'];
const GROUP_GAMES = 3;
const GROUP_WINS_TO_ADVANCE = 2;

export interface GroupGame {
  oppId: string;
  result: MatchResult | null;
}

export interface Series {
  oppId: string;
  target: number;          // vitórias necessárias (2 = MD3, 3 = MD5)
  games: MatchResult[];
  myWins: number;
  oppWins: number;
  decided: boolean;
  won: boolean | null;     // do ponto de vista do fighter
}

export interface RunState {
  version: 2;
  phase: RunPhase;
  seed: number;
  rngState: number;
  fighterId: string;
  fighterTier: Tier;
  rerollsLeft: number;
  group: GroupGame[];
  knockout: Partial<Record<SeriesKey, Series>>;
  eliminatedAt: RunPhase | null;
}

/** Título legível de cada fase (broadcast). */
export const PHASE_TITLE: Record<RunPhase, string> = {
  ROLL: 'Sorteio do fighter',
  GROUPS: 'Fase de grupos',
  R16: 'Oitavas de final',
  QF: 'Quartas de final',
  SF: 'Semifinal',
  FINAL: 'Final',
  CHAMPION: 'Campeão',
  ELIMINATED: 'Eliminado',
};

/** Até onde a campanha chegou (para Hall da Fama e telas finais). */
export function reachedLabel(s: RunState): string {
  if (s.phase === 'CHAMPION') return 'Campeão';
  switch (s.eliminatedAt) {
    case 'FINAL': return 'Vice-campeão';
    case 'SF': return 'Semifinal';
    case 'QF': return 'Quartas de final';
    case 'R16': return 'Oitavas de final';
    default: return 'Fase de grupos';
  }
}

/** Sorteio uniforme de um adversário entre os jogadores fora de `exclude`. */
function pickOpponent(rng: Rng, exclude: string[]): string {
  const pool = players.filter((p) => !exclude.includes(p.id));
  return pool[Math.floor(rng() * pool.length)].id;
}

function startSeries(rng: Rng, fighterId: string, key: SeriesKey): Series {
  return {
    oppId: pickOpponent(rng, [fighterId]),
    target: FORMAT_OF[key],
    games: [],
    myWins: 0,
    oppWins: 0,
    decided: false,
    won: null,
  };
}

export function createRun(seed: number = randomSeed()): RunState {
  const rng = makeRng(seed);
  const first = roll(rng.next);
  return {
    version: 2,
    phase: 'ROLL',
    seed,
    rngState: rng.state,
    fighterId: first.fighter.id,
    fighterTier: first.tier,
    rerollsLeft: 2,
    group: [],
    knockout: {},
    eliminatedAt: null,
  };
}

export function reroll(s: RunState): RunState {
  if (s.phase !== 'ROLL' || s.rerollsLeft <= 0) return s;
  const rng = makeRng(s.rngState);
  const r = roll(rng.next, s.fighterId);
  return { ...s, fighterId: r.fighter.id, fighterTier: r.tier, rerollsLeft: s.rerollsLeft - 1, rngState: rng.state };
}

export function keepFighter(s: RunState): RunState {
  if (s.phase !== 'ROLL') return s;
  const rng = makeRng(s.rngState);
  const opps: string[] = [];
  for (let i = 0; i < GROUP_GAMES; i++) opps.push(pickOpponent(rng.next, [s.fighterId, ...opps]));
  const group: GroupGame[] = opps.map((oppId) => ({ oppId, result: null }));
  return { ...s, phase: 'GROUPS', group, rngState: rng.state };
}

export function playGroupGame(s: RunState): RunState {
  if (s.phase !== 'GROUPS') return s;
  const idx = s.group.findIndex((g) => !g.result);
  if (idx < 0) return s;
  const rng = makeRng(s.rngState);
  const g = s.group[idx];
  const result = simMatch(byId[s.fighterId], byId[g.oppId], rng.next);
  const group = s.group.map((x, i) => (i === idx ? { ...x, result } : x));
  return { ...s, group, rngState: rng.state };
}

export function playSeriesGame(s: RunState): RunState {
  const key = s.phase as SeriesKey;
  const ser = s.knockout[key];
  if (!ser || ser.decided) return s;
  const rng = makeRng(s.rngState);
  const result = simMatch(byId[s.fighterId], byId[ser.oppId], rng.next);
  const iWon = result.winnerId === s.fighterId;
  const myWins = ser.myWins + (iWon ? 1 : 0);
  const oppWins = ser.oppWins + (iWon ? 0 : 1);
  const decided = myWins >= ser.target || oppWins >= ser.target;
  const next: Series = {
    ...ser,
    games: [...ser.games, result],
    myWins,
    oppWins,
    decided,
    won: decided ? myWins >= ser.target : null,
  };
  return { ...s, knockout: { ...s.knockout, [key]: next }, rngState: rng.state };
}

/** Transiciona de fase quando os grupos terminaram ou a série atual foi decidida. */
export function advance(s: RunState): RunState {
  if (s.phase === 'GROUPS') {
    if (s.group.some((g) => !g.result)) return s;
    const wins = s.group.filter((g) => g.result!.winnerId === s.fighterId).length;
    if (wins < GROUP_WINS_TO_ADVANCE) return { ...s, phase: 'ELIMINATED', eliminatedAt: 'GROUPS' };
    const rng = makeRng(s.rngState);
    const series = startSeries(rng.next, s.fighterId, 'R16');
    return { ...s, phase: 'R16', knockout: { ...s.knockout, R16: series }, rngState: rng.state };
  }

  const key = s.phase as SeriesKey;
  const ser = s.knockout[key];
  if (!ser || !ser.decided) return s;
  if (!ser.won) return { ...s, phase: 'ELIMINATED', eliminatedAt: key };

  const nextKey = KO_ORDER[KO_ORDER.indexOf(key) + 1];
  if (!nextKey) return { ...s, phase: 'CHAMPION' };
  const rng = makeRng(s.rngState);
  const series = startSeries(rng.next, s.fighterId, nextKey);
  return { ...s, phase: nextKey, knockout: { ...s.knockout, [nextKey]: series }, rngState: rng.state };
}
