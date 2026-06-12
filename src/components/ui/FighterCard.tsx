import type { Player, Tier } from '../../types';
import { overall } from '../../types';
import { StatBars } from './StatBars';
import { TierBadge } from './TierBadge';
import { TIER_META } from './tiers';

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type Size = 'sm' | 'md' | 'lg';

interface Props {
  player: Player;
  tier?: Tier;
  size?: Size;
  glow?: boolean;
  won?: boolean;
  dimmed?: boolean;
  animate?: boolean;
}

export function FighterCard({ player, tier, size = 'md', glow = false, won = false, dimmed = false, animate = false }: Props) {
  const accent = tier ? TIER_META[tier].color : 'var(--color-accent)';
  const ovr = overall(player);

  const pad = size === 'lg' ? 'p-5' : size === 'sm' ? 'p-3' : 'p-4';
  const avatarSize = size === 'lg' ? 'h-14 w-14 text-xl' : size === 'sm' ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base';
  const nameSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  const ovrSize = size === 'lg' ? 'text-6xl' : size === 'sm' ? 'text-3xl' : 'text-5xl';

  return (
    <div
      className={`group relative overflow-hidden rounded-lg ${pad} ${animate ? 'anim-card-in' : ''} ${dimmed ? 'opacity-55' : ''} transition-shadow`}
      style={{
        background:
          'linear-gradient(160deg, color-mix(in oklch, var(--color-surface-2) 92%, transparent), var(--color-surface))',
        boxShadow: glow
          ? `inset 0 0 0 1.5px color-mix(in oklch, ${accent} 70%, transparent), 0 18px 50px -22px ${accent}, 0 0 40px -18px ${accent}`
          : won
            ? `inset 0 0 0 2px ${accent}, 0 0 34px -16px ${accent}`
            : `inset 0 0 0 1px var(--color-line)`,
      }}
    >
      {/* halo de topo por raridade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-32 opacity-70"
        style={{ background: `radial-gradient(60% 100% at 50% 100%, color-mix(in oklch, ${accent} 30%, transparent), transparent)` }}
      />
      {/* sheen no hover/reveal */}
      {(glow || won) && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -inset-y-2 left-0 w-1/3"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(1 0 0 / 0.12), transparent)', animation: 'sheen 2.6s ease-in-out 0.3s infinite' }}
          />
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`grid ${avatarSize} shrink-0 place-items-center rounded-md font-black tracking-tight`}
            style={{
              color: accent,
              background: `color-mix(in oklch, ${accent} 16%, var(--color-bg))`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 40%, transparent)`,
            }}
          >
            {initials(player.name)}
          </div>
          <div className="min-w-0">
            <div className={`truncate font-extrabold tracking-tight ${nameSize}`} style={{ textWrap: 'balance' }}>
              {player.name}
            </div>
            <div className="mt-1">
              {tier ? <TierBadge tier={tier} size="sm" /> : <span className="text-xs text-ink-faint">no torneio</span>}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right leading-none">
          <div className={`tnum font-mono font-black ${ovrSize}`} style={{ color: accent }}>{ovr}</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Overall</div>
        </div>
      </div>

      {size !== 'sm' && (
        <div className="relative mt-4">
          <StatBars player={player} animate={animate} />
        </div>
      )}
    </div>
  );
}
