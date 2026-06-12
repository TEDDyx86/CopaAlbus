import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { GroupTable } from '../ui/GroupTable';
import { WinTypeTag } from '../ui/WinTypeTag';
import { TopBar } from '../ui/TopBar';
import { Button } from '../ui/Button';
import { computeGroupStandings } from '../../engine/groupStage';
import { makeRng } from '../../engine/rng';

export function TournamentHub() {
  const { game, playGroupRound } = useGame();
  if (!game?.groups || !game.groupMatches) return null;

  const liveStandings = (name: string) => {
    const group = game.groups!.find((g) => g.name === name)!;
    return computeGroupStandings(group, game.groupMatches!, byId, makeRng(game.seed).next);
  };

  const played = game.groupRoundsPlayed;
  const nextRound = played + 1;
  const fighterMatch = game.groupMatches.find(
    (m) => m.round === played && (m.aId === game.fighterId || m.bId === game.fighterId),
  );

  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">Fase de grupos</p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">
              Rodada <span className="tnum font-mono text-accent">{Math.min(nextRound, 3)}</span>
              <span className="text-ink-faint"> / 3</span>
            </h2>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((r) => (
              <span
                key={r}
                className="h-1.5 w-10 rounded-full transition-colors"
                style={{ background: r <= played ? 'var(--color-accent)' : 'var(--color-line)' }}
              />
            ))}
          </div>
        </div>

        {fighterMatch?.result && (
          <div className="mt-5 flex flex-wrap items-center gap-2 overflow-hidden rounded-md bg-surface/70 px-4 py-3 ring-1 ring-line anim-rise">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-2">seu jogo</span>
            <span className="font-bold text-ink">{byId[fighterMatch.result.winnerId].name}</span>
            <span className="text-ink-faint">venceu</span>
            <span className="font-semibold text-ink-muted">{byId[fighterMatch.result.loserId].name}</span>
            <span className="ml-auto"><WinTypeTag type={fighterMatch.result.winType} /></span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {game.groups.map((g) => (
            <GroupTable key={g.name} name={g.name} standings={liveStandings(g.name)} fighterId={game.fighterId} />
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center gap-2">
          <Button size="lg" onClick={playGroupRound}>
            {played >= 3 ? 'Ir para o mata-mata →' : `Jogar rodada ${nextRound} →`}
          </Button>
          <p className="text-xs text-ink-faint">
            {played >= 3 ? '16 classificados definidos.' : 'Simula a rodada de todos os 7 grupos de uma vez.'}
          </p>
        </div>
      </div>
    </>
  );
}
