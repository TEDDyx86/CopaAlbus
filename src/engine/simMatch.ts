import type { MatchResult, Player, WinType } from '../types';
import { pickIndexWeighted, type Rng } from './rng';

export const PULL = 4;             // o quanto a frente "forte" domina o sorteio
export const SCALE = 10;           // sensibilidade da disputa dentro da frente
export const FORM_AMPLITUDE = 6;   // amplitude da "forma do dia"

const FRONTS: WinType[] = ['kill', 'farm', 'torre'];

export function simMatch(a: Player, b: Player, rng: Rng): MatchResult {
  // Passo 1 — frente onde o X1 se decide
  const weights = FRONTS.map((f) => Math.pow(Math.max(a[f], b[f]), PULL));
  const winType = FRONTS[pickIndexWeighted(weights, rng)];

  // Passo 2 — quem vence naquela frente
  const formA = (rng() * 2 - 1) * FORM_AMPLITUDE;
  const formB = (rng() * 2 - 1) * FORM_AMPLITUDE;
  const effA = a[winType] + formA;
  const effB = b[winType] + formB;
  const pA = 1 / (1 + Math.pow(10, (effB - effA) / SCALE));
  const aWins = rng() < pA;

  const winnerId = aWins ? a.id : b.id;
  const loserId = aWins ? b.id : a.id;
  const formWinner = aWins ? formA : formB;
  const formLoser = aWins ? formB : formA;
  const effWinner = aWins ? effA : effB;
  const effLoser = aWins ? effB : effA;

  return {
    winnerId,
    loserId,
    winType,
    decisiveness: effWinner - effLoser,
    formWinner,
    formLoser,
  };
}
