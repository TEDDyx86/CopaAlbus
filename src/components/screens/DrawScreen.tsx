import { byId } from '../../data/players';
import { overall } from '../../types';
import { useGame } from '../../store/GameProvider';
import { TopBar } from '../ui/TopBar';
import { Button } from '../ui/Button';

export function DrawScreen() {
  const { game, confirmDraw } = useGame();
  if (!game?.groups) return null;

  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">Sorteio dos grupos</h2>
          <p className="mt-1 text-ink-muted">Chapéu único, 100% no grito. Reza pra não cair no grupo da morte.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {game.groups.map((g, gi) => (
            <div
              key={g.name}
              className="anim-rise overflow-hidden rounded-lg bg-surface/70 ring-1 ring-line"
              style={{ animationDelay: `${gi * 70}ms` }}
            >
              <div className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/15 font-mono text-sm font-black text-accent">
                  {g.name}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">Grupo</span>
              </div>
              <ul className="divide-y divide-line-soft/50">
                {g.playerIds.map((id) => {
                  const p = byId[id];
                  const mine = id === game.fighterId;
                  return (
                    <li key={id} className={`flex items-center gap-2.5 px-4 py-2.5 ${mine ? 'bg-accent/10' : ''}`}>
                      <span className={`font-semibold ${mine ? 'text-accent' : 'text-ink'}`}>{p.name}</span>
                      {mine && <span className="text-[9px] font-black uppercase tracking-wider text-accent-2">você</span>}
                      <span className="tnum ml-auto font-mono text-xs text-ink-faint">{overall(p)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Button size="lg" onClick={confirmDraw}>Começar a Copa →</Button>
        </div>
      </div>
    </>
  );
}
