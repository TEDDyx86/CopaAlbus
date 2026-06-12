import type { Player, Tier } from '../../types';
import { overall } from '../../types';
import { StatBadges } from './StatBadges';

const TIER_RING: Record<Tier, string> = {
  lendario: 'ring-lendario shadow-[0_0_24px_-4px_var(--color-lendario)]',
  epico: 'ring-epico shadow-[0_0_20px_-6px_var(--color-epico)]',
  raro: 'ring-raro',
  comum: 'ring-comum',
};

export function PlayerCard({
  player, tier, highlight = false, subtitle,
}: { player: Player; tier?: Tier; highlight?: boolean; subtitle?: string }) {
  const ring = tier ? TIER_RING[tier] : 'ring-line';
  return (
    <div className={`rounded-xl bg-panel-2 p-4 ring-2 ${ring} ${highlight ? 'outline outline-2 outline-neon' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{player.name}</div>
          {subtitle && <div className="text-xs text-white/50">{subtitle}</div>}
        </div>
        <div className="text-3xl font-black text-neon">{overall(player)}</div>
      </div>
      <div className="mt-3"><StatBadges p={player} /></div>
    </div>
  );
}
