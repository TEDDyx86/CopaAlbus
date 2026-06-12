import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import {
  makeGroupFixtures,
  computeGroupStandings,
  selectQualifiers,
  type GroupMatch,
} from './groupStage';
import type { Group } from './draw';
import type { Player, MatchResult } from '../types';

const P = (id: string, k = 80, f = 80, t = 80): Player => ({ id, name: id, kill: k, farm: f, torre: t });

const four = (a: string, b: string, c: string, d: string): Group => ({
  name: 'A',
  playerIds: [a, b, c, d],
});

const win = (g: string, round: number, w: string, l: string): GroupMatch => ({
  group: g,
  round,
  aId: w,
  bId: l,
  result: { winnerId: w, loserId: l, winType: 'kill', decisiveness: 1, formWinner: 0, formLoser: 0 } as MatchResult,
});

describe('makeGroupFixtures', () => {
  it('gera 6 jogos por grupo em 3 rodadas', () => {
    const groups: Group[] = [four('a', 'b', 'c', 'd')];
    const fixtures = makeGroupFixtures(groups);
    expect(fixtures).toHaveLength(6);
    expect(fixtures.filter((m) => m.round === 1)).toHaveLength(2);
    expect(fixtures.filter((m) => m.round === 2)).toHaveLength(2);
    expect(fixtures.filter((m) => m.round === 3)).toHaveLength(2);
    // cada jogador joga 3 vezes
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(fixtures.filter((m) => m.aId === id || m.bId === id)).toHaveLength(3);
    }
  });
});

describe('computeGroupStandings', () => {
  const byId: Record<string, Player> = {
    a: P('a'), b: P('b'), c: P('c'), d: P('d', 80, 80, 99), // d com overall maior p/ desempate
  };
  const group = four('a', 'b', 'c', 'd');

  it('ordena por pontos (3 por vitória)', () => {
    // a vence todos; b vence c e d; c vence d
    const matches: GroupMatch[] = [
      win('A', 1, 'a', 'b'), win('A', 1, 'c', 'd'),
      win('A', 2, 'a', 'c'), win('A', 2, 'b', 'd'),
      win('A', 3, 'a', 'd'), win('A', 3, 'b', 'c'),
    ];
    const s = computeGroupStandings(group, matches, byId, makeRng(1).next);
    expect(s.map((x) => x.playerId)).toEqual(['a', 'b', 'c', 'd']);
    expect(s[0].points).toBe(9);
    expect(s[0].wins).toBe(3);
  });

  it('desempata por confronto direto quando há empate de pontos', () => {
    // a, b, c ganham 1 de d e há um triângulo a>b, b>c, c>a; d perde tudo.
    const matches: GroupMatch[] = [
      win('A', 1, 'a', 'b'), win('A', 1, 'c', 'd'),
      win('A', 2, 'b', 'c'), win('A', 2, 'a', 'd'),
      win('A', 3, 'c', 'a'), win('A', 3, 'b', 'd'),
    ];
    const s = computeGroupStandings(group, matches, byId, makeRng(1).next);
    // a,b,c têm 6 pts (2V), d tem 0. d deve ser o último.
    expect(s[3].playerId).toBe('d');
    expect(s.slice(0, 3).map((x) => x.points)).toEqual([6, 6, 6]);
  });
});

describe('selectQualifiers', () => {
  it('classifica 1º e 2º de cada grupo + 2 melhores 3ºs = 16', () => {
    const byId: Record<string, Player> = {};
    const standings: Record<string, ReturnType<typeof computeGroupStandings>> = {};
    for (const g of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      standings[g] = [0, 1, 2, 3].map((rank) => {
        const id = `${g}${rank}`;
        byId[id] = P(id, 80, 80, 70 + (g.charCodeAt(0) - 65)); // 3ºs com overall variando p/ desempate
        return { playerId: id, played: 3, wins: 3 - rank, losses: rank, points: (3 - rank) * 3 };
      });
    }
    const q = selectQualifiers(standings, byId, makeRng(1).next);
    expect(q.winners).toHaveLength(7);
    expect(q.runnersUp).toHaveLength(7);
    expect(q.bestThirds).toHaveLength(2);
    expect(q.all).toHaveLength(16);
    expect(new Set(q.all).size).toBe(16);
    // os melhores 3ºs vêm dos grupos de maior overall (G e F neste setup)
    expect(q.bestThirds).toContain('G2');
  });
});
