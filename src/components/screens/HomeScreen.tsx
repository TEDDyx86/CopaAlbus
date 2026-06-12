import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { TIERS } from '../../engine/fighterRoll';

export function HomeScreen() {
  const { newGame, hall } = useGame();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="text-5xl font-black tracking-tight">
        <span className="text-neon">Copa</span> <span className="text-neon-2">Albus Nexus</span>
      </h1>
      <p className="mt-3 text-white/60">7 a 0 — o X1 de League of Legends do Albus Nexus.</p>

      <button
        onClick={newGame}
        className="mt-8 rounded-xl bg-neon px-8 py-3 text-lg font-black text-bg transition hover:brightness-110"
      >
        ⚡ Nova Copa
      </button>

      <div className="mt-12 text-left">
        <h2 className="mb-3 text-xl font-bold text-white/80">🏆 Hall da Fama</h2>
        {hall.length === 0 ? (
          <p className="text-white/40">Nenhuma Copa concluída ainda. Seja o primeiro campeão.</p>
        ) : (
          <ul className="space-y-2">
            {hall.map((e, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-panel px-4 py-2 ring-1 ring-line">
                <span className="font-bold text-neon">{e.champion}</span>
                <span className="text-sm text-white/50">
                  seu fighter: {byId[e.fighterId]?.name ?? e.fighterId} ·{' '}
                  {new Date(e.date).toLocaleDateString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 text-left text-xs text-white/40">
        <p className="mb-1 font-bold uppercase tracking-wide">Raridades</p>
        <div className="flex flex-wrap gap-3">
          {TIERS.map((t) => (
            <span key={t.tier}>{t.label}: {(t.chance * 100).toFixed(0)}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}
