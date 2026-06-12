import { describe, it, expect } from 'vitest';
import { players, byId } from './players';
import { overall } from '../types';

describe('players', () => {
  it('tem 28 jogadores', () => {
    expect(players).toHaveLength(28);
  });

  it('ids são únicos e não vazios', () => {
    const ids = new Set(players.map((p) => p.id));
    expect(ids.size).toBe(28);
    expect(players.every((p) => p.id.length > 0)).toBe(true);
  });

  it('byId resolve todo jogador', () => {
    for (const p of players) expect(byId[p.id]).toBe(p);
  });

  it('overall = média arredondada dos três atributos', () => {
    expect(overall({ id: 'x', name: 'X', kill: 99, farm: 99, torre: 99 })).toBe(99);
    expect(overall({ id: 'y', name: 'Y', kill: 52, farm: 76, torre: 52 })).toBe(60);
  });

  it('Boelitz é 99/99/99 e Tuco 52/76/52', () => {
    expect(byId['boelitz']).toMatchObject({ kill: 99, farm: 99, torre: 99 });
    expect(byId['tuco']).toMatchObject({ kill: 52, farm: 76, torre: 52 });
  });
});
