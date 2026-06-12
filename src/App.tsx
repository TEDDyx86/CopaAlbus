import { useGame } from './store/GameProvider';
import { HomeScreen } from './components/screens/HomeScreen';
import { RollFighterScreen } from './components/screens/RollFighterScreen';
import { DrawScreen } from './components/screens/DrawScreen';
import { TournamentHub } from './components/screens/TournamentHub';
import { BracketScreen } from './components/screens/BracketScreen';
import { ChampionScreen } from './components/screens/ChampionScreen';

export function App() {
  const { game } = useGame();

  if (!game) return <HomeScreen />;

  switch (game.phase) {
    case 'ROLL_FIGHTER':
      return <RollFighterScreen />;
    case 'DRAW':
      return <DrawScreen />;
    case 'GROUP_STAGE':
      return <TournamentHub />;
    case 'R16':
    case 'QF':
    case 'SF':
    case 'BRONZE':
    case 'FINAL':
      return <BracketScreen />;
    case 'CHAMPION':
      return <ChampionScreen />;
    default:
      return <Placeholder phase={game.phase} />;
  }
}

function Placeholder({ phase }: { phase: string }) {
  const { goHome } = useGame();
  return (
    <div className="grid min-h-full place-items-center gap-4">
      <p className="text-white/60">Tela "{phase}" em construção…</p>
      <button onClick={goHome} className="rounded bg-panel-2 px-4 py-2 text-sm ring-1 ring-line">
        ← Voltar à capa
      </button>
    </div>
  );
}
