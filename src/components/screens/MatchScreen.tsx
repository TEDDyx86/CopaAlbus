import { useEffect, useState } from 'react';
import { byId } from '../../data/players';
import { overall } from '../../types';
import type { KnockoutMatch } from '../../engine/bracket';
import { FighterCard } from '../ui/FighterCard';
import { WinTypeTag } from '../ui/WinTypeTag';
import { Button } from '../ui/Button';

export function MatchReveal({ match, onClose, title }: { match: KnockoutMatch; onClose: () => void; title?: string }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!match.aId || !match.bId || !match.result) return null;
  const a = byId[match.aId], b = byId[match.bId];
  const r = match.result;
  const winner = byId[r.winnerId];
  const loser = byId[r.loserId];
  const isZebra = overall(winner) < overall(loser);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/85 px-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {title && (
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-ink-faint">{title}</p>
        )}

        <div className="flex flex-col items-stretch gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
          <div style={{ animation: 'clash-left 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <FighterCard player={a} won={revealed && r.winnerId === a.id} dimmed={revealed && r.winnerId !== a.id} />
          </div>
          <div
            className="mx-auto font-mono text-2xl font-black text-ink-faint sm:text-3xl"
            style={{ animation: 'vs-pulse 1.4s ease-in-out infinite' }}
          >
            VS
          </div>
          <div style={{ animation: 'clash-right 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <FighterCard player={b} won={revealed && r.winnerId === b.id} dimmed={revealed && r.winnerId !== b.id} />
          </div>
        </div>

        <div className="mt-7 grid min-h-24 place-items-center text-center">
          {!revealed ? (
            <div className="flex items-center gap-2 text-ink-muted">
              <span className="live-dot h-2 w-2 rounded-full bg-accent" />
              <span className="font-semibold tracking-wide">simulando o X1…</span>
            </div>
          ) : (
            <div className="anim-pop">
              {isZebra && (
                <div className="mb-2 inline-block rounded-full bg-accent-2/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-accent-2 ring-1 ring-accent-2/40">
                  🦓 Zebra histórica
                </div>
              )}
              <div className="text-2xl font-extrabold tracking-tight">
                <span className="text-accent">{winner.name}</span> venceu
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-ink-muted">
                por <WinTypeTag type={r.winType} />
              </div>
              <div className="mt-5">
                <Button onClick={onClose}>Continuar →</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
