import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { TIERS } from '../../engine/fighterRoll';
import { Button } from '../ui/Button';
import { Brand } from '../ui/Brand';
import { TIER_META } from '../ui/tiers';

export function HomeScreen() {
  const { newGame, hall } = useGame();

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-10">
      {/* hero */}
      <section className="relative pt-10 text-center anim-rise">
        <div className="mb-6 flex justify-center">
          <Brand size="md" />
        </div>

        <h1
          className="mx-auto font-extrabold leading-[0.95] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(2.6rem, 8.5vw, 5rem)', textWrap: 'balance' }}
        >
          <span className="block text-ink">Copa</span>
          <span
            className="block"
            style={{ color: 'var(--color-accent)', textShadow: '0 0 40px color-mix(in oklch, var(--color-accent) 45%, transparent)' }}
          >
            Albus Nexus
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-balance text-ink-muted">
          7 a 0, mas de X1 de LoL. O destino sorteia seu fighter entre os 28 do grupo.
          Você só torce, sua e xinga até a final.
        </p>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={newGame}>⚡ Nova Copa</Button>
        </div>

        {/* legenda de raridade */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          {TIERS.map((t) => {
            const m = TIER_META[t.tier];
            return (
              <span key={t.tier} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 8px -1px ${m.color}` }} />
                <span className="font-semibold" style={{ color: m.color }}>{m.label}</span>
                <span className="tnum font-mono text-ink-faint">{(t.chance * 100).toFixed(0)}%</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* hall da fama */}
      <section className="mt-14">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ink-muted">
            <span aria-hidden>🏆</span> Hall da Fama
          </h2>
          {hall.length > 0 && (
            <span className="tnum font-mono text-xs text-ink-faint">{hall.length} {hall.length === 1 ? 'copa' : 'copas'}</span>
          )}
        </div>

        {hall.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line px-6 py-10 text-center text-ink-faint">
            Ninguém levantou a taça ainda. Bora ser o primeiro?
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {hall.map((e, i) => (
              <li
                key={`${e.seed}-${i}`}
                className="flex items-center gap-3 rounded-md bg-surface/60 px-4 py-3 ring-1 ring-line"
              >
                <span className="tnum w-6 shrink-0 text-center font-mono text-sm font-black text-ink-faint">{i + 1}</span>
                <span aria-hidden className="text-lg">{i === 0 ? '🥇' : '🏅'}</span>
                <span className="flex-1 truncate font-bold text-ink">{e.champion}</span>
                <span className="hidden truncate text-xs text-ink-faint sm:block">
                  seu fighter: <span className="text-ink-muted">{byId[e.fighterId]?.name ?? e.fighterId}</span>
                </span>
                <span className="tnum shrink-0 font-mono text-[11px] text-ink-faint">
                  {new Date(e.date).toLocaleDateString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
