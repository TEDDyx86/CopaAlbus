import { useGame } from './store/GameProvider';
import { HomeScreen } from './components/screens/HomeScreen';
import { RollFighterScreen } from './components/screens/RollFighterScreen';
import { GroupRunScreen } from './components/screens/GroupRunScreen';
import { SeriesScreen } from './components/screens/SeriesScreen';
import { ChampionScreen } from './components/screens/ChampionScreen';
import { EliminatedScreen } from './components/screens/EliminatedScreen';

export function App() {
  const { game } = useGame();

  if (!game) return <HomeScreen />;

  switch (game.phase) {
    case 'ROLL':
      return <RollFighterScreen />;
    case 'GROUPS':
      return <GroupRunScreen />;
    case 'R16':
    case 'QF':
    case 'SF':
    case 'FINAL':
      return <SeriesScreen />;
    case 'CHAMPION':
      return <ChampionScreen />;
    case 'ELIMINATED':
      return <EliminatedScreen />;
  }
}
