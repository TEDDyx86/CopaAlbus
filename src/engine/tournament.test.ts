import { describe, it, expect } from 'vitest';
import {
  createGame, reroll, keepFighter, confirmDraw,
  playGroupRound, playKnockoutRound, type GameState,
} from './tournament';

function playToEnd(seed: number): GameState {
  let g = createGame(seed);
  g = keepFighter(g);
  g = confirmDraw(g);
  while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
  while (g.phase !== 'CHAMPION') g = playKnockoutRound(g);
  return g;
}

describe('createGame', () => {
  it('começa em ROLL_FIGHTER com fighter sorteado e 2 rerolls', () => {
    const g = createGame(1);
    expect(g.phase).toBe('ROLL_FIGHTER');
    expect(g.fighterId).toBeTruthy();
    expect(g.rerollsLeft).toBe(2);
  });
});

describe('reroll', () => {
  it('troca o fighter por outro e gasta um reroll', () => {
    const g = createGame(1);
    const r = reroll(g);
    expect(r.fighterId).not.toBe(g.fighterId);
    expect(r.rerollsLeft).toBe(1);
  });
  it('não rerola além de 0', () => {
    let g = createGame(1);
    g = reroll(g); g = reroll(g);
    const stuck = reroll(g);
    expect(stuck.rerollsLeft).toBe(0);
    expect(stuck.fighterId).toBe(g.fighterId);
  });
});

describe('fluxo completo', () => {
  it('chega a CHAMPION com campeão e 3º lugar definidos', () => {
    const g = playToEnd(2026);
    expect(g.phase).toBe('CHAMPION');
    expect(g.championId).toBeTruthy();
    expect(g.bronzeId).toBeTruthy();
    expect(g.championId).not.toBe(g.bronzeId);
  });

  it('passa por todas as fases do mata-mata', () => {
    let g = createGame(9);
    g = confirmDraw(keepFighter(g));
    while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
    const fases: string[] = [];
    while (g.phase !== 'CHAMPION') {
      fases.push(g.phase);
      g = playKnockoutRound(g);
    }
    expect(fases).toEqual(['R16', 'QF', 'SF', 'BRONZE', 'FINAL']);
  });

  it('é determinístico: mesma seed → mesmo campeão', () => {
    expect(playToEnd(123).championId).toBe(playToEnd(123).championId);
    expect(playToEnd(123).championId).not.toBe(playToEnd(124).championId);
  });

  it('a fase de grupos gera 42 resultados e 16 classificados', () => {
    let g = createGame(5);
    g = confirmDraw(keepFighter(g));
    while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
    expect(g.groupMatches!.every((m) => m.result)).toBe(true);
    expect(g.groupMatches!).toHaveLength(42);
    expect(g.knockout.R16!.flatMap((m) => [m.aId, m.bId])).toHaveLength(16);
  });
});
