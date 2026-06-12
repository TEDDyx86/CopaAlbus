import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';

export function DrawScreen() {
  const { game, confirmDraw } = useGame();
  if (!game?.groups) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-center text-2xl font-black">Sorteio dos grupos</h2>
      <p className="mt-1 text-center text-white/50">Chapéu único, 100% no grito. Boa sorte.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {game.groups.map((g) => (
          <div key={g.name} className="rounded-xl bg-panel p-4 ring-1 ring-line">
            <div className="mb-2 text-sm font-black text-neon">Grupo {g.name}</div>
            <ul className="space-y-1 text-sm">
              {g.playerIds.map((id) => (
                <li key={id} className={id === game.fighterId ? 'font-bold text-neon-2' : 'text-white/80'}>
                  {byId[id].name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={confirmDraw} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          Começar a Copa →
        </button>
      </div>
    </div>
  );
}
