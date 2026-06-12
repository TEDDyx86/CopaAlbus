// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from './App';
import { GameProvider } from './store/GameProvider';
import { saveGame } from './store/persistence';
import {
  createRun, keepFighter, playGroupGame, playSeriesGame, advance,
  type RunState, type SeriesKey,
} from './engine/run';

function renderApp() {
  return render(
    <GameProvider>
      <App />
    </GameProvider>,
  );
}

// clica no primeiro botão cujo texto casa com o regex; retorna true se clicou
function clickIf(re: RegExp): boolean {
  const btn = screen.queryAllByRole('button').find((b) => re.test(b.textContent ?? ''));
  if (!btn) return false;
  act(() => { fireEvent.click(btn); });
  return true;
}

// roda a campanha no engine até um estado terminal (sem React)
function driveRun(seed: number): RunState {
  let s = keepFighter(createRun(seed));
  let guard = 0;
  while (s.phase !== 'CHAMPION' && s.phase !== 'ELIMINATED') {
    if (s.phase === 'GROUPS') {
      s = s.group.some((g) => !g.result) ? playGroupGame(s) : advance(s);
    } else {
      s = s.knockout[s.phase as SeriesKey]!.decided ? advance(s) : playSeriesGame(s);
    }
    if (++guard > 1000) throw new Error('run não terminou');
  }
  return s;
}

function findSeed(pred: (s: RunState) => boolean): RunState {
  for (let seed = 1; seed < 6000; seed++) {
    const s = driveRun(seed);
    if (pred(s)) return s;
  }
  throw new Error('nenhuma seed encontrada para o predicado');
}

describe('App (smoke / jornada completa)', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
    // jsdom não implementa canvas 2D; retornar null silencia o aviso e desliga o confete.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('renderiza a capa', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /Nova campanha/ })).toBeTruthy();
    expect(screen.getByText(/Suas campanhas/)).toBeTruthy();
  });

  it('joga uma campanha do início ao fim (terminal) sem erro de runtime', () => {
    renderApp();

    expect(clickIf(/Nova campanha/)).toBe(true);   // capa → roll
    expect(clickIf(/Ficar com/)).toBe(true);       // roll → grupos

    const TERMINAL = /Campeão da Copa Albus Nexus|Fim da campanha/;
    const ADVANCE = /Jogar jogo|Avançar|Erguer a taça|Ver resumo/;
    let guard = 0;
    while (!screen.queryByText(TERMINAL)) {
      if (!clickIf(ADVANCE)) break;
      if (++guard > 60) throw new Error('jornada não terminou');
    }

    expect(screen.getByText(TERMINAL)).toBeTruthy();
  });

  it('renderiza a tela de campeão para uma campanha vencedora', () => {
    saveGame(findSeed((s) => s.phase === 'CHAMPION'));
    renderApp();
    expect(screen.getByText(/Campeão da Copa Albus Nexus/)).toBeTruthy();
    expect(screen.getByText(/A caminhada até o título/)).toBeTruthy();
  });

  it('renderiza a tela de eliminado para uma campanha encerrada', () => {
    saveGame(findSeed((s) => s.phase === 'ELIMINATED'));
    renderApp();
    expect(screen.getByText(/Fim da campanha/)).toBeTruthy();
  });
});
