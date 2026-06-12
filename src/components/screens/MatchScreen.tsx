import { useEffect, useState } from 'react';
import { byId } from '../../data/players';
import type { KnockoutMatch } from '../../engine/bracket';
import { PlayerCard } from '../ui/PlayerCard';
import { WinTypeTag } from '../ui/WinTypeTag';

export function MatchReveal({ match, onClose }: { match: KnockoutMatch; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!match.aId || !match.bId || !match.result) return null;
  const a = byId[match.aId], b = byId[match.bId];
  const r = match.result;
  const winner = byId[r.winnerId];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-6" onClick={onClose}>
      <div className="w-full max-w-xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <PlayerCard player={a} highlight={revealed && r.winnerId === a.id} />
          <div className="text-2xl font-black text-white/40">VS</div>
          <PlayerCard player={b} highlight={revealed && r.winnerId === b.id} />
        </div>

        <div className="mt-6 h-20">
          {!revealed ? (
            <div className="animate-pulse text-lg text-white/60">simulando o X1…</div>
          ) : (
            <div className="animate-[pop_0.3s_ease]">
              <div className="text-xl font-black text-neon">{winner.name} venceu!</div>
              <div className="mt-1 text-sm text-white/70">
                por <WinTypeTag type={r.winType} />
              </div>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={onClose} className="mt-2 rounded-lg bg-neon px-6 py-2 font-bold text-bg hover:brightness-110">
            Continuar →
          </button>
        )}
      </div>
    </div>
  );
}
