import { describe, it, expect } from 'vitest';
import { makeRng, shuffle, pickIndexWeighted } from './rng';

describe('makeRng', () => {
  it('é determinístico para a mesma seed', () => {
    const a = makeRng(123);
    const b = makeRng(123);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('retorna valores em [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('state permite retomar a sequência exatamente', () => {
    const r = makeRng(42);
    r.next(); r.next();
    const saved = r.state;
    const expected = [r.next(), r.next()];
    const resumed = makeRng(saved);
    expect([resumed.next(), resumed.next()]).toEqual(expected);
  });
});

describe('shuffle', () => {
  it('mantém os mesmos elementos', () => {
    const r = makeRng(1);
    const out = shuffle([1, 2, 3, 4, 5], r.next);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it('não muta o array original', () => {
    const r = makeRng(1);
    const src = [1, 2, 3];
    shuffle(src, r.next);
    expect(src).toEqual([1, 2, 3]);
  });
});

describe('pickIndexWeighted', () => {
  it('respeita as proporções dos pesos', () => {
    const r = makeRng(99);
    const counts = [0, 0, 0];
    for (let i = 0; i < 30000; i++) counts[pickIndexWeighted([1, 0, 9], r.next)]++;
    expect(counts[1]).toBe(0);                  // peso 0 nunca sai
    expect(counts[2]).toBeGreaterThan(counts[0] * 5); // ~9x mais que o índice 0
  });
});
