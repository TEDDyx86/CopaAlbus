import type { Player } from '../../types';

export function StatBadges({ p }: { p: Player }) {
  const item = (label: string, value: number, color: string) => (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-bold ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/50">{label}</span>
    </div>
  );
  return (
    <div className="flex gap-3">
      {item('kill', p.kill, 'text-kill')}
      {item('farm', p.farm, 'text-farm')}
      {item('torre', p.torre, 'text-torre')}
    </div>
  );
}
