import { useState } from 'react';
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import type { KnockoutKey } from '../../engine/tournament';
import type { KnockoutMatch } from '../../engine/bracket';
import { WinTypeTag } from '../ui/WinTypeTag';
import { TopBar } from '../ui/TopBar';
import { Button } from '../ui/Button';
import { MatchReveal } from './MatchScreen';

const TITLES: Record<KnockoutKey, string> = {
  R16: 'Oitavas', QF: 'Quartas', SF: 'Semifinal', BRONZE: 'Disputa de 3º', FINAL: 'Final',
};
const COLUMNS: KnockoutKey[] = ['R16', 'QF', 'SF', 'FINAL'];

export function BracketScreen() {
  const { game, playKnockout } = useGame();
  const [reveal, setReveal] = useState<{ match: KnockoutMatch; title: string } | null>(null);
  if (!game) return null;
  const current = game.phase as KnockoutKey;

  function Tile({ m, columnKey }: { m: KnockoutMatch; columnKey: KnockoutKey }) {
    const a = m.aId ? byId[m.aId].name : '—';
    const b = m.bId ? byId[m.bId].name : '—';
    const mine = !!game && (m.aId === game.fighterId || m.bId === game.fighterId);
    const aWon = m.result?.winnerId === m.aId;
    const bWon = m.result?.winnerId === m.bId;

    const side = (name: string, id: string | null, won: boolean) => (
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 ${won ? 'bg-accent/10' : ''}`}>
        <span className={`truncate text-sm font-semibold ${won ? 'text-accent' : m.result ? 'text-ink-faint' : 'text-ink-muted'} ${id === game!.fighterId ? '!text-accent-2' : ''}`}>
          {name}
        </span>
        {won && <span aria-hidden className="text-accent">✓</span>}
      </div>
    );

    return (
      <button
        onClick={() => m.result && setReveal({ match: m, title: TITLES[columnKey] })}
        disabled={!m.result}
        className={`w-full overflow-hidden rounded-md bg-surface/70 text-left ring-1 transition-all ${
          mine ? 'ring-accent/60' : 'ring-line'
        } ${m.result ? 'hover:ring-accent-2 hover:brightness-110' : 'cursor-default'}`}
      >
        {side(a, m.aId, aWon)}
        <div className="h-px bg-line-soft/60" />
        {side(b, m.bId, bWon)}
        {m.result && (
          <div className="flex items-center justify-between border-t border-line-soft/60 px-3 py-1">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint">ver lance</span>
            <WinTypeTag type={m.result.winType} size="sm" />
          </div>
        )}
      </button>
    );
  }

  return (
    <>
      <TopBar />
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">Mata-mata</p>
          <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">{TITLES[current] ?? 'Mata-mata'}</h2>
        </div>

        {/* bracket */}
        <div className="mt-7 overflow-x-auto pb-2">
          <div className="flex min-w-[640px] gap-4">
            {COLUMNS.map((key) => {
              const round = game.knockout[key];
              return (
                <div key={key} className="flex flex-1 flex-col">
                  <div className={`mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] ${key === current ? 'text-accent' : 'text-ink-faint'}`}>
                    {TITLES[key]}
                  </div>
                  <div className="flex flex-1 flex-col justify-around gap-3">
                    {round
                      ? round.map((m, i) => <Tile key={`${key}-${i}`} m={m} columnKey={key} />)
                      : <div className="rounded-md border border-dashed border-line py-6 text-center text-xs text-ink-faint">a definir</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* disputa de 3º lugar */}
        {game.knockout.BRONZE && (
          <div className="mx-auto mt-6 max-w-xs">
            <div className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              🥉 Disputa de 3º lugar
            </div>
            <Tile m={game.knockout.BRONZE[0]} columnKey="BRONZE" />
          </div>
        )}

        <div className="mt-9 flex flex-col items-center gap-2">
          <Button size="lg" onClick={playKnockout}>Jogar {TITLES[current]} →</Button>
          <p className="text-xs text-ink-faint">Clique em qualquer confronto resolvido pra rever o lance.</p>
        </div>
      </div>

      {reveal && <MatchReveal match={reveal.match} title={reveal.title} onClose={() => setReveal(null)} />}
    </>
  );
}
