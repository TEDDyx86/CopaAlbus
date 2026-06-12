import type { Player, WinType } from '../../types';

const ROWS: { key: WinType; label: string; icon: string; color: string }[] = [
  { key: 'kill', label: 'Kill', icon: '⚔', color: 'var(--color-kill)' },
  { key: 'farm', label: 'Farm', icon: '🌾', color: 'var(--color-farm)' },
  { key: 'torre', label: 'Torre', icon: '🏰', color: 'var(--color-torre)' },
];

export function StatBars({ player, animate = false }: { player: Player; animate?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {ROWS.map((r, i) => {
        const v = player[r.key];
        const fill = Math.max(0, Math.min(1, v / 100));
        return (
          <div key={r.key} className="flex items-center gap-2.5">
            <span className="w-12 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
              <span aria-hidden className="mr-1" style={{ color: r.color }}>{r.icon}</span>
              {r.label}
            </span>
            <span className="statbar-track relative h-2 flex-1 overflow-hidden rounded-full">
              <span
                className="absolute inset-y-0 left-0 origin-left rounded-full"
                style={{
                  width: `${fill * 100}%`,
                  background: `linear-gradient(90deg, color-mix(in oklch, ${r.color} 55%, transparent), ${r.color})`,
                  boxShadow: `0 0 12px -2px ${r.color}`,
                  ['--fill' as string]: String(fill),
                  animation: animate ? `bar-fill 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s both` : undefined,
                }}
              />
            </span>
            <span className="tnum w-7 shrink-0 text-right font-mono text-sm font-semibold text-ink">{v}</span>
          </div>
        );
      })}
    </div>
  );
}
