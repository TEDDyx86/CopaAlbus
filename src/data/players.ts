import type { Player } from '../types';

export const players: Player[] = [
  { id: 'boelitz', name: 'Boelitz', kill: 99, farm: 99, torre: 99 },
  { id: 'gilmar', name: 'Gilmar', kill: 98, farm: 94, torre: 93 },
  { id: 'jon', name: 'Jon', kill: 89, farm: 90, torre: 94 },
  { id: 'leozao', name: 'Leozão', kill: 94, farm: 89, torre: 87 },
  { id: 'osni', name: 'Osni', kill: 88, farm: 94, torre: 88 },
  { id: 'ana-bueno', name: 'Ana Bueno', kill: 87, farm: 88, torre: 92 },
  { id: 'grein', name: 'Grein', kill: 92, farm: 87, torre: 85 },
  { id: 'giovani', name: 'Giovani', kill: 86, farm: 92, torre: 86 },
  { id: 'teddy', name: 'Teddy', kill: 85, farm: 86, torre: 90 },
  { id: 'bruno', name: 'Bruno', kill: 91, farm: 86, torre: 84 },
  { id: 'kaminski', name: 'Kaminski', kill: 84, farm: 90, torre: 84 },
  { id: 'leo-magro', name: 'Leo Magro', kill: 84, farm: 85, torre: 89 },
  { id: 'jackson', name: 'Jackson', kill: 89, farm: 84, torre: 82 },
  { id: 'luis020', name: 'Luis020', kill: 81, farm: 87, torre: 81 },
  { id: 'pedro-rush', name: 'Pedro Rush', kill: 88, farm: 81, torre: 80 },
  { id: 'badasento', name: 'Badasento', kill: 80, farm: 81, torre: 85 },
  { id: 'marquinho', name: 'Marquinho', kill: 80, farm: 86, torre: 80 },
  { id: 'jonata', name: 'Jonata', kill: 85, farm: 80, torre: 78 },
  { id: 'le3', name: 'Le3', kill: 78, farm: 79, torre: 83 },
  { id: 'victor-vbabao', name: 'Victor Vbabao', kill: 78, farm: 84, torre: 78 },
  { id: 'vanzela', name: 'Vanzela', kill: 84, farm: 79, torre: 77 },
  { id: 'jao', name: 'Jao', kill: 77, farm: 78, torre: 82 },
  { id: 'thiago', name: 'Thiago', kill: 77, farm: 83, torre: 77 },
  { id: 'bato', name: 'Bato', kill: 82, farm: 77, torre: 75 },
  { id: 'daniel', name: 'Daniel', kill: 75, farm: 76, torre: 80 },
  { id: 'yan', name: 'Yan', kill: 75, farm: 81, torre: 75 },
  { id: 'augusto', name: 'Augusto', kill: 80, farm: 75, torre: 73 },
  { id: 'tuco', name: 'Tuco', kill: 52, farm: 76, torre: 52 },
];

export const byId: Record<string, Player> = Object.fromEntries(
  players.map((p) => [p.id, p]),
);
