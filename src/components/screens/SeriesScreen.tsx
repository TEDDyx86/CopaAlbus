import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { tierOf } from '../../engine/fighterRoll';
import { PHASE_TITLE, type SeriesKey } from '../../engine/run';
import { TopBar } from '../ui/TopBar';
import { Button } from '../ui/Button';
import { WinTypeTag } from '../ui/WinTypeTag';
import { FighterCard } from '../ui/FighterCard';
import { CampaignRoad } from '../ui/CampaignRoad';

const NEXT_LABEL: Record<SeriesKey, string> = {
  R16: PHASE_TITLE.QF, QF: PHASE_TITLE.SF, SF: PHASE_TITLE.FINAL, FINAL: '',
};

function ScorePips({ value, target, color }: { value: number; target: number; color: string }) {
  return (
    <span className="flex gap-1">
      {Array.from({ length: target }, (_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full transition-colors"
          style={{ background: i < value ? color : 'var(--color-line)', boxShadow: i < value ? `0 0 8px -1px ${color}` : undefined }}
        />
      ))}
    </span>
  );
}

export function SeriesScreen() {
  const { game, playSeriesGame, advance } = useGame();
  if (!game) return null;
  const key = game.phase as SeriesKey;
  const ser = game.knockout[key];
  if (!ser) return null;

  const me = byId[game.fighterId];
  const opp = byId[ser.oppId];
  const formatLabel = ser.target === 3 ? 'Melhor de 5' : 'Melhor de 3';
  const isFinal = key === 'FINAL';

  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-2xl px-5 py-7 sm:px-6">
        <CampaignRoad run={game} />

        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">{formatLabel}</p>
          <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">{PHASE_TITLE[key]}</h2>
        </div>

        {/* confronto + placar da série */}
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
          <FighterCard player={me} tier={game.fighterTier} won={ser.decided && ser.won === true} dimmed={ser.decided && ser.won === false} />
          <div className="mx-auto flex flex-col items-center gap-2">
            <div className="font-mono text-3xl font-black tracking-tight">
              <span className="text-accent">{ser.myWins}</span>
              <span className="mx-1 text-ink-faint">×</span>
              <span className="text-ink-muted">{ser.oppWins}</span>
            </div>
            <div className="flex items-center gap-2">
              <ScorePips value={ser.myWins} target={ser.target} color="var(--color-accent)" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-ink-faint">série</span>
              <ScorePips value={ser.oppWins} target={ser.target} color="var(--color-kill)" />
            </div>
          </div>
          <FighterCard player={opp} tier={tierOf(opp)} won={ser.decided && ser.won === false} dimmed={ser.decided && ser.won === true} />
        </div>

        {/* log de jogos */}
        {ser.games.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2">
            {ser.games.map((g, i) => {
              const iWon = g.winnerId === game.fighterId;
              return (
                <li
                  key={i}
                  className="anim-pop flex items-center gap-3 rounded-md bg-surface/60 px-4 py-2.5 ring-1 ring-line"
                >
                  <span className="tnum shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    Jogo {i + 1}
                  </span>
                  <span className={`flex-1 truncate font-bold ${iWon ? 'text-accent' : 'text-ink-muted'}`}>
                    {byId[g.winnerId].name}
                    <span className="ml-1 font-semibold text-ink-faint">venceu</span>
                  </span>
                  <WinTypeTag type={g.winType} size="sm" />
                </li>
              );
            })}
          </ul>
        )}

        {/* veredito da série */}
        {ser.decided && (
          <div className="mt-6 text-center anim-rise">
            {ser.won ? (
              <p className="text-lg font-extrabold tracking-tight text-accent">
                {isFinal ? '🏆 Você venceu a Final!' : 'Você venceu a série! Classificado.'}
              </p>
            ) : (
              <p className="text-lg font-extrabold tracking-tight text-kill">Você perdeu a série.</p>
            )}
          </div>
        )}

        <div className="mt-7 flex flex-col items-center gap-2">
          {!ser.decided ? (
            <Button size="lg" onClick={playSeriesGame}>Jogar jogo {ser.games.length + 1} →</Button>
          ) : ser.won && isFinal ? (
            <Button size="lg" onClick={advance}>🏆 Erguer a taça</Button>
          ) : ser.won ? (
            <Button size="lg" onClick={advance}>Avançar pras {NEXT_LABEL[key]} →</Button>
          ) : (
            <Button size="lg" onClick={advance}>Ver resumo →</Button>
          )}
          <p className="text-xs text-ink-faint">
            {ser.decided ? 'A série acabou.' : `Primeiro a ${ser.target} vitórias leva a série.`}
          </p>
        </div>
      </div>
    </>
  );
}
