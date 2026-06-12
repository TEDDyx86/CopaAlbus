import type { WinType } from '../../types';

const META: Record<WinType, { label: string; icon: string; color: string }> = {
  kill: { label: 'KILL', icon: '⚔️', color: 'text-kill' },
  farm: { label: 'FARM', icon: '🌾', color: 'text-farm' },
  torre: { label: 'TORRE', icon: '🏰', color: 'text-torre' },
};

export function WinTypeTag({ type }: { type: WinType }) {
  const m = META[type];
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${m.color}`}>
      <span>{m.icon}</span>
      {m.label}
    </span>
  );
}
