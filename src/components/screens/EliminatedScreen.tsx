import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { reachedLabel } from '../../engine/run';
import { FighterCard } from '../ui/FighterCard';
import { CampaignRoad } from '../ui/CampaignRoad';
import { Button } from '../ui/Button';

export function EliminatedScreen() {
  const { game, newGame, goHome } = useGame();
  if (!game || game.phase !== 'ELIMINATED') return null;

  const fighter = byId[game.fighterId];
  const reached = reachedLabel(game);
  const isVice = game.eliminatedAt === 'FINAL';

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12 text-center">
      <div className="anim-rise">
        <div className="text-5xl">{isVice ? '🥈' : '🫡'}</div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-ink-faint">Fim da campanha</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: isVice ? 'var(--color-comum)' : 'var(--color-kill)' }}>
          {reached}
        </h2>
        <p className="mt-3 text-sm text-ink-muted">
          {isVice
            ? `${fighter.name} foi até a Final, mas a taça escapou. Quase.`
            : `A campanha de ${fighter.name} parou aqui. Da próxima vez vai.`}
        </p>
      </div>

      <div className="mt-7">
        <FighterCard player={fighter} tier={game.fighterTier} size="lg" dimmed />
      </div>

      <div className="mt-7">
        <CampaignRoad run={game} />
      </div>

      <div className="mt-9 flex flex-col gap-3">
        <Button size="lg" onClick={newGame}>🔁 Nova campanha</Button>
        <Button variant="ghost" onClick={goHome}>🏠 Capa / Hall da Fama</Button>
      </div>
    </div>
  );
}
