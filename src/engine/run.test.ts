import { describe, it, expect } from 'vitest';
import {
  createRun, reroll, keepFighter, playGroupGame, playSeriesGame, advance,
  reachedLabel, FORMAT_OF, type RunState, type SeriesKey,
} from './run';

const KO: SeriesKey[] = ['R16', 'QF', 'SF', 'FINAL'];

/** Avança um passo: joga o próximo jogo pendente ou transiciona de fase. */
function step(s: RunState): RunState {
  if (s.phase === 'GROUPS') {
    return s.group.some((g) => !g.result) ? playGroupGame(s) : advance(s);
  }
  if (KO.includes(s.phase as SeriesKey)) {
    return s.knockout[s.phase as SeriesKey]!.decided ? advance(s) : playSeriesGame(s);
  }
  return s;
}

function playRun(seed: number): RunState {
  let s = keepFighter(createRun(seed));
  while (s.phase !== 'CHAMPION' && s.phase !== 'ELIMINATED') s = step(s);
  return s;
}

describe('createRun', () => {
  it('começa em ROLL com fighter sorteado e 2 rerolls', () => {
    const s = createRun(1);
    expect(s.phase).toBe('ROLL');
    expect(s.fighterId).toBeTruthy();
    expect(s.rerollsLeft).toBe(2);
  });
});

describe('reroll', () => {
  it('troca o fighter e gasta um reroll', () => {
    const s = createRun(1);
    const r = reroll(s);
    expect(r.fighterId).not.toBe(s.fighterId);
    expect(r.rerollsLeft).toBe(1);
  });
  it('não rerola além de 0', () => {
    let s = createRun(1);
    s = reroll(s); s = reroll(s);
    const stuck = reroll(s);
    expect(stuck.rerollsLeft).toBe(0);
    expect(stuck.fighterId).toBe(s.fighterId);
  });
});

describe('keepFighter', () => {
  it('vai pra GROUPS com 3 adversários distintos, todos ≠ fighter', () => {
    const s = keepFighter(createRun(7));
    expect(s.phase).toBe('GROUPS');
    expect(s.group).toHaveLength(3);
    const opps = s.group.map((g) => g.oppId);
    expect(new Set(opps).size).toBe(3);
    expect(opps).not.toContain(s.fighterId);
    expect(s.group.every((g) => g.result === null)).toBe(true);
  });
});

describe('fase de grupos', () => {
  it('joga um jogo por vez até os 3', () => {
    let s = keepFighter(createRun(7));
    s = playGroupGame(s);
    expect(s.group.filter((g) => g.result).length).toBe(1);
    s = playGroupGame(s); s = playGroupGame(s);
    expect(s.group.every((g) => g.result)).toBe(true);
    // 4º clique não faz nada
    expect(playGroupGame(s).group.filter((g) => g.result).length).toBe(3);
  });

  it('regra de classificação: ≥2 vitórias avança pra R16, senão elimina', () => {
    for (let seed = 1; seed <= 60; seed++) {
      let s = keepFighter(createRun(seed));
      while (s.group.some((g) => !g.result)) s = playGroupGame(s);
      const wins = s.group.filter((g) => g.result!.winnerId === s.fighterId).length;
      const after = advance(s);
      if (wins >= 2) {
        expect(after.phase).toBe('R16');
        expect(after.knockout.R16!.oppId).not.toBe(s.fighterId);
        expect(after.knockout.R16!.target).toBe(2);
      } else {
        expect(after.phase).toBe('ELIMINATED');
        expect(after.eliminatedAt).toBe('GROUPS');
      }
    }
  });
});

describe('séries do mata-mata', () => {
  it('MD3 decide em 2 vitórias e MD5 em 3, com nº de jogos coerente', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const s = playRun(seed);
      for (const key of KO) {
        const ser = s.knockout[key];
        if (!ser) continue;
        expect(ser.decided).toBe(true);
        expect(Math.max(ser.myWins, ser.oppWins)).toBe(FORMAT_OF[key]);
        expect(ser.games.length).toBe(ser.myWins + ser.oppWins);
        expect(ser.games.length).toBeLessThanOrEqual(2 * FORMAT_OF[key] - 1);
      }
    }
  });

  it('vencer a FINAL leva a CHAMPION; perder uma série elimina naquela fase', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const s = playRun(seed);
      expect(['CHAMPION', 'ELIMINATED']).toContain(s.phase);
      if (s.phase === 'CHAMPION') {
        expect(s.knockout.FINAL!.won).toBe(true);
        expect(s.knockout.FINAL!.myWins).toBe(3);
      } else if (s.eliminatedAt && s.eliminatedAt !== 'GROUPS') {
        const ser = s.knockout[s.eliminatedAt as SeriesKey]!;
        expect(ser.won).toBe(false);
        expect(ser.oppWins).toBe(FORMAT_OF[s.eliminatedAt as SeriesKey]);
      }
    }
  });

  it('cada jogo da série é entre o fighter e o adversário da série', () => {
    const s = playRun(7);
    for (const key of KO) {
      const ser = s.knockout[key];
      if (!ser) continue;
      for (const g of ser.games) {
        expect([s.fighterId, ser.oppId]).toContain(g.winnerId);
        expect([s.fighterId, ser.oppId]).toContain(g.loserId);
      }
    }
  });

  it('adversário de cada série nunca é o próprio fighter', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = playRun(seed);
      for (const key of KO) if (s.knockout[key]) expect(s.knockout[key]!.oppId).not.toBe(s.fighterId);
    }
  });
});

describe('reachedLabel', () => {
  const mk = (phase: RunState['phase'], eliminatedAt: RunState['eliminatedAt']) =>
    reachedLabel({ phase, eliminatedAt } as RunState);
  it('rotula até onde a campanha chegou', () => {
    expect(mk('CHAMPION', null)).toBe('Campeão');
    expect(mk('ELIMINATED', 'FINAL')).toBe('Vice-campeão');
    expect(mk('ELIMINATED', 'SF')).toBe('Semifinal');
    expect(mk('ELIMINATED', 'QF')).toBe('Quartas de final');
    expect(mk('ELIMINATED', 'R16')).toBe('Oitavas de final');
    expect(mk('ELIMINATED', 'GROUPS')).toBe('Fase de grupos');
  });
});

describe('determinismo', () => {
  it('mesma seed → mesma campanha', () => {
    const a = playRun(123), b = playRun(123);
    expect(a.fighterId).toBe(b.fighterId);
    expect(a.phase).toBe(b.phase);
    expect(a.eliminatedAt).toBe(b.eliminatedAt);
    expect(JSON.stringify(a.knockout)).toBe(JSON.stringify(b.knockout));
  });
  it('seeds diferentes produzem campanhas variadas', () => {
    const outcomes = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const s = playRun(seed);
      outcomes.add(`${s.fighterId}:${s.phase}:${s.eliminatedAt}`);
    }
    expect(outcomes.size).toBeGreaterThan(1);
  });
});
