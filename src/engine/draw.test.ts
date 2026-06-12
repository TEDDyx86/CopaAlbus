import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { drawGroups, GROUP_NAMES } from './draw';
import { players } from '../data/players';

const ids = () => players.map((p) => p.id);

describe('drawGroups', () => {
  it('produz 7 grupos de 4 com os 28 ids, sem repetição', () => {
    const groups = drawGroups(ids(), makeRng(1).next);
    expect(groups).toHaveLength(7);
    expect(groups.map((g) => g.name)).toEqual([...GROUP_NAMES]);
    const all = groups.flatMap((g) => g.playerIds);
    expect(all).toHaveLength(28);
    expect(new Set(all).size).toBe(28);
    expect(groups.every((g) => g.playerIds.length === 4)).toBe(true);
  });

  it('seeds diferentes geram distribuições diferentes', () => {
    const a = drawGroups(ids(), makeRng(1).next);
    const b = drawGroups(ids(), makeRng(2).next);
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it('rejeita quando não há exatamente 28 jogadores', () => {
    expect(() => drawGroups(['a', 'b'], makeRng(1).next)).toThrow();
  });
});
