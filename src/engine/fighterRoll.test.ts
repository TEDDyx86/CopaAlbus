import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { roll, tierOf, TIERS } from './fighterRoll';
import { byId } from '../data/players';

describe('tierOf', () => {
  it('classifica pelos limites de overall', () => {
    expect(tierOf(byId['boelitz'])).toBe('lendario'); // 99
    expect(tierOf(byId['jon'])).toBe('epico');        // 91
    expect(tierOf(byId['teddy'])).toBe('raro');       // 87
    expect(tierOf(byId['tuco'])).toBe('comum');       // 60
  });
});

describe('roll', () => {
  it('frequência por tier aproxima as chances definidas', () => {
    const r = makeRng(2026);
    const counts: Record<string, number> = { lendario: 0, epico: 0, raro: 0, comum: 0 };
    const N = 40000;
    for (let i = 0; i < N; i++) counts[roll(r.next).tier]++;
    for (const t of TIERS) {
      expect(counts[t.tier] / N).toBeCloseTo(t.chance, 1); // tolerância ~0.05
    }
  });

  it('craque (lendário) cai bem menos que comum', () => {
    const r = makeRng(5);
    let lend = 0, comum = 0;
    for (let i = 0; i < 20000; i++) {
      const t = roll(r.next).tier;
      if (t === 'lendario') lend++;
      if (t === 'comum') comum++;
    }
    expect(comum).toBeGreaterThan(lend * 5);
  });

  it('reroll com excludeId nunca devolve o fighter atual', () => {
    const r = makeRng(77);
    for (let i = 0; i < 5000; i++) {
      expect(roll(r.next, 'boelitz').fighter.id).not.toBe('boelitz');
    }
  });
});
