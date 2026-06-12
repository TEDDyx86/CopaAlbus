import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { byId } from '../data/players';
import {
  createRun, reroll as rerollFn, keepFighter,
  playGroupGame as playGroupGameFn, playSeriesGame as playSeriesGameFn, advance as advanceFn,
  reachedLabel, type RunState,
} from '../engine/run';
import { loadGame, saveGame, loadHall, saveHall, type HallEntry } from './persistence';

interface GameCtx {
  game: RunState | null;
  hall: HallEntry[];
  newGame(): void;
  reroll(): void;
  keep(): void;
  playGroupGame(): void;
  playSeriesGame(): void;
  advance(): void;
  goHome(): void;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<RunState | null>(() => loadGame());
  const [hall, setHall] = useState<HallEntry[]>(() => loadHall());
  const recordedSeed = useRef<number | null>(null);

  useEffect(() => { saveGame(game); }, [game]);
  useEffect(() => { saveHall(hall); }, [hall]);

  // Registra a campanha encerrada (campeão ou eliminado) uma única vez por seed.
  useEffect(() => {
    if (!game || (game.phase !== 'CHAMPION' && game.phase !== 'ELIMINATED')) return;
    if (recordedSeed.current === game.seed) return;
    recordedSeed.current = game.seed;
    const snapshot = game;
    setHall((h) => {
      if (h.some((e) => e.seed === snapshot.seed)) return h;
      const entry: HallEntry = {
        fighter: byId[snapshot.fighterId].name,
        fighterId: snapshot.fighterId,
        tier: snapshot.fighterTier,
        result: snapshot.phase === 'CHAMPION' ? 'CHAMPION' : snapshot.phase,
        reached: reachedLabel(snapshot),
        date: new Date().toISOString(),
        seed: snapshot.seed,
      };
      return [entry, ...h];
    });
  }, [game?.phase, game?.seed, game?.fighterId, game?.fighterTier, game?.eliminatedAt]);

  const api = useMemo<GameCtx>(() => ({
    game,
    hall,
    newGame: () => { recordedSeed.current = null; setGame(createRun()); },
    reroll: () => setGame((g) => (g ? rerollFn(g) : g)),
    keep: () => setGame((g) => (g ? keepFighter(g) : g)),
    playGroupGame: () => setGame((g) => (g ? playGroupGameFn(g) : g)),
    playSeriesGame: () => setGame((g) => (g ? playSeriesGameFn(g) : g)),
    advance: () => setGame((g) => (g ? advanceFn(g) : g)),
    goHome: () => setGame(null),
  }), [game, hall]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useGame(): GameCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}
