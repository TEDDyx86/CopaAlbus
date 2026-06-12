import type { WinType } from '../../types';

const META: Record<WinType, { label: string; icon: string; color: string }> = {
  kill: { label: 'KILL', icon: '⚔', color: 'var(--color-kill)' },
  farm: { label: 'FARM', icon: '🌾', color: 'var(--color-farm)' },
  torre: { label: 'TORRE', icon: '🏰', color: 'var(--color-torre)' },
};

export function WinTypeTag({ type, size = 'md' }: { type: WinType; size?: 'sm' | 'md' }) {
  const m = META[type];
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-[0.12em] ${pad}`}
      style={{
        color: m.color,
        background: `color-mix(in oklch, ${m.color} 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${m.color} 42%, transparent)`,
      }}
    >
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  );
}
