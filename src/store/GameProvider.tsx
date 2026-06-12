import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { byId } from '../data/players';
import {
  createGame, reroll as rerollFn, keepFighter, confirmDraw,
  playGroupRound, playKnockoutRound, type GameState,
} from '../engine/tournament';
import { loadGame, saveGame, loadHall, saveHall, type HallEntry } from './persistence';

interface GameCtx {
  game: GameState | null;
  hall: HallEntry[];
  newGame(): void;
  reroll(): void;
  keep(): void;
  confirmDraw(): void;
  playGroupRound(): void;
  playKnockout(): void;
  goHome(): void;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(() => loadGame());
  const [hall, setHall] = useState<HallEntry[]>(() => loadHall());
  const recordedSeed = useRef<number | null>(null);

  useEffect(() => { saveGame(game); }, [game]);
  useEffect(() => { saveHall(hall); }, [hall]);

  // Registra o campeão no Hall da Fama uma única vez (seguro sob StrictMode).
  useEffect(() => {
    if (game?.phase !== 'CHAMPION' || !game.championId) return;
    if (recordedSeed.current === game.seed) return;
    recordedSeed.current = game.seed;
    const championId = game.championId;
    setHall((h) => {
      if (h.some((e) => e.seed === game.seed)) return h;
      return [
        { champion: byId[championId].name, fighterId: game.fighterId, tier: game.fighterTier, date: new Date().toISOString(), seed: game.seed },
        ...h,
      ];
    });
  }, [game?.phase, game?.championId, game?.seed, game?.fighterId, game?.fighterTier]);

  const api = useMemo<GameCtx>(() => ({
    game,
    hall,
    newGame: () => { recordedSeed.current = null; setGame(createGame()); },
    reroll: () => setGame((g) => (g ? rerollFn(g) : g)),
    keep: () => setGame((g) => (g ? keepFighter(g) : g)),
    confirmDraw: () => setGame((g) => (g ? confirmDraw(g) : g)),
    playGroupRound: () => setGame((g) => (g ? playGroupRound(g) : g)),
    playKnockout: () => setGame((g) => (g ? playKnockoutRound(g) : g)),
    goHome: () => setGame(null),
  }), [game, hall]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useGame(): GameCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}
