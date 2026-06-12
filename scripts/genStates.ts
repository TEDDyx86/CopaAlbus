// Gera estados de RunState determinísticos para a captura de telas (screenshots).
// Uso: npx vite-node scripts/genStates.ts  → escreve .shots/states.json
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  createRun, keepFighter, playGroupGame, playSeriesGame, advance,
  type RunState, type SeriesKey,
} from '../src/engine/run';

function driveRun(seed: number): RunState {
  let s = keepFighter(createRun(seed));
  while (s.phase !== 'CHAMPION' && s.phase !== 'ELIMINATED') {
    if (s.phase === 'GROUPS') {
      s = s.group.some((g) => !g.result) ? playGroupGame(s) : advance(s);
    } else {
      s = s.knockout[s.phase as SeriesKey]!.decided ? advance(s) : playSeriesGame(s);
    }
  }
  return s;
}

function find(pred: (s: RunState) => boolean): RunState {
  for (let seed = 1; seed < 8000; seed++) {
    const s = driveRun(seed);
    if (pred(s)) return s;
  }
  throw new Error('seed não encontrada');
}

// série em andamento (R16, 1 jogo jogado) — para mostrar o placar ao vivo
function seriesMid(): RunState {
  for (let seed = 1; seed < 8000; seed++) {
    let s = keepFighter(createRun(seed));
    while (s.group.some((g) => !g.result)) s = playGroupGame(s);
    const wins = s.group.filter((g) => g.result!.winnerId === s.fighterId).length;
    if (wins < 2) continue;
    s = advance(s);            // → R16
    s = playSeriesGame(s);     // 1 jogo
    return s;
  }
  throw new Error('seed de série não encontrada');
}

const states = {
  champion: find((s) => s.phase === 'CHAMPION'),
  eliminated: find((s) => s.phase === 'ELIMINATED' && s.eliminatedAt !== 'GROUPS'),
  seriesMid: seriesMid(),
};

mkdirSync('.shots', { recursive: true });
writeFileSync('.shots/states.json', JSON.stringify(states, null, 2));
console.log('estados gerados:', {
  champion: states.champion.fighterId,
  eliminated: `${states.eliminated.fighterId} (${states.eliminated.eliminatedAt})`,
  seriesMid: states.seriesMid.fighterId,
});
