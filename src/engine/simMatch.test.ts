import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { simMatch } from './simMatch';
import type { Player } from '../types';

const P = (id: string, kill: number, farm: number, torre: number): Player => ({ id, name: id, kill, farm, torre });

describe('simMatch', () => {
  it('vencedor e perdedor são sempre os dois participantes', () => {
    const r = makeRng(1);
    const a = P('a', 80, 80, 80), b = P('b', 70, 70, 70);
    for (let i = 0; i < 1000; i++) {
      const res = simMatch(a, b, r.next);
      expect([a.id, b.id]).toContain(res.winnerId);
      expect([a.id, b.id]).toContain(res.loserId);
      expect(res.winnerId).not.toBe(res.loserId);
    }
  });

  it('favorito forte em tudo vence a grande maioria', () => {
    const r = makeRng(10);
    const forte = P('forte', 95, 95, 95), fraco = P('fraco', 70, 70, 70);
    let wins = 0;
    for (let i = 0; i < 5000; i++) if (simMatch(forte, fraco, r.next).winnerId === 'forte') wins++;
    expect(wins / 5000).toBeGreaterThan(0.9);
  });

  it('a partida tende à frente onde alguém é forte', () => {
    const r = makeRng(20);
    // ambos fortes só em farm, fracos em kill/torre
    const a = P('a', 50, 95, 50), b = P('b', 50, 90, 50);
    const counts: Record<string, number> = { kill: 0, farm: 0, torre: 0 };
    for (let i = 0; i < 5000; i++) counts[simMatch(a, b, r.next).winType]++;
    expect(counts.farm).toBeGreaterThan(counts.kill + counts.torre);
  });

  it('especialista cria zebra na sua frente, mas apanha fora dela', () => {
    const r = makeRng(30);
    // azarão só forte em farm; favorito generalista mais alto, mas farm modesto
    const azarao = P('azarao', 52, 80, 52);
    const favorito = P('favorito', 86, 70, 86); // overall maior, farm pior
    let zebrasNoFarm = 0, jogosNoFarm = 0;
    for (let i = 0; i < 8000; i++) {
      const res = simMatch(azarao, favorito, r.next);
      if (res.winType === 'farm') {
        jogosNoFarm++;
        if (res.winnerId === 'azarao') zebrasNoFarm++;
      }
    }
    // quando cai no farm, o azarão (farm 80 vs 70) vence com frequência perceptível
    expect(jogosNoFarm).toBeGreaterThan(0);
    expect(zebrasNoFarm / jogosNoFarm).toBeGreaterThan(0.4);
  });

  it('é determinístico para a mesma seed', () => {
    const a = P('a', 88, 81, 80), b = P('b', 80, 86, 80);
    const r1 = makeRng(555), r2 = makeRng(555);
    expect(simMatch(a, b, r1.next)).toEqual(simMatch(a, b, r2.next));
  });
});
