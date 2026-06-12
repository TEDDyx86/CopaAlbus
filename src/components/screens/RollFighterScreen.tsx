import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { PlayerCard } from '../ui/PlayerCard';
import { TIERS } from '../../engine/fighterRoll';

const TIER_COLOR: Record<string, string> = {
  lendario: 'text-lendario',
  epico: 'text-epico',
  raro: 'text-raro',
  comum: 'text-comum',
};

export function RollFighterScreen() {
  const { game, reroll, keep, goHome } = useGame();
  if (!game) return null;
  const fighter = byId[game.fighterId];
  const tierLabel = TIERS.find((t) => t.tier === game.fighterTier)!.label;

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <button onClick={goHome} className="mb-6 text-sm text-white/40 hover:text-white/70">← Capa</button>
      <h2 className="text-2xl font-black">Seu fighter</h2>
      <p className="mt-1 text-white/50">A sorte escolheu por você. Topa ou empurra?</p>

      <div className="mt-6 animate-[pop_0.3s_ease]" key={game.fighterId}>
        <div className={`mb-2 text-sm font-black uppercase tracking-widest ${TIER_COLOR[game.fighterTier]}`}>
          {tierLabel}
        </div>
        <PlayerCard player={fighter} tier={game.fighterTier} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={keep}
          className="rounded-xl bg-neon px-6 py-3 font-black text-bg transition hover:brightness-110"
        >
          ✅ Ficar com {fighter.name}
        </button>
        <button
          onClick={reroll}
          disabled={game.rerollsLeft <= 0}
          className="rounded-xl bg-panel-2 px-6 py-3 font-bold ring-1 ring-line transition enabled:hover:ring-neon-2 disabled:opacity-40"
        >
          🎲 Rerolar ({game.rerollsLeft} restante{game.rerollsLeft === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
}
