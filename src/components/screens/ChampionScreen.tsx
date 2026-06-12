import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { tierOf } from '../../engine/fighterRoll';
import { FighterCard } from '../ui/FighterCard';
import { Button } from '../ui/Button';

export function ChampionScreen() {
  const { game, goHome, newGame } = useGame();

  const isMine = !!game && game.championId === game.fighterId;

  useEffect(() => {
    if (!game?.championId) return;
    const mm = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    if (mm?.matches) return;
    const colors = ['#2de2e6', '#ff2e97', '#ffcf3f'];
    const burst = (x: number) => confetti({ particleCount: 70, spread: 70, origin: { x, y: 0.3 }, colors, scalar: 0.9 });
    burst(0.3); burst(0.7);
    const t = setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.35 }, colors }), 250);
    return () => clearTimeout(t);
  }, [game?.championId]);

  if (!game?.championId) return null;
  const champion = byId[game.championId];
  const bronze = game.bronzeId ? byId[game.bronzeId] : null;
  const finalMatch = game.knockout.FINAL?.[0];
  const vice = finalMatch?.result ? byId[finalMatch.result.loserId] : null;

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
        {isMine && (
          <p className="mt-3 text-base font-bold text-accent-2">🎉 Seu fighter levantou a taça! Tira o print.</p>
        )}
      </div>

      <div className="mt-8">
        <FighterCard player={champion} tier={tierOf(champion)} size="lg" glow />
      </div>

      {/* pódio */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-sm">
        <PodiumSlot place="🥇" label="Campeão" name={champion.name} accent="var(--color-lendario)" />
        <PodiumSlot place="🥈" label="Vice" name={vice?.name ?? '—'} accent="var(--color-comum)" />
        <PodiumSlot place="🥉" label="3º lugar" name={bronze?.name ?? '—'} accent="var(--color-kill)" />
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <Button size="lg" onClick={newGame}>🔁 Jogar de novo</Button>
        <Button variant="ghost" onClick={goHome}>🏠 Capa / Hall da Fama</Button>
      </div>
    </div>
  );
}

function PodiumSlot({ place, label, name, accent }: { place: string; label: string; name: string; accent: string }) {
  return (
    <div className="rounded-md bg-surface/60 px-2 py-3 ring-1 ring-line">
      <div className="text-xl">{place}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</div>
      <div className="mt-0.5 truncate font-bold" style={{ color: accent }}>{name}</div>
    </div>
  );
}
