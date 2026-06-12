import { shuffle, type Rng } from './rng';

export interface Group {
  name: string;
  playerIds: string[];
}

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export function drawGroups(playerIds: string[], rng: Rng): Group[] {
  if (playerIds.length !== 28) {
    throw new Error(`drawGroups requer 28 jogadores, recebeu ${playerIds.length}`);
  }
  const shuffled = shuffle(playerIds, rng);
  return GROUP_NAMES.map((name, g) => ({
    name,
    playerIds: shuffled.slice(g * 4, g * 4 + 4),
  }));
}
