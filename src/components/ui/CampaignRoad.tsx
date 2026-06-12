import type { RunPhase, RunState } from '../../engine/run';

const STEPS: { key: Exclude<RunPhase, 'ROLL' | 'CHAMPION' | 'ELIMINATED'>; label: string }[] = [
  { key: 'GROUPS', label: 'Grupos' },
  { key: 'R16', label: 'Oitavas' },
  { key: 'QF', label: 'Quartas' },
  { key: 'SF', label: 'Semi' },
  { key: 'FINAL', label: 'Final' },
];

type Status = 'done' | 'current' | 'lost' | 'todo';

const STYLE: Record<Status, { dot: string; ring: string; text: string }> = {
  done: { dot: 'var(--color-accent)', ring: 'var(--color-accent)', text: 'text-ink' },
  current: { dot: 'var(--color-accent-2)', ring: 'var(--color-accent-2)', text: 'text-accent-2' },
  lost: { dot: 'var(--color-kill)', ring: 'var(--color-kill)', text: 'text-kill' },
  todo: { dot: 'var(--color-line)', ring: 'var(--color-line)', text: 'text-ink-faint' },
};

/** Trilha horizontal da campanha: Grupos · Oitavas · Quartas · Semi · Final. */
export function CampaignRoad({ run }: { run: RunState }) {
  const idx = STEPS.findIndex((s) => s.key === run.phase);
  const lostIdx = run.phase === 'ELIMINATED'
    ? STEPS.findIndex((s) => s.key === run.eliminatedAt)
    : -1;
  const champion = run.phase === 'CHAMPION';

  const statusOf = (i: number): Status => {
    if (champion) return 'done';
    if (run.phase === 'ELIMINATED') return i < lostIdx ? 'done' : i === lostIdx ? 'lost' : 'todo';
    return i < idx ? 'done' : i === idx ? 'current' : 'todo';
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
      {STEPS.map((s, i) => {
        const st = statusOf(i);
        const sty = STYLE[st];
        return (
          <div key={s.key} className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-2.5 w-2.5 rounded-full ${st === 'current' ? 'dot-pulse' : ''}`}
                style={{
                  background: st === 'todo' ? 'transparent' : sty.dot,
                  boxShadow: `inset 0 0 0 1.5px ${sty.ring}${st === 'done' || st === 'current' || st === 'lost' ? `, 0 0 8px -1px ${sty.dot}` : ''}`,
                }}
              />
              <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${sty.text} sm:text-[10px]`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="mb-3.5 h-px w-4 sm:w-7"
                style={{ background: i < (champion ? STEPS.length : run.phase === 'ELIMINATED' ? lostIdx : idx) ? 'var(--color-accent)' : 'var(--color-line)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
