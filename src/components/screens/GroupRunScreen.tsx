import { byId } from '../../data/players';
import { overall } from '../../types';
import { useGame } from '../../store/GameProvider';
import { tierOf } from '../../engine/fighterRoll';
import { TopBar } from '../ui/TopBar';
import { Button } from '../ui/Button';
import { WinTypeTag } from '../ui/WinTypeTag';
import { TierBadge } from '../ui/TierBadge';
import { CampaignRoad } from '../ui/CampaignRoad';

export function GroupRunScreen() {
  const { game, playGroupGame, advance } = useGame();
  if (!game || game.phase !== 'GROUPS') return null;

  const wins = game.group.filter((g) => g.result?.winnerId === game.fighterId).length;
  const played = game.group.filter((g) => g.result).length;
  const allPlayed = played === game.group.length;
  const nextIdx = game.group.findIndex((g) => !g.result);

  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-2xl px-5 py-7 sm:px-6">
        <CampaignRoad run={game} />

        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">Fase de grupos</p>
          <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">
            Vença <span className="text-accent">2</span> dos <span className="tnum font-mono">3</span> pra classificar
          </h2>
          {/* placar da campanha nos grupos */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-1.5 ring-1 ring-line">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-faint">seu saldo</span>
            <span className="tnum font-mono text-sm font-black text-accent">{wins}V</span>
            <span className="text-ink-faint">·</span>
            <span className="tnum font-mono text-sm font-black text-kill">{played - wins}D</span>
          </div>
        </div>

        <ul className="mt-6 flex flex-col gap-2.5">
          {game.group.map((g, i) => {
            const opp = byId[g.oppId];
            const r = g.result;
            const iWon = r?.winnerId === game.fighterId;
            const isNext = i === nextIdx;
            return (
              <li
                key={g.oppId}
                className={`overflow-hidden rounded-lg ring-1 transition-all ${
                  r ? 'bg-surface/70 ring-line ' + (r ? 'anim-pop' : '') : isNext ? 'bg-surface/40 ring-accent/40' : 'bg-surface/20 ring-line-soft/60'
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="tnum w-5 shrink-0 text-center font-mono text-xs font-black text-ink-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`truncate font-bold ${r ? 'text-ink' : 'text-ink-muted'}`}>{opp.name}</span>
                      <TierBadge tier={tierOf(opp)} size="sm" />
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-faint">
                      overall <span className="tnum font-mono text-ink-muted">{overall(opp)}</span>
                    </div>
                  </div>

                  {r ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <WinTypeTag type={r.winType} size="sm" />
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-md text-xs font-black ${
                          iWon ? 'bg-accent/15 text-accent ring-1 ring-accent/40' : 'bg-kill/15 text-kill ring-1 ring-kill/40'
                        }`}
                      >
                        {iWon ? 'V' : 'D'}
                      </span>
                    </div>
                  ) : (
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                      {isNext ? 'a seguir' : 'a jogar'}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-2">
          {allPlayed ? (
            <Button size="lg" onClick={advance}>
              {wins >= 2 ? 'Avançar pras Oitavas →' : 'Avançar →'}
            </Button>
          ) : (
            <Button size="lg" onClick={playGroupGame}>Jogar jogo {played + 1} →</Button>
          )}
          <p className="text-xs text-ink-faint">
            {allPlayed
              ? wins >= 2 ? 'Classificado! Bora pro mata-mata.' : 'Saldo insuficiente — fim de linha nos grupos.'
              : 'X1 contra um adversário sorteado. Sem volta.'}
          </p>
        </div>
      </div>
    </>
  );
}
