// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from './App';
import { GameProvider } from './store/GameProvider';

function renderApp() {
  return render(
    <GameProvider>
      <App />
    </GameProvider>,
  );
}

// clica em um botão cujo texto casa com o regex, se existir; retorna true se clicou
function clickIf(re: RegExp): boolean {
  const btn = screen.queryAllByRole('button').find((b) => re.test(b.textContent ?? ''));
  if (!btn) return false;
  act(() => { fireEvent.click(btn); });
  return true;
}

describe('App (smoke / jornada completa)', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('renderiza a capa', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /Nova Copa/ })).toBeTruthy();
    expect(screen.getByText(/Hall da Fama/)).toBeTruthy();
  });

  it('joga uma Copa do início ao fim sem erro de runtime', () => {
    renderApp();

    // Capa → roll
    expect(clickIf(/Nova Copa/)).toBe(true);
    // Roll → fica com o fighter sorteado
    expect(clickIf(/Ficar com/)).toBe(true);
    // Draw → começa a Copa
    expect(clickIf(/Começar a Copa/)).toBe(true);

    // Fase de grupos: 3 rodadas
    let guard = 0;
    while (clickIf(/Jogar rodada/)) {
      if (++guard > 5) throw new Error('loop de fase de grupos não terminou');
    }

    // Mata-mata: clica em "Jogar <fase>" até virar campeão
    guard = 0;
    while (!screen.queryByText(/Campeão da Copa Albus Nexus/)) {
      const clicked = clickIf(/^Jogar /);
      if (!clicked) break;
      if (++guard > 10) throw new Error('loop do mata-mata não terminou');
    }

    // Chegou no campeão
    expect(screen.getByText(/Campeão da Copa Albus Nexus/)).toBeTruthy();
  });
});
