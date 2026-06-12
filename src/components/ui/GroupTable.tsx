import { byId } from '../../data/players';
import { overall } from '../../types';
import type { Standing } from '../../engine/groupStage';

export function GroupTable({
  name, standings, fighterId, qualifiedCount = 2,
}: { name: string; standings: Standing[]; fighterId: string; qualifiedCount?: number }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface/70 ring-1 ring-line backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/15 font-mono text-sm font-black text-accent">
            {name}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">Grupo</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          top {qualifiedCount} avançam
        </span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {standings.map((s, i) => {
            const p = byId[s.playerId];
            const qualifies = i < qualifiedCount;
            const isMine = s.playerId === fighterId;
            return (
              <tr
                key={s.playerId}
                className={`border-b border-line-soft/50 last:border-0 ${isMine ? 'bg-accent/10' : ''}`}
              >
                <td className="py-2 pl-3.5 pr-1">
                  <span
                    className={`tnum inline-grid h-5 w-5 place-items-center rounded font-mono text-xs font-bold ${
                      qualifies ? 'text-accent' : 'text-ink-faint'
                    }`}
                    style={qualifies ? { background: 'color-mix(in oklch, var(--color-accent) 16%, transparent)' } : undefined}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className={`py-2 pr-2 font-semibold ${isMine ? 'text-accent' : qualifies ? 'text-ink' : 'text-ink-muted'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="truncate">{p.name}</span>
                    {isMine && <span className="text-[9px] font-black uppercase tracking-wider text-accent-2">você</span>}
                  </span>
                </td>
                <td className="tnum py-2 pr-2 text-right font-mono text-xs text-ink-faint">{overall(p)}</td>
                <td className="tnum py-2 pr-2 text-right font-mono text-ink-muted">{s.wins}<span className="text-ink-faint">V</span></td>
                <td className="tnum py-2 pr-3.5 text-right font-mono font-bold text-ink">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
