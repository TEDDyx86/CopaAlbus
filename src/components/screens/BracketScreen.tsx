import { useState } from 'react';
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import type { KnockoutKey } from '../../engine/tournament';
import type { KnockoutMatch } from '../../engine/bracket';
import { WinTypeTag } from '../ui/WinTypeTag';
import { MatchReveal } from './MatchScreen';

const TITLES: Record<KnockoutKey, string> = {
  R16: 'Oitavas de final', QF: 'Quartas de final', SF: 'Semifinais',
  BRONZE: 'Disputa de 3º lugar', FINAL: 'Final',
};
const ORDER: KnockoutKey[] = ['R16', 'QF', 'SF', 'BRONZE', 'FINAL'];

export function BracketScreen() {
  const { game, playKnockout } = useGame();
  const [reveal, setReveal] = useState<KnockoutMatch | null>(null);
  if (!game) return null;

  const current = game.phase as KnockoutKey;

  const matchRow = (m: KnockoutMatch, key: KnockoutKey) => {
    const a = m.aId ? byId[m.aId].name : '—';
    const b = m.bId ? byId[m.bId].name : '—';
    const mine = m.aId === game.fighterId || m.bId === game.fighterId;
    return (
      <button
        key={`${key}-${a}-${b}`}
        onClick={() => m.result && setReveal(m)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ring-1 ${
          mine ? 'bg-panel-2 ring-neon' : 'bg-panel ring-line'
        } ${m.result ? 'hover:ring-neon-2' : ''}`}
      >
        <span className="text-sm">
          <b className={m.result?.winnerId === m.aId ? 'text-neon' : 'text-white/60'}>{a}</b>
          <span className="text-white/30"> vs </span>
          <b className={m.result?.winnerId === m.bId ? 'text-neon' : 'text-white/60'}>{b}</b>
        </span>
        {m.result && <WinTypeTag type={m.result.winType} />}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="text-center text-2xl font-black">{TITLES[current]}</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-5">
        {ORDER.map((key) => {
          const round = game.knockout[key];
          if (!round) return <div key={key} />;
          return (
            <div key={key} className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wide text-white/40">{TITLES[key]}</div>
              {round.map((m) => matchRow(m, key))}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button onClick={playKnockout} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          Jogar {TITLES[current]} →
        </button>
      </div>

      {reveal && <MatchReveal match={reveal} onClose={() => setReveal(null)} />}
    </div>
  );
}
