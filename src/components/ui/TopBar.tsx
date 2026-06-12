import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import type { Phase } from '../../engine/tournament';
import { Brand } from './Brand';

const PHASE_LABEL: Record<Phase, string> = {
  ROLL_FIGHTER: 'Sorteio do fighter',
  DRAW: 'Sorteio dos grupos',
  GROUP_STAGE: 'Fase de grupos',
  R16: 'Oitavas',
  QF: 'Quartas',
  SF: 'Semifinal',
  BRONZE: 'Disputa de 3º',
  FINAL: 'Final',
  CHAMPION: 'Campeão',
};

export function TopBar() {
  const { game, goHome } = useGame();
  if (!game) return null;
  const fighter = game.fighterId ? byId[game.fighterId] : null;

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button onClick={goHome} className="transition-opacity hover:opacity-80" aria-label="Voltar à capa">
          <Brand size="sm" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-surface/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted ring-1 ring-line sm:inline-flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
            Ao vivo
          </span>
          <span className="rounded-full bg-surface/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink ring-1 ring-line">
            {PHASE_LABEL[game.phase]}
          </span>
          {fighter && (
            <span className="flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1 text-xs font-bold text-accent ring-1 ring-accent/40">
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-accent/70 sm:inline">seu fighter</span>
              {fighter.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
