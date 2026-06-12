import { byId } from '../../data/players';
import type { Tier } from '../../types';
import { useGame } from '../../store/GameProvider';
import { FighterCard } from '../ui/FighterCard';
import { Button } from '../ui/Button';
import { TIER_META } from '../ui/tiers';

const FLAVOR: Record<Tier, string> = {
  lendario: 'Lendário. Se rerolar isso, a gente precisa conversar.',
  epico: 'Pegou um peso-pesado. Dá pra sonhar com a taça.',
  raro: 'Sólido. Dá pra brigar lá em cima.',
  comum: 'Foi o que o destino mandou. Coragem (ou reroll).',
};

export function RollFighterScreen() {
  const { game, reroll, keep, goHome } = useGame();
  if (!game) return null;
  const fighter = byId[game.fighterId];
  const m = TIER_META[game.fighterTier];

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10 text-center">
      <button onClick={goHome} className="mb-8 self-start text-sm text-ink-faint transition-colors hover:text-ink-muted">
        ← Capa
      </button>

      <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink-faint">O destino escolheu</p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Seu fighter</h2>

      <div key={game.fighterId} className="mt-6">
        <FighterCard player={fighter} tier={game.fighterTier} size="lg" glow animate />
      </div>

      <p className="mt-4 text-sm" style={{ color: m.color }}>{FLAVOR[game.fighterTier]}</p>

      {/* rerolls como pips */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        Rerolls
        <span className="flex gap-1">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-2 w-6 rounded-full transition-colors"
              style={{ background: i < game.rerollsLeft ? 'var(--color-accent)' : 'var(--color-line)' }}
            />
          ))}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Button size="lg" onClick={keep}>✅ Ficar com {fighter.name}</Button>
        <Button variant="ghost" onClick={reroll} disabled={game.rerollsLeft <= 0}>
          🎲 Rerolar {game.rerollsLeft > 0 ? `(${game.rerollsLeft})` : '(esgotado)'}
        </Button>
      </div>
      <p className="mt-3 text-xs text-ink-faint">Empurrou a sorte e zerou? Fica com o último. É o risco.</p>
    </div>
  );
}
