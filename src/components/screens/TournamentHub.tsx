import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { GroupTable } from '../ui/GroupTable';
import { WinTypeTag } from '../ui/WinTypeTag';
import { computeGroupStandings } from '../../engine/groupStage';
import { makeRng } from '../../engine/rng';

export function TournamentHub() {
  const { game, playGroupRound } = useGame();
  if (!game?.groups || !game.groupMatches) return null;

  const fighter = byId[game.fighterId];

  // standings ao vivo (parciais) — recomputados de forma determinística para exibição
  const liveStandings = (name: string) => {
    const group = game.groups!.find((g) => g.name === name)!;
    return computeGroupStandings(group, game.groupMatches!, byId, makeRng(game.seed).next);
  };

  const nextRound = game.groupRoundsPlayed + 1;
  const fighterMatch = game.groupMatches.find(
    (m) => m.round === game.groupRoundsPlayed && (m.aId === game.fighterId || m.bId === game.fighterId),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Fase de grupos</div>
          <h2 className="text-2xl font-black">Rodada {Math.min(nextRound, 3)} de 3</h2>
        </div>
        <div className="rounded-lg bg-panel-2 px-4 py-2 ring-1 ring-neon">
          <span className="text-xs text-white/50">Seu fighter</span>
          <div className="font-black text-neon">{fighter.name}</div>
        </div>
      </header>

      {fighterMatch?.result && (
        <div className="mt-4 rounded-lg bg-panel p-3 ring-1 ring-line">
          <span className="text-sm text-white/60">Seu último jogo: </span>
          <span className="font-bold">
            {byId[fighterMatch.result.winnerId].name} venceu {byId[fighterMatch.result.loserId].name}{' '}
          </span>
          por <WinTypeTag type={fighterMatch.result.winType} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {game.groups.map((g) => (
          <GroupTable key={g.name} name={g.name} standings={liveStandings(g.name)} fighterId={game.fighterId} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={playGroupRound} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          {game.groupRoundsPlayed >= 3 ? 'Ir para o mata-mata →' : `Jogar rodada ${nextRound} →`}
        </button>
      </div>
    </div>
  );
}
