import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { seedKnockout, pairWinners } from './bracket';

describe('seedKnockout', () => {
  it('gera 8 confrontos com os 16 classificados, sem repetição', () => {
    const ids = Array.from({ length: 16 }, (_, i) => `p${i}`);
    const groupOf: Record<string, string> = {};
    ids.forEach((id, i) => (groupOf[id] = 'ABCDEFG'[i % 7]));
    const r16 = seedKnockout(ids, groupOf, makeRng(3).next);
    expect(r16).toHaveLength(8);
    const all = r16.flatMap((m) => [m.aId, m.bId]);
    expect(new Set(all).size).toBe(16);
  });

  it('evita reencontro de mesmo grupo nas oitavas', () => {
    const ids = Array.from({ length: 16 }, (_, i) => `p${i}`);
    // três jogadores do grupo "A" para forçar o caso
    const groupOf: Record<string, string> = {};
    ids.forEach((id, i) => (groupOf[id] = i < 3 ? 'A' : 'ABCDEFG'[i % 7]));
    for (let seed = 1; seed <= 50; seed++) {
      const r16 = seedKnockout(ids, groupOf, makeRng(seed).next);
      for (const m of r16) expect(groupOf[m.aId!]).not.toBe(groupOf[m.bId!]);
    }
  });
});

describe('pairWinners', () => {
  it('pareia vencedores em sequência', () => {
    expect(pairWinners(['a', 'b', 'c', 'd'])).toEqual([
      { aId: 'a', bId: 'b', result: null },
      { aId: 'c', bId: 'd', result: null },
    ]);
  });
});
