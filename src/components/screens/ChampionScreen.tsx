import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { PlayerCard } from '../ui/PlayerCard';

export function ChampionScreen() {
  const { game, goHome, newGame } = useGame();
  if (!game?.championId) return null;
  const champion = byId[game.championId];
  const isMine = game.championId === game.fighterId;
  const bronze = game.bronzeId ? byId[game.bronzeId] : null;

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="text-6xl">🏆</div>
      <div className="mt-2 text-sm uppercase tracking-widest text-white/40">Campeão da Copa Albus Nexus</div>
      <h2 className="mt-1 text-4xl font-black text-lendario">{champion.name}</h2>

      {isMine && (
        <p className="mt-3 animate-pulse text-lg font-bold text-neon-2">
          🎉 Seu fighter foi campeão! 🎉
        </p>
      )}

      <div className="mt-8">
        <PlayerCard player={champion} highlight />
      </div>

      {bronze && (
        <p className="mt-4 text-sm text-white/50">🥉 3º lugar: <b className="text-white/80">{bronze.name}</b></p>
      )}

      <div className="mt-10 flex flex-col gap-3">
        <button onClick={newGame} className="rounded-xl bg-neon px-6 py-3 font-black text-bg hover:brightness-110">
          🔁 Jogar de novo
        </button>
        <button onClick={goHome} className="rounded-xl bg-panel-2 px-6 py-3 font-bold ring-1 ring-line hover:ring-neon">
          🏠 Capa / Hall da Fama
        </button>
      </div>
    </div>
  );
}
