import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { PHASE_TITLE, type SeriesKey } from '../../engine/run';
import { FighterCard } from '../ui/FighterCard';
import { Button } from '../ui/Button';

const ROUNDS: SeriesKey[] = ['R16', 'QF', 'SF', 'FINAL'];

export function ChampionScreen() {
  const { game, goHome, newGame } = useGame();

  useEffect(() => {
    if (game?.phase !== 'CHAMPION') return;
    const mm = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    if (mm?.matches) return;
    // Ambiente headless (jsdom) não implementa canvas 2D — sem contexto, sem confete.
    if (!document.createElement('canvas').getContext('2d')) return;
    const colors = ['#2de2e6', '#ff2e97', '#ffcf3f'];
    const burst = (x: number) => confetti({ particleCount: 70, spread: 70, origin: { x, y: 0.3 }, colors, scalar: 0.9 });
    burst(0.3); burst(0.7);
    const t = setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.35 }, colors }), 250);
    return () => { clearTimeout(t); confetti.reset(); };
  }, [game?.phase]);

  if (!game || game.phase !== 'CHAMPION') return null;
  const champion = byId[game.fighterId];

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-12 text-center">
      <div className="anim-rise">
        <div className="text-6xl" style={{ filter: 'drop-shadow(0 8px 24px color-mix(in oklch, var(--color-lendario) 50%, transparent))' }}>
          🏆
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-ink-faint">Campeão da Copa Albus Nexus</p>
        <h2 className="mt-1 text-4xl font-extrabold tracking-tight" style={{ color: 'var(--color-lendario)' }}>
          {champion.name}
        </h2>
        <p className="mt-3 text-base font-bold text-accent-2">🎉 Seu fighter levantou a taça! Tira o print.</p>
      </div>

      <div className="mt-8">
        <FighterCard player={champion} tier={game.fighterTier} size="lg" glow />
      </div>

      {/* resumo da campanha */}
      <div className="mt-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">A caminhada até o título</p>
        <ul className="flex flex-col gap-1.5 text-sm">
          <li className="flex items-center gap-3 rounded-md bg-surface/60 px-4 py-2.5 ring-1 ring-line">
            <span className="w-24 shrink-0 text-left text-[11px] font-bold uppercase tracking-wide text-ink-faint">Grupos</span>
            <span className="flex-1 text-left font-semibold text-ink">
              {game.group.filter((g) => g.result?.winnerId === game.fighterId).length} vitórias em 3
            </span>
          </li>
          {ROUNDS.map((key) => {
            const ser = game.knockout[key];
            if (!ser) return null;
            const opp = byId[ser.oppId];
            return (
              <li key={key} className="flex items-center gap-3 rounded-md bg-surface/60 px-4 py-2.5 ring-1 ring-line">
                <span className="w-24 shrink-0 text-left text-[11px] font-bold uppercase tracking-wide text-ink-faint">{PHASE_TITLE[key]}</span>
                <span className="flex-1 truncate text-left font-semibold text-ink">{opp.name}</span>
                <span className="tnum shrink-0 font-mono text-sm font-black">
                  <span className="text-accent">{ser.myWins}</span>
                  <span className="text-ink-faint">–</span>
                  <span className="text-ink-muted">{ser.oppWins}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-9 flex flex-col gap-3">
        <Button size="lg" onClick={newGame}>🔁 Jogar de novo</Button>
        <Button variant="ghost" onClick={goHome}>🏠 Capa / Hall da Fama</Button>
      </div>
    </div>
  );
}
