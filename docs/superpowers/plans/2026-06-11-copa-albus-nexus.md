# Copa Albus Nexus — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um jogo web (single-player, sem backend) que simula uma "Copa do Mundo" de X1 de League of Legends entre os 28 membros do Albus Nexus, com fighter sorteado estilo gacha, motor de zebra por atributos (kill/farm/torre) e jornada com suspense até a final.

**Architecture:** Núcleo de regras em funções puras e determinísticas (`engine/`), dirigidas por um PRNG com estado serializável. Uma `GameState` única descreve toda a Copa e é avançada por transições puras (`tournament.ts`). A camada React (`store/` + `components/`) só renderiza e dispara transições; persiste em `localStorage`. Engine 100% testado em Vitest (TDD); UI verificada rodando o app.

**Tech Stack:** React 19 + Vite 6 + TypeScript 5 + Tailwind v4 (plugin Vite) + Vitest 3.

---

## Estrutura de arquivos

```
7-0Albus/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts                 # Player, WinType, Tier, MatchResult, overall()
│   ├── data/
│   │   └── players.ts           # 28 jogadores + byId
│   ├── engine/
│   │   ├── rng.ts               # PRNG serializável, shuffle, pickIndexWeighted
│   │   ├── rng.test.ts
│   │   ├── fighterRoll.ts       # tiers de raridade + roll()
│   │   ├── fighterRoll.test.ts
│   │   ├── simMatch.ts          # motor da partida (2 passos)
│   │   ├── simMatch.test.ts
│   │   ├── draw.ts              # sorteio dos 7 grupos
│   │   ├── draw.test.ts
│   │   ├── groupStage.ts        # fixtures, standings, classificados
│   │   ├── groupStage.test.ts
│   │   ├── bracket.ts           # seed do mata-mata + pareamento
│   │   ├── bracket.test.ts
│   │   ├── tournament.ts        # GameState + transições (máquina de estados)
│   │   └── tournament.test.ts
│   ├── store/
│   │   ├── persistence.ts       # load/save localStorage
│   │   └── GameProvider.tsx     # contexto React + ações
│   └── components/
│       ├── ui/
│       │   ├── PlayerCard.tsx
│       │   ├── StatBadges.tsx
│       │   ├── WinTypeTag.tsx
│       │   └── GroupTable.tsx
│       └── screens/
│           ├── HomeScreen.tsx
│           ├── RollFighterScreen.tsx
│           ├── DrawScreen.tsx
│           ├── TournamentHub.tsx
│           ├── MatchScreen.tsx
│           ├── BracketScreen.tsx
│           └── ChampionScreen.tsx
```

**Convenção de commit:** mensagens em português, prefixo `feat:`/`test:`/`chore:`, e rodapé:
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
(Os exemplos abaixo omitem o rodapé por brevidade — sempre inclua.)

---

## Task 1: Scaffold do projeto (Vite + React + TS + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "copa-albus-nexus",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/7-0Albus/', // nome do repo, para GitHub Pages (ajuste se publicar noutro caminho)
  plugins: [react(), tailwindcss()],
  test: { environment: 'node', globals: true },
});
```

- [ ] **Step 4: Criar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Copa Albus Nexus</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Criar `src/index.css`** (Tailwind v4 + tema dark/neon)

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0e14;
  --color-panel: #121a26;
  --color-panel-2: #1a2434;
  --color-line: #243245;
  --color-neon: #2de2e6;
  --color-neon-2: #ff2e97;
  --color-kill: #ff4d4d;
  --color-farm: #ffd23f;
  --color-torre: #5b8cff;
  --color-lendario: #ffb300;
  --color-epico: #b14dff;
  --color-raro: #2d8cff;
  --color-comum: #8aa0b3;
}

html, body, #root { height: 100%; }
body {
  margin: 0;
  background: var(--color-bg);
  color: #e6eef7;
  font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif;
}
```

- [ ] **Step 6: Criar `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: Criar `src/App.tsx` provisório**

```tsx
export function App() {
  return (
    <div className="min-h-full grid place-items-center">
      <h1 className="text-4xl font-black text-neon">Copa Albus Nexus</h1>
    </div>
  );
}
```

- [ ] **Step 8: Instalar dependências**

Run: `npm install`
Expected: instala sem erros; cria `node_modules/` e `package-lock.json`.

- [ ] **Step 9: Verificar typecheck e dev server**

Run: `npm run build`
Expected: `tsc --noEmit` passa e `vite build` gera `dist/` sem erros.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

## Task 2: Tipos base e dados do elenco

**Files:**
- Create: `src/types.ts`, `src/data/players.ts`, `src/data/players.test.ts`

- [ ] **Step 1: Escrever teste do elenco** (`src/data/players.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { players, byId } from './players';
import { overall } from '../types';

describe('players', () => {
  it('tem 28 jogadores', () => {
    expect(players).toHaveLength(28);
  });

  it('ids são únicos e não vazios', () => {
    const ids = new Set(players.map((p) => p.id));
    expect(ids.size).toBe(28);
    expect(players.every((p) => p.id.length > 0)).toBe(true);
  });

  it('byId resolve todo jogador', () => {
    for (const p of players) expect(byId[p.id]).toBe(p);
  });

  it('overall = média arredondada dos três atributos', () => {
    expect(overall({ id: 'x', name: 'X', kill: 99, farm: 99, torre: 99 })).toBe(99);
    expect(overall({ id: 'y', name: 'Y', kill: 52, farm: 76, torre: 52 })).toBe(60);
  });

  it('Boelitz é 99/99/99 e Tuco 52/76/52', () => {
    expect(byId['boelitz']).toMatchObject({ kill: 99, farm: 99, torre: 99 });
    expect(byId['tuco']).toMatchObject({ kill: 52, farm: 76, torre: 52 });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- players`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Criar `src/types.ts`**

```ts
export type WinType = 'kill' | 'farm' | 'torre';
export type Tier = 'lendario' | 'epico' | 'raro' | 'comum';

export interface Player {
  id: string;
  name: string;
  kill: number;
  farm: number;
  torre: number;
}

export interface MatchResult {
  winnerId: string;
  loserId: string;
  winType: WinType;
  decisiveness: number;
  formWinner: number;
  formLoser: number;
}

export function overall(p: Player): number {
  return Math.round((p.kill + p.farm + p.torre) / 3);
}
```

- [ ] **Step 4: Criar `src/data/players.ts`** (valores do spec)

```ts
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
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- players`
Expected: PASS (todos os testes).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tipos base e elenco dos 28 do Albus Nexus"
```

---

## Task 3: PRNG serializável e helpers (`engine/rng.ts`)

**Files:**
- Create: `src/engine/rng.ts`, `src/engine/rng.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/rng.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng, shuffle, pickIndexWeighted } from './rng';

describe('makeRng', () => {
  it('é determinístico para a mesma seed', () => {
    const a = makeRng(123);
    const b = makeRng(123);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it('retorna valores em [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('state permite retomar a sequência exatamente', () => {
    const r = makeRng(42);
    r.next(); r.next();
    const saved = r.state;
    const expected = [r.next(), r.next()];
    const resumed = makeRng(saved);
    expect([resumed.next(), resumed.next()]).toEqual(expected);
  });
});

describe('shuffle', () => {
  it('mantém os mesmos elementos', () => {
    const r = makeRng(1);
    const out = shuffle([1, 2, 3, 4, 5], r.next);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it('não muta o array original', () => {
    const r = makeRng(1);
    const src = [1, 2, 3];
    shuffle(src, r.next);
    expect(src).toEqual([1, 2, 3]);
  });
});

describe('pickIndexWeighted', () => {
  it('respeita as proporções dos pesos', () => {
    const r = makeRng(99);
    const counts = [0, 0, 0];
    for (let i = 0; i < 30000; i++) counts[pickIndexWeighted([1, 0, 9], r.next)]++;
    expect(counts[1]).toBe(0);                  // peso 0 nunca sai
    expect(counts[2]).toBeGreaterThan(counts[0] * 5); // ~9x mais que o índice 0
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- rng`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/engine/rng.ts`**

```ts
export type Rng = () => number;

export interface SeededRng {
  next: Rng;
  readonly state: number;
}

/** mulberry32 — PRNG rápido cujo estado é um único inteiro de 32 bits (serializável). */
export function makeRng(seed: number): SeededRng {
  let a = seed >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return a >>> 0;
    },
  };
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sorteia um índice proporcional aos pesos (pesos >= 0, soma > 0). */
export function pickIndexWeighted(weights: number[], rng: Rng): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- rng`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: PRNG serializável (mulberry32) + shuffle e sorteio ponderado"
```

---

## Task 4: Roll do fighter por tier de raridade (`engine/fighterRoll.ts`)

**Files:**
- Create: `src/engine/fighterRoll.ts`, `src/engine/fighterRoll.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/fighterRoll.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { roll, tierOf, TIERS } from './fighterRoll';
import { byId } from '../data/players';

describe('tierOf', () => {
  it('classifica pelos limites de overall', () => {
    expect(tierOf(byId['boelitz'])).toBe('lendario'); // 99
    expect(tierOf(byId['jon'])).toBe('epico');        // 91
    expect(tierOf(byId['teddy'])).toBe('raro');       // 87
    expect(tierOf(byId['tuco'])).toBe('comum');       // 60
  });
});

describe('roll', () => {
  it('frequência por tier aproxima as chances definidas', () => {
    const r = makeRng(2026);
    const counts: Record<string, number> = { lendario: 0, epico: 0, raro: 0, comum: 0 };
    const N = 40000;
    for (let i = 0; i < N; i++) counts[roll(r.next).tier]++;
    for (const t of TIERS) {
      expect(counts[t.tier] / N).toBeCloseTo(t.chance, 1); // tolerância 0.05
    }
  });

  it('craque (lendário) cai bem menos que comum', () => {
    const r = makeRng(5);
    let lend = 0, comum = 0;
    for (let i = 0; i < 20000; i++) {
      const t = roll(r.next).tier;
      if (t === 'lendario') lend++;
      if (t === 'comum') comum++;
    }
    expect(comum).toBeGreaterThan(lend * 5);
  });

  it('reroll com excludeId nunca devolve o fighter atual', () => {
    const r = makeRng(77);
    for (let i = 0; i < 5000; i++) {
      expect(roll(r.next, 'boelitz').fighter.id).not.toBe('boelitz');
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- fighterRoll`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/fighterRoll.ts`**

```ts
import type { Player, Tier } from '../types';
import { overall } from '../types';
import { players } from '../data/players';
import { pickIndexWeighted, type Rng } from './rng';

export interface TierDef {
  tier: Tier;
  label: string;
  min: number; // overall mínimo (inclusivo)
  max: number; // overall máximo (inclusivo)
  chance: number;
}

export const TIERS: TierDef[] = [
  { tier: 'lendario', label: 'Lendário', min: 95, max: 999, chance: 0.04 },
  { tier: 'epico', label: 'Épico', min: 88, max: 94, chance: 0.16 },
  { tier: 'raro', label: 'Raro', min: 82, max: 87, chance: 0.35 },
  { tier: 'comum', label: 'Comum', min: 0, max: 81, chance: 0.45 },
];

export function tierOf(p: Player): Tier {
  const o = overall(p);
  return TIERS.find((t) => o >= t.min && o <= t.max)!.tier;
}

export interface RollResult {
  fighter: Player;
  tier: Tier;
}

export function roll(rng: Rng, excludeId?: string): RollResult {
  const pool = players.filter((p) => p.id !== excludeId);
  const present = TIERS.filter((t) => pool.some((p) => tierOf(p) === t.tier));
  const chosen = present[pickIndexWeighted(present.map((t) => t.chance), rng)];
  const candidates = pool.filter((p) => tierOf(p) === chosen.tier);
  const fighter = candidates[Math.floor(rng() * candidates.length)];
  return { fighter, tier: chosen.tier };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- fighterRoll`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: roll do fighter por tiers de raridade (gacha)"
```

---

## Task 5: Motor da partida em dois passos (`engine/simMatch.ts`)

**Files:**
- Create: `src/engine/simMatch.ts`, `src/engine/simMatch.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/simMatch.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { simMatch } from './simMatch';
import type { Player } from '../types';

const P = (id: string, kill: number, farm: number, torre: number): Player => ({ id, name: id, kill, farm, torre });

describe('simMatch', () => {
  it('vencedor e perdedor são sempre os dois participantes', () => {
    const r = makeRng(1);
    const a = P('a', 80, 80, 80), b = P('b', 70, 70, 70);
    for (let i = 0; i < 1000; i++) {
      const res = simMatch(a, b, r.next);
      expect([a.id, b.id]).toContain(res.winnerId);
      expect([a.id, b.id]).toContain(res.loserId);
      expect(res.winnerId).not.toBe(res.loserId);
    }
  });

  it('favorito forte em tudo vence a grande maioria', () => {
    const r = makeRng(10);
    const forte = P('forte', 95, 95, 95), fraco = P('fraco', 70, 70, 70);
    let wins = 0;
    for (let i = 0; i < 5000; i++) if (simMatch(forte, fraco, r.next).winnerId === 'forte') wins++;
    expect(wins / 5000).toBeGreaterThan(0.9);
  });

  it('a partida tende à frente onde alguém é forte', () => {
    const r = makeRng(20);
    // ambos fortes só em farm, fracos em kill/torre
    const a = P('a', 50, 95, 50), b = P('b', 50, 90, 50);
    const counts: Record<string, number> = { kill: 0, farm: 0, torre: 0 };
    for (let i = 0; i < 5000; i++) counts[simMatch(a, b, r.next).winType]++;
    expect(counts.farm).toBeGreaterThan(counts.kill + counts.torre);
  });

  it('especialista cria zebra na sua frente, mas apanha fora dela', () => {
    const r = makeRng(30);
    // azarão só forte em farm; favorito generalista mais alto, mas farm modesto
    const azarao = P('azarao', 52, 80, 52);
    const favorito = P('favorito', 86, 70, 86); // overall maior, farm pior
    let zebrasNoFarm = 0, jogosNoFarm = 0;
    for (let i = 0; i < 8000; i++) {
      const res = simMatch(azarao, favorito, r.next);
      if (res.winType === 'farm') {
        jogosNoFarm++;
        if (res.winnerId === 'azarao') zebrasNoFarm++;
      }
    }
    // quando cai no farm, o azarão (farm 80 vs 70) vence com frequência perceptível
    expect(jogosNoFarm).toBeGreaterThan(0);
    expect(zebrasNoFarm / jogosNoFarm).toBeGreaterThan(0.4);
  });

  it('é determinístico para a mesma seed', () => {
    const a = P('a', 88, 81, 80), b = P('b', 80, 86, 80);
    const r1 = makeRng(555), r2 = makeRng(555);
    expect(simMatch(a, b, r1.next)).toEqual(simMatch(a, b, r2.next));
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- simMatch`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/simMatch.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- simMatch`
Expected: PASS. (Se a frequência de zebra ficar fora do limiar, ajuste `SCALE`/`FORM_AMPLITUDE` — são constantes de tuning. Não relaxe o teste sem motivo.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: motor da partida em 2 passos (frente + disputa, com zebra por especialização)"
```

---

## Task 6: Sorteio dos grupos (`engine/draw.ts`)

**Files:**
- Create: `src/engine/draw.ts`, `src/engine/draw.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/draw.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { drawGroups, GROUP_NAMES } from './draw';
import { players } from '../data/players';

const ids = () => players.map((p) => p.id);

describe('drawGroups', () => {
  it('produz 7 grupos de 4 com os 28 ids, sem repetição', () => {
    const groups = drawGroups(ids(), makeRng(1).next);
    expect(groups).toHaveLength(7);
    expect(groups.map((g) => g.name)).toEqual([...GROUP_NAMES]);
    const all = groups.flatMap((g) => g.playerIds);
    expect(all).toHaveLength(28);
    expect(new Set(all).size).toBe(28);
    expect(groups.every((g) => g.playerIds.length === 4)).toBe(true);
  });

  it('seeds diferentes geram distribuições diferentes', () => {
    const a = drawGroups(ids(), makeRng(1).next);
    const b = drawGroups(ids(), makeRng(2).next);
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it('rejeita quando não há exatamente 28 jogadores', () => {
    expect(() => drawGroups(['a', 'b'], makeRng(1).next)).toThrow();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- draw`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/draw.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- draw`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: sorteio 100% aleatório dos 7 grupos"
```

---

## Task 7: Fase de grupos — fixtures, tabelas e classificados (`engine/groupStage.ts`)

**Files:**
- Create: `src/engine/groupStage.ts`, `src/engine/groupStage.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/groupStage.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import {
  makeGroupFixtures,
  computeGroupStandings,
  selectQualifiers,
  type GroupMatch,
} from './groupStage';
import type { Group } from './draw';
import type { Player, MatchResult } from '../types';

const P = (id: string, k = 80, f = 80, t = 80): Player => ({ id, name: id, kill: k, farm: f, torre: t });

const four = (a: string, b: string, c: string, d: string): Group => ({
  name: 'A',
  playerIds: [a, b, c, d],
});

const win = (g: string, round: number, w: string, l: string): GroupMatch => ({
  group: g,
  round,
  aId: w,
  bId: l,
  result: { winnerId: w, loserId: l, winType: 'kill', decisiveness: 1, formWinner: 0, formLoser: 0 } as MatchResult,
});

describe('makeGroupFixtures', () => {
  it('gera 6 jogos por grupo em 3 rodadas', () => {
    const groups: Group[] = [four('a', 'b', 'c', 'd')];
    const fixtures = makeGroupFixtures(groups);
    expect(fixtures).toHaveLength(6);
    expect(fixtures.filter((m) => m.round === 1)).toHaveLength(2);
    expect(fixtures.filter((m) => m.round === 2)).toHaveLength(2);
    expect(fixtures.filter((m) => m.round === 3)).toHaveLength(2);
    // cada jogador joga 3 vezes
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(fixtures.filter((m) => m.aId === id || m.bId === id)).toHaveLength(3);
    }
  });
});

describe('computeGroupStandings', () => {
  const byId: Record<string, Player> = {
    a: P('a'), b: P('b'), c: P('c'), d: P('d', 80, 80, 99), // d com overall maior p/ desempate
  };
  const group = four('a', 'b', 'c', 'd');

  it('ordena por pontos (3 por vitória)', () => {
    // a vence todos; b vence c e d; c vence d
    const matches: GroupMatch[] = [
      win('A', 1, 'a', 'b'), win('A', 1, 'c', 'd'),
      win('A', 2, 'a', 'c'), win('A', 2, 'b', 'd'),
      win('A', 3, 'a', 'd'), win('A', 3, 'b', 'c'),
    ];
    const s = computeGroupStandings(group, matches, byId, makeRng(1).next);
    expect(s.map((x) => x.playerId)).toEqual(['a', 'b', 'c', 'd']);
    expect(s[0].points).toBe(9);
    expect(s[0].wins).toBe(3);
  });

  it('desempata por confronto direto quando há empate de pontos', () => {
    // a, b, c ganham 1 de d e há um triângulo a>b, b>c, c>a; d perde tudo.
    const matches: GroupMatch[] = [
      win('A', 1, 'a', 'b'), win('A', 1, 'c', 'd'),
      win('A', 2, 'b', 'c'), win('A', 2, 'a', 'd'),
      win('A', 3, 'c', 'a'), win('A', 3, 'b', 'd'),
    ];
    const s = computeGroupStandings(group, matches, byId, makeRng(1).next);
    // a,b,c têm 6 pts (2V), d tem 0. d deve ser o último.
    expect(s[3].playerId).toBe('d');
    expect(s.slice(0, 3).map((x) => x.points)).toEqual([6, 6, 6]);
  });
});

describe('selectQualifiers', () => {
  it('classifica 1º e 2º de cada grupo + 2 melhores 3ºs = 16', () => {
    const byId: Record<string, Player> = {};
    const standings: Record<string, ReturnType<typeof computeGroupStandings>> = {};
    let n = 0;
    for (const g of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      standings[g] = [0, 1, 2, 3].map((rank) => {
        const id = `${g}${rank}`;
        byId[id] = P(id, 80, 80, 70 + (g.charCodeAt(0) - 65)); // 3ºs com overall variando p/ desempate
        n++;
        return { playerId: id, played: 3, wins: 3 - rank, losses: rank, points: (3 - rank) * 3 };
      });
    }
    const q = selectQualifiers(standings, byId, makeRng(1).next);
    expect(q.winners).toHaveLength(7);
    expect(q.runnersUp).toHaveLength(7);
    expect(q.bestThirds).toHaveLength(2);
    expect(q.all).toHaveLength(16);
    expect(new Set(q.all).size).toBe(16);
    // os melhores 3ºs vêm dos grupos de maior overall (G e F neste setup)
    expect(q.bestThirds).toContain('G2');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- groupStage`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/groupStage.ts`**

```ts
import type { MatchResult, Player } from '../types';
import { overall } from '../types';
import type { Group } from './draw';
import type { Rng } from './rng';

export interface GroupMatch {
  group: string;
  round: number; // 1..3
  aId: string;
  bId: string;
  result: MatchResult | null;
}

export interface Standing {
  playerId: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
}

// Pareamentos round-robin de 4 jogadores (índices), método do círculo.
const RR_ROUNDS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[0, 3], [1, 2]],
];

export function makeGroupFixtures(groups: Group[]): GroupMatch[] {
  const out: GroupMatch[] = [];
  for (const g of groups) {
    RR_ROUNDS.forEach((pairs, ri) => {
      for (const [i, j] of pairs) {
        out.push({ group: g.name, round: ri + 1, aId: g.playerIds[i], bId: g.playerIds[j], result: null });
      }
    });
  }
  return out;
}

export function computeGroupStandings(
  group: Group,
  matches: GroupMatch[],
  byId: Record<string, Player>,
  rng: Rng,
): Standing[] {
  const ids = group.playerIds;
  const stats: Record<string, Standing> = {};
  for (const id of ids) stats[id] = { playerId: id, played: 0, wins: 0, losses: 0, points: 0 };

  const played = matches.filter((m) => m.group === group.name && m.result);
  for (const m of played) {
    const r = m.result!;
    stats[r.winnerId].wins++;
    stats[r.winnerId].points += 3;
    stats[r.winnerId].played++;
    stats[r.loserId].losses++;
    stats[r.loserId].played++;
  }

  // chave de desempate aleatória, estável e determinística
  const tb: Record<string, number> = {};
  for (const id of ids) tb[id] = rng();

  // pontos que `x` fez contra `y` no confronto direto
  const h2h = (x: string, y: string): number => {
    let p = 0;
    for (const m of played) {
      const isPair = (m.aId === x && m.bId === y) || (m.aId === y && m.bId === x);
      if (isPair && m.result!.winnerId === x) p += 3;
    }
    return p;
  };

  const sorted = [...ids].sort((x, y) => {
    if (stats[y].points !== stats[x].points) return stats[y].points - stats[x].points;
    const hx = h2h(x, y), hy = h2h(y, x);
    if (hy !== hx) return hy - hx;
    const ox = overall(byId[x]), oy = overall(byId[y]);
    if (oy !== ox) return oy - ox;
    return tb[y] - tb[x];
  });

  return sorted.map((id) => stats[id]);
}

export interface Qualifiers {
  winners: string[];    // 7 (1º de cada grupo)
  runnersUp: string[];  // 7 (2º de cada grupo)
  bestThirds: string[]; // 2 melhores 3ºs
  all: string[];        // 16, na ordem winners → runnersUp → bestThirds
}

export function selectQualifiers(
  standingsByGroup: Record<string, Standing[]>,
  byId: Record<string, Player>,
  rng: Rng,
): Qualifiers {
  const winners: string[] = [];
  const runnersUp: string[] = [];
  const thirds: Standing[] = [];
  for (const name of Object.keys(standingsByGroup)) {
    const s = standingsByGroup[name];
    winners.push(s[0].playerId);
    runnersUp.push(s[1].playerId);
    thirds.push(s[2]);
  }

  const tb: Record<string, number> = {};
  for (const t of thirds) tb[t.playerId] = rng();

  const rankedThirds = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const oa = overall(byId[a.playerId]), ob = overall(byId[b.playerId]);
    if (ob !== oa) return ob - oa;
    return tb[b.playerId] - tb[a.playerId];
  });

  const bestThirds = rankedThirds.slice(0, 2).map((t) => t.playerId);
  return { winners, runnersUp, bestThirds, all: [...winners, ...runnersUp, ...bestThirds] };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- groupStage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: fase de grupos (fixtures, tabelas com desempate e classificados)"
```

---

## Task 8: Mata-mata — seed e pareamento (`engine/bracket.ts`)

**Files:**
- Create: `src/engine/bracket.ts`, `src/engine/bracket.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/bracket.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { seedKnockout, pairWinners } from './bracket';

describe('seedKnockout', () => {
  it('gera 8 confrontos com os 16 classificados, sem repetição', () => {
    const ids = Array.from({ length: 16 }, (_, i) => `p${i}`);
    const groupOf: Record<string, string> = {};
    ids.forEach((id, i) => (groupOf[id] = 'ABCDEFG'[i % 7]));
    const r16 = seedKnockout(ids, groupOf, makeRng(3).next);
    expect(r16).toHaveLength(8);
    const all = r16.flatMap((m) => [m.aId, m.bId]);
    expect(new Set(all).size).toBe(16);
  });

  it('evita reencontro de mesmo grupo nas oitavas', () => {
    const ids = Array.from({ length: 16 }, (_, i) => `p${i}`);
    // três jogadores do grupo "A" para forçar o caso
    const groupOf: Record<string, string> = {};
    ids.forEach((id, i) => (groupOf[id] = i < 3 ? 'A' : 'ABCDEFG'[i % 7]));
    for (let seed = 1; seed <= 50; seed++) {
      const r16 = seedKnockout(ids, groupOf, makeRng(seed).next);
      for (const m of r16) expect(groupOf[m.aId!]).not.toBe(groupOf[m.bId!]);
    }
  });
});

describe('pairWinners', () => {
  it('pareia vencedores em sequência', () => {
    expect(pairWinners(['a', 'b', 'c', 'd'])).toEqual([
      { aId: 'a', bId: 'b', result: null },
      { aId: 'c', bId: 'd', result: null },
    ]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- bracket`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/bracket.ts`**

```ts
import type { MatchResult } from '../types';
import { shuffle, type Rng } from './rng';

export interface KnockoutMatch {
  aId: string | null;
  bId: string | null;
  result: MatchResult | null;
}

export function seedKnockout(
  qualifierIds: string[],
  groupOf: Record<string, string>,
  rng: Rng,
): KnockoutMatch[] {
  const order = repairSameGroup(shuffle(qualifierIds, rng), groupOf);
  const matches: KnockoutMatch[] = [];
  for (let i = 0; i < order.length; i += 2) {
    matches.push({ aId: order[i], bId: order[i + 1], result: null });
  }
  return matches;
}

/** Desfaz confrontos de mesmo grupo trocando um dos jogadores com outro par. */
function repairSameGroup(order: string[], groupOf: Record<string, string>): string[] {
  const a = order.slice();
  for (let i = 0; i < a.length; i += 2) {
    if (groupOf[a[i]] !== groupOf[a[i + 1]]) continue;
    for (let j = 0; j < a.length; j++) {
      if (j === i || j === i + 1) continue;
      const partnerJ = j % 2 === 0 ? a[j + 1] : a[j - 1];
      const newPairIok = groupOf[a[i]] !== groupOf[a[j]];
      const newPairJok = groupOf[partnerJ] !== groupOf[a[i + 1]];
      if (newPairIok && newPairJok) {
        [a[i + 1], a[j]] = [a[j], a[i + 1]];
        break;
      }
    }
  }
  return a;
}

export function pairWinners(winnerIds: string[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  for (let i = 0; i < winnerIds.length; i += 2) {
    matches.push({ aId: winnerIds[i], bId: winnerIds[i + 1], result: null });
  }
  return matches;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- bracket`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seed do mata-mata (sorteado, sem reencontro de grupo) + pareamento"
```

---

## Task 9: Máquina de estados da Copa (`engine/tournament.ts`)

**Files:**
- Create: `src/engine/tournament.ts`, `src/engine/tournament.test.ts`

- [ ] **Step 1: Escrever testes** (`src/engine/tournament.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import {
  createGame, reroll, keepFighter, confirmDraw,
  playGroupRound, playKnockoutRound, type GameState,
} from './tournament';

function playToEnd(seed: number): GameState {
  let g = createGame(seed);
  g = keepFighter(g);
  g = confirmDraw(g);
  while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
  while (g.phase !== 'CHAMPION') g = playKnockoutRound(g);
  return g;
}

describe('createGame', () => {
  it('começa em ROLL_FIGHTER com fighter sorteado e 2 rerolls', () => {
    const g = createGame(1);
    expect(g.phase).toBe('ROLL_FIGHTER');
    expect(g.fighterId).toBeTruthy();
    expect(g.rerollsLeft).toBe(2);
  });
});

describe('reroll', () => {
  it('troca o fighter por outro e gasta um reroll', () => {
    const g = createGame(1);
    const r = reroll(g);
    expect(r.fighterId).not.toBe(g.fighterId);
    expect(r.rerollsLeft).toBe(1);
  });
  it('não rerola além de 0', () => {
    let g = createGame(1);
    g = reroll(g); g = reroll(g);
    const stuck = reroll(g);
    expect(stuck.rerollsLeft).toBe(0);
    expect(stuck.fighterId).toBe(g.fighterId);
  });
});

describe('fluxo completo', () => {
  it('chega a CHAMPION com campeão e 3º lugar definidos', () => {
    const g = playToEnd(2026);
    expect(g.phase).toBe('CHAMPION');
    expect(g.championId).toBeTruthy();
    expect(g.bronzeId).toBeTruthy();
    expect(g.championId).not.toBe(g.bronzeId);
  });

  it('passa por todas as fases do mata-mata', () => {
    let g = createGame(9);
    g = confirmDraw(keepFighter(g));
    while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
    const fases: string[] = [];
    while (g.phase !== 'CHAMPION') {
      fases.push(g.phase);
      g = playKnockoutRound(g);
    }
    expect(fases).toEqual(['R16', 'QF', 'SF', 'BRONZE', 'FINAL']);
  });

  it('é determinístico: mesma seed → mesmo campeão', () => {
    expect(playToEnd(123).championId).toBe(playToEnd(123).championId);
    expect(playToEnd(123).championId).not.toBe(playToEnd(124).championId);
  });

  it('a fase de grupos gera 42 resultados e 16 classificados', () => {
    let g = createGame(5);
    g = confirmDraw(keepFighter(g));
    while (g.phase === 'GROUP_STAGE') g = playGroupRound(g);
    expect(g.groupMatches!.every((m) => m.result)).toBe(true);
    expect(g.groupMatches!).toHaveLength(42);
    expect(g.knockout.R16!.flatMap((m) => [m.aId, m.bId])).toHaveLength(16);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tournament`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/engine/tournament.ts`**

```ts
import type { Tier } from '../types';
import { players, byId } from '../data/players';
import { makeRng, randomSeed } from './rng';
import { roll } from './fighterRoll';
import { simMatch } from './simMatch';
import { drawGroups, type Group } from './draw';
import {
  makeGroupFixtures, computeGroupStandings, selectQualifiers,
  type GroupMatch, type Standing,
} from './groupStage';
import { seedKnockout, pairWinners, type KnockoutMatch } from './bracket';

export type Phase =
  | 'ROLL_FIGHTER' | 'DRAW' | 'GROUP_STAGE'
  | 'R16' | 'QF' | 'SF' | 'BRONZE' | 'FINAL' | 'CHAMPION';

export type KnockoutKey = 'R16' | 'QF' | 'SF' | 'BRONZE' | 'FINAL';

export interface GameState {
  version: 1;
  phase: Phase;
  seed: number;
  rngState: number;
  fighterId: string;
  fighterTier: Tier;
  rerollsLeft: number;
  groups: Group[] | null;
  groupMatches: GroupMatch[] | null;
  groupRoundsPlayed: number; // 0..3
  standings: Record<string, Standing[]> | null;
  knockout: Partial<Record<KnockoutKey, KnockoutMatch[]>>;
  championId: string | null;
  bronzeId: string | null;
}

export function createGame(seed: number = randomSeed()): GameState {
  const rng = makeRng(seed);
  const first = roll(rng.next);
  return {
    version: 1,
    phase: 'ROLL_FIGHTER',
    seed,
    rngState: rng.state,
    fighterId: first.fighter.id,
    fighterTier: first.tier,
    rerollsLeft: 2,
    groups: null,
    groupMatches: null,
    groupRoundsPlayed: 0,
    standings: null,
    knockout: {},
    championId: null,
    bronzeId: null,
  };
}

export function reroll(s: GameState): GameState {
  if (s.phase !== 'ROLL_FIGHTER' || s.rerollsLeft <= 0) return s;
  const rng = makeRng(s.rngState);
  const r = roll(rng.next, s.fighterId);
  return { ...s, fighterId: r.fighter.id, fighterTier: r.tier, rerollsLeft: s.rerollsLeft - 1, rngState: rng.state };
}

export function keepFighter(s: GameState): GameState {
  if (s.phase !== 'ROLL_FIGHTER') return s;
  const rng = makeRng(s.rngState);
  const groups = drawGroups(players.map((p) => p.id), rng.next);
  const groupMatches = makeGroupFixtures(groups);
  return { ...s, phase: 'DRAW', groups, groupMatches, rngState: rng.state };
}

export function confirmDraw(s: GameState): GameState {
  if (s.phase !== 'DRAW') return s;
  return { ...s, phase: 'GROUP_STAGE' };
}

export function playGroupRound(s: GameState): GameState {
  if (s.phase !== 'GROUP_STAGE' || !s.groupMatches || s.groupRoundsPlayed >= 3) return s;
  const rng = makeRng(s.rngState);
  const round = s.groupRoundsPlayed + 1;
  const groupMatches = s.groupMatches.map((m) =>
    m.round === round && !m.result ? { ...m, result: simMatch(byId[m.aId], byId[m.bId], rng.next) } : m,
  );
  let next: GameState = { ...s, groupMatches, groupRoundsPlayed: round, rngState: rng.state };
  if (round === 3) next = finishGroupStage(next);
  return next;
}

function finishGroupStage(s: GameState): GameState {
  const rng = makeRng(s.rngState);
  const standings: Record<string, Standing[]> = {};
  for (const g of s.groups!) {
    standings[g.name] = computeGroupStandings(g, s.groupMatches!, byId, rng.next);
  }
  const quals = selectQualifiers(standings, byId, rng.next);
  const groupOf: Record<string, string> = {};
  for (const g of s.groups!) for (const id of g.playerIds) groupOf[id] = g.name;
  const r16 = seedKnockout(quals.all, groupOf, rng.next);
  return { ...s, standings, knockout: { R16: r16 }, phase: 'R16', rngState: rng.state };
}

const NEXT_OF: Record<KnockoutKey, Phase> = {
  R16: 'QF', QF: 'SF', SF: 'BRONZE', BRONZE: 'FINAL', FINAL: 'CHAMPION',
};

export function playKnockoutRound(s: GameState): GameState {
  const key = s.phase as KnockoutKey;
  const round = s.knockout[key];
  if (!round) return s;
  const rng = makeRng(s.rngState);
  const played = round.map((m) =>
    m.result ? m : { ...m, result: simMatch(byId[m.aId!], byId[m.bId!], rng.next) },
  );
  const winners = played.map((m) => m.result!.winnerId);
  const losers = played.map((m) => m.result!.loserId);
  const knockout: GameState['knockout'] = { ...s.knockout, [key]: played };
  let next: GameState = { ...s, knockout, rngState: rng.state };

  if (key === 'SF') {
    knockout.FINAL = pairWinners(winners);
    knockout.BRONZE = [{ aId: losers[0], bId: losers[1], result: null }];
    next = { ...next, knockout, phase: 'BRONZE' };
  } else if (key === 'BRONZE') {
    next = { ...next, bronzeId: winners[0], phase: 'FINAL' };
  } else if (key === 'FINAL') {
    next = { ...next, championId: winners[0], phase: 'CHAMPION' };
  } else {
    knockout[NEXT_OF[key] as KnockoutKey] = pairWinners(winners);
    next = { ...next, knockout, phase: NEXT_OF[key] };
  }
  return next;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tournament`
Expected: PASS.

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npm test`
Expected: todos os arquivos de teste PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: máquina de estados da Copa (roll → grupos → mata-mata → campeão)"
```

---

## Task 10: Persistência e store React (`store/`)

**Files:**
- Create: `src/store/persistence.ts`, `src/store/GameProvider.tsx`

- [ ] **Step 1: Criar `src/store/persistence.ts`**

```ts
import type { GameState } from '../engine/tournament';
import type { Tier } from '../types';

const GAME_KEY = 'copa-albus-nexus:game:v1';
const HALL_KEY = 'copa-albus-nexus:hall:v1';

export interface HallEntry {
  champion: string;   // nome
  fighterId: string;  // fighter que o jogador levou
  tier: Tier;
  date: string;       // ISO
  seed: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadGame(): GameState | null {
  try {
    const g = safeParse<GameState>(localStorage.getItem(GAME_KEY));
    return g && g.version === 1 ? g : null;
  } catch {
    return null;
  }
}

export function saveGame(s: GameState | null): void {
  try {
    if (s) localStorage.setItem(GAME_KEY, JSON.stringify(s));
    else localStorage.removeItem(GAME_KEY);
  } catch {
    /* localStorage indisponível — segue sem persistir */
  }
}

export function loadHall(): HallEntry[] {
  try {
    return safeParse<HallEntry[]>(localStorage.getItem(HALL_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveHall(h: HallEntry[]): void {
  try {
    localStorage.setItem(HALL_KEY, JSON.stringify(h));
  } catch {
    /* idem */
  }
}
```

- [ ] **Step 2: Criar `src/store/GameProvider.tsx`**

```tsx
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { byId } from '../data/players';
import {
  createGame, reroll as rerollFn, keepFighter, confirmDraw,
  playGroupRound, playKnockoutRound, type GameState,
} from '../engine/tournament';
import { loadGame, saveGame, loadHall, saveHall, type HallEntry } from './persistence';

interface GameCtx {
  game: GameState | null;
  hall: HallEntry[];
  newGame(): void;
  reroll(): void;
  keep(): void;
  confirmDraw(): void;
  playGroupRound(): void;
  playKnockout(): void;
  goHome(): void;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(() => loadGame());
  const [hall, setHall] = useState<HallEntry[]>(() => loadHall());
  const recordedSeed = useRef<number | null>(null);

  useEffect(() => { saveGame(game); }, [game]);
  useEffect(() => { saveHall(hall); }, [hall]);

  // Registra o campeão no Hall da Fama uma única vez (seguro sob StrictMode).
  useEffect(() => {
    if (game?.phase !== 'CHAMPION' || !game.championId) return;
    if (recordedSeed.current === game.seed) return;
    recordedSeed.current = game.seed;
    setHall((h) => {
      if (h.some((e) => e.seed === game.seed)) return h;
      return [
        { champion: byId[game.championId!].name, fighterId: game.fighterId, tier: game.fighterTier, date: new Date().toISOString(), seed: game.seed },
        ...h,
      ];
    });
  }, [game?.phase, game?.championId, game?.seed, game?.fighterId, game?.fighterTier]);

  const api = useMemo<GameCtx>(() => ({
    game,
    hall,
    newGame: () => { recordedSeed.current = null; setGame(createGame()); },
    reroll: () => setGame((g) => (g ? rerollFn(g) : g)),
    keep: () => setGame((g) => (g ? keepFighter(g) : g)),
    confirmDraw: () => setGame((g) => (g ? confirmDraw(g) : g)),
    playGroupRound: () => setGame((g) => (g ? playGroupRound(g) : g)),
    playKnockout: () => setGame((g) => (g ? playKnockoutRound(g) : g)),
    goHome: () => setGame(null),
  }), [game, hall]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useGame(): GameCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>');
  return ctx;
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npm run build`
Expected: passa (typecheck + build).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: store React com persistência em localStorage e Hall da Fama"
```

---

## Task 11: Componentes de UI compartilhados (`components/ui/`)

**Files:**
- Create: `src/components/ui/StatBadges.tsx`, `src/components/ui/WinTypeTag.tsx`, `src/components/ui/PlayerCard.tsx`, `src/components/ui/GroupTable.tsx`

- [ ] **Step 1: Criar `src/components/ui/WinTypeTag.tsx`**

```tsx
import type { WinType } from '../../types';

const META: Record<WinType, { label: string; icon: string; color: string }> = {
  kill: { label: 'KILL', icon: '⚔️', color: 'text-kill' },
  farm: { label: 'FARM', icon: '🌾', color: 'text-farm' },
  torre: { label: 'TORRE', icon: '🏰', color: 'text-torre' },
};

export function WinTypeTag({ type }: { type: WinType }) {
  const m = META[type];
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${m.color}`}>
      <span>{m.icon}</span>
      {m.label}
    </span>
  );
}
```

- [ ] **Step 2: Criar `src/components/ui/StatBadges.tsx`**

```tsx
import type { Player } from '../../types';

export function StatBadges({ p }: { p: Player }) {
  const item = (label: string, value: number, color: string) => (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-bold ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/50">{label}</span>
    </div>
  );
  return (
    <div className="flex gap-3">
      {item('kill', p.kill, 'text-kill')}
      {item('farm', p.farm, 'text-farm')}
      {item('torre', p.torre, 'text-torre')}
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/components/ui/PlayerCard.tsx`**

```tsx
import type { Player, Tier } from '../../types';
import { overall } from '../../types';
import { StatBadges } from './StatBadges';

const TIER_RING: Record<Tier, string> = {
  lendario: 'ring-lendario shadow-[0_0_24px_-4px_var(--color-lendario)]',
  epico: 'ring-epico shadow-[0_0_20px_-6px_var(--color-epico)]',
  raro: 'ring-raro',
  comum: 'ring-comum',
};

export function PlayerCard({
  player, tier, highlight = false, subtitle,
}: { player: Player; tier?: Tier; highlight?: boolean; subtitle?: string }) {
  const ring = tier ? TIER_RING[tier] : 'ring-line';
  return (
    <div className={`rounded-xl bg-panel-2 p-4 ring-2 ${ring} ${highlight ? 'outline outline-2 outline-neon' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{player.name}</div>
          {subtitle && <div className="text-xs text-white/50">{subtitle}</div>}
        </div>
        <div className="text-3xl font-black text-neon">{overall(player)}</div>
      </div>
      <div className="mt-3"><StatBadges p={player} /></div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/components/ui/GroupTable.tsx`**

```tsx
import { byId } from '../../data/players';
import type { Standing } from '../../engine/groupStage';

export function GroupTable({
  name, standings, fighterId, qualifiedCount = 2,
}: { name: string; standings: Standing[]; fighterId: string; qualifiedCount?: number }) {
  return (
    <div className="rounded-xl bg-panel p-3 ring-1 ring-line">
      <div className="mb-2 text-sm font-black text-neon">Grupo {name}</div>
      <table className="w-full text-sm">
        <thead className="text-white/40">
          <tr>
            <th className="text-left font-medium">#</th>
            <th className="text-left font-medium">Jogador</th>
            <th className="text-right font-medium">V</th>
            <th className="text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.playerId}
              className={`${i < qualifiedCount ? 'text-white' : 'text-white/40'} ${s.playerId === fighterId ? 'font-bold text-neon' : ''}`}
            >
              <td>{i + 1}</td>
              <td>{byId[s.playerId].name}</td>
              <td className="text-right">{s.wins}</td>
              <td className="text-right">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Verificar typecheck**

Run: `npm run build`
Expected: passa.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: componentes de UI (PlayerCard, StatBadges, WinTypeTag, GroupTable)"
```

---

## Task 12: Tela Capa e App shell (`HomeScreen` + roteamento por fase)

**Files:**
- Create: `src/components/screens/HomeScreen.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Criar `src/components/screens/HomeScreen.tsx`**

```tsx
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { TIERS } from '../../engine/fighterRoll';

export function HomeScreen() {
  const { newGame, hall } = useGame();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h1 className="text-5xl font-black tracking-tight">
        <span className="text-neon">Copa</span> <span className="text-neon-2">Albus Nexus</span>
      </h1>
      <p className="mt-3 text-white/60">7 a 0 — o X1 de League of Legends do Albus Nexus.</p>

      <button
        onClick={newGame}
        className="mt-8 rounded-xl bg-neon px-8 py-3 text-lg font-black text-bg transition hover:brightness-110"
      >
        ⚡ Nova Copa
      </button>

      <div className="mt-12 text-left">
        <h2 className="mb-3 text-xl font-bold text-white/80">🏆 Hall da Fama</h2>
        {hall.length === 0 ? (
          <p className="text-white/40">Nenhuma Copa concluída ainda. Seja o primeiro campeão.</p>
        ) : (
          <ul className="space-y-2">
            {hall.map((e, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-panel px-4 py-2 ring-1 ring-line">
                <span className="font-bold text-neon">{e.champion}</span>
                <span className="text-sm text-white/50">
                  seu fighter: {byId[e.fighterId]?.name ?? e.fighterId} ·{' '}
                  {new Date(e.date).toLocaleDateString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 text-left text-xs text-white/40">
        <p className="mb-1 font-bold uppercase tracking-wide">Raridades</p>
        <div className="flex flex-wrap gap-3">
          {TIERS.map((t) => (
            <span key={t.tier}>{t.label}: {(t.chance * 100).toFixed(0)}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Reescrever `src/App.tsx`** (roteamento por fase — telas seguintes entram nas próximas tasks)

```tsx
import { useGame } from './store/GameProvider';
import { HomeScreen } from './components/screens/HomeScreen';

export function App() {
  const { game } = useGame();

  if (!game) return <HomeScreen />;

  switch (game.phase) {
    case 'ROLL_FIGHTER':
      return <Placeholder phase="ROLL_FIGHTER" />;
    case 'DRAW':
      return <Placeholder phase="DRAW" />;
    case 'GROUP_STAGE':
      return <Placeholder phase="GROUP_STAGE" />;
    case 'CHAMPION':
      return <Placeholder phase="CHAMPION" />;
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
```

- [ ] **Step 3: Envolver o App com `GameProvider` em `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { GameProvider } from './store/GameProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
);
```

- [ ] **Step 4: Rodar o app e verificar a capa**

Run: `npm run dev` (deixe rodando; abra a URL local exibida)
Expected: aparece "Copa Albus Nexus", botão "Nova Copa", Hall da Fama vazio. Clicar em "Nova Copa" leva ao placeholder "ROLL_FIGHTER". "Voltar à capa" retorna.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tela Capa (Hall da Fama) e roteamento por fase"
```

---

## Task 13: Tela de roll do fighter (`RollFighterScreen`)

**Files:**
- Create: `src/components/screens/RollFighterScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Criar `src/components/screens/RollFighterScreen.tsx`**

```tsx
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { PlayerCard } from '../ui/PlayerCard';
import { TIERS } from '../../engine/fighterRoll';

export function RollFighterScreen() {
  const { game, reroll, keep, goHome } = useGame();
  if (!game) return null;
  const fighter = byId[game.fighterId];
  const tierLabel = TIERS.find((t) => t.tier === game.fighterTier)!.label;

  return (
    <div className="mx-auto max-w-md px-6 py-12 text-center">
      <button onClick={goHome} className="mb-6 text-sm text-white/40 hover:text-white/70">← Capa</button>
      <h2 className="text-2xl font-black">Seu fighter</h2>
      <p className="mt-1 text-white/50">A sorte escolheu por você. Topa ou empurra?</p>

      <div className="mt-6 animate-[pop_0.3s_ease]" key={game.fighterId}>
        <div className="mb-2 text-sm font-black uppercase tracking-widest text-lendario">{tierLabel}</div>
        <PlayerCard player={fighter} tier={game.fighterTier} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={keep}
          className="rounded-xl bg-neon px-6 py-3 font-black text-bg transition hover:brightness-110"
        >
          ✅ Ficar com {fighter.name}
        </button>
        <button
          onClick={reroll}
          disabled={game.rerollsLeft <= 0}
          className="rounded-xl bg-panel-2 px-6 py-3 font-bold ring-1 ring-line transition enabled:hover:ring-neon-2 disabled:opacity-40"
        >
          🎲 Rerolar ({game.rerollsLeft} restante{game.rerollsLeft === 1 ? '' : 's'})
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar keyframe `pop` ao `src/index.css`** (após o bloco `@theme`)

```css
@keyframes pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 3: Ligar a tela no `src/App.tsx`** (substituir o case `ROLL_FIGHTER`)

```tsx
    case 'ROLL_FIGHTER':
      return <RollFighterScreen />;
```
E adicionar o import no topo:
```tsx
import { RollFighterScreen } from './components/screens/RollFighterScreen';
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: "Nova Copa" mostra um fighter com tier; "Rerolar" troca o jogador e decrementa o contador; ao zerar, o botão fica desabilitado; "Ficar com X" vai para o placeholder "DRAW".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tela de roll do fighter com tiers e rerolls"
```

---

## Task 14: Sorteio dos grupos e Hub do torneio (`DrawScreen` + `TournamentHub`)

**Files:**
- Create: `src/components/screens/DrawScreen.tsx`, `src/components/screens/TournamentHub.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Criar `src/components/screens/DrawScreen.tsx`**

```tsx
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';

export function DrawScreen() {
  const { game, confirmDraw } = useGame();
  if (!game?.groups) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-center text-2xl font-black">Sorteio dos grupos</h2>
      <p className="mt-1 text-center text-white/50">Chapéu único, 100% no grito. Boa sorte.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {game.groups.map((g) => (
          <div key={g.name} className="rounded-xl bg-panel p-4 ring-1 ring-line">
            <div className="mb-2 text-sm font-black text-neon">Grupo {g.name}</div>
            <ul className="space-y-1 text-sm">
              {g.playerIds.map((id) => (
                <li key={id} className={id === game.fighterId ? 'font-bold text-neon-2' : 'text-white/80'}>
                  {byId[id].name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={confirmDraw} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          Começar a Copa →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/components/screens/TournamentHub.tsx`**

```tsx
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { GroupTable } from '../ui/GroupTable';
import { WinTypeTag } from '../ui/WinTypeTag';
import { computeGroupStandings } from '../../engine/groupStage';
import { makeRng } from '../../engine/rng';

export function TournamentHub() {
  const { game, playGroupRound } = useGame();
  if (!game?.groups || !game.groupMatches) return null;

  const fighter = byId[game.fighterId];

  // standings ao vivo (parciais) — recomputados de forma determinística para exibição
  const liveStandings = (name: string) => {
    const group = game.groups!.find((g) => g.name === name)!;
    return computeGroupStandings(group, game.groupMatches!, byId, makeRng(game.seed).next);
  };

  const nextRound = game.groupRoundsPlayed + 1;
  const fighterMatch = game.groupMatches.find(
    (m) => m.round === game.groupRoundsPlayed && (m.aId === game.fighterId || m.bId === game.fighterId),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Fase de grupos</div>
          <h2 className="text-2xl font-black">Rodada {Math.min(nextRound, 3)} de 3</h2>
        </div>
        <div className="rounded-lg bg-panel-2 px-4 py-2 ring-1 ring-neon">
          <span className="text-xs text-white/50">Seu fighter</span>
          <div className="font-black text-neon">{fighter.name}</div>
        </div>
      </header>

      {fighterMatch?.result && (
        <div className="mt-4 rounded-lg bg-panel p-3 ring-1 ring-line">
          <span className="text-sm text-white/60">Seu último jogo: </span>
          <span className="font-bold">
            {byId[fighterMatch.result.winnerId].name} venceu {byId[fighterMatch.result.loserId].name}{' '}
          </span>
          por <WinTypeTag type={fighterMatch.result.winType} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {game.groups.map((g) => (
          <GroupTable key={g.name} name={g.name} standings={liveStandings(g.name)} fighterId={game.fighterId} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={playGroupRound} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          {game.groupRoundsPlayed >= 3 ? 'Ir para o mata-mata →' : `Jogar rodada ${nextRound} →`}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Ligar as telas no `src/App.tsx`** (substituir os cases `DRAW` e `GROUP_STAGE` e adicionar imports)

```tsx
import { DrawScreen } from './components/screens/DrawScreen';
import { TournamentHub } from './components/screens/TournamentHub';
```
```tsx
    case 'DRAW':
      return <DrawScreen />;
    case 'GROUP_STAGE':
      return <TournamentHub />;
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: após escolher fighter, vê os 7 grupos (seu fighter destacado), "Começar a Copa" abre o hub; "Jogar rodada" preenche vitórias e atualiza as tabelas; após 3 rodadas o botão vira "Ir para o mata-mata" e leva ao placeholder "R16".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: sorteio dos grupos e hub da fase de grupos"
```

---

## Task 15: Mata-mata — tela de chaveamento e reveal de partida (`BracketScreen` + `MatchScreen`)

**Files:**
- Create: `src/components/screens/MatchScreen.tsx`, `src/components/screens/BracketScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Criar `src/components/screens/MatchScreen.tsx`** (reveal com suspense reutilizável)

```tsx
import { useEffect, useState } from 'react';
import { byId } from '../../data/players';
import type { KnockoutMatch } from '../../engine/bracket';
import { PlayerCard } from '../ui/PlayerCard';
import { WinTypeTag } from '../ui/WinTypeTag';

export function MatchReveal({ match, onClose }: { match: KnockoutMatch; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!match.aId || !match.bId || !match.result) return null;
  const a = byId[match.aId], b = byId[match.bId];
  const r = match.result;
  const winner = byId[r.winnerId];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-6" onClick={onClose}>
      <div className="w-full max-w-xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <PlayerCard player={a} highlight={revealed && r.winnerId === a.id} />
          <div className="text-2xl font-black text-white/40">VS</div>
          <PlayerCard player={b} highlight={revealed && r.winnerId === b.id} />
        </div>

        <div className="mt-6 h-20">
          {!revealed ? (
            <div className="animate-pulse text-lg text-white/60">simulando o X1…</div>
          ) : (
            <div className="animate-[pop_0.3s_ease]">
              <div className="text-xl font-black text-neon">{winner.name} venceu!</div>
              <div className="mt-1 text-sm text-white/70">
                por <WinTypeTag type={r.winType} />
              </div>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={onClose} className="mt-2 rounded-lg bg-neon px-6 py-2 font-bold text-bg hover:brightness-110">
            Continuar →
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/components/screens/BracketScreen.tsx`**

```tsx
import { useState } from 'react';
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import type { KnockoutKey } from '../../engine/tournament';
import type { KnockoutMatch } from '../../engine/bracket';
import { WinTypeTag } from '../ui/WinTypeTag';
import { MatchReveal } from './MatchScreen';

const TITLES: Record<KnockoutKey, string> = {
  R16: 'Oitavas de final', QF: 'Quartas de final', SF: 'Semifinais',
  BRONZE: 'Disputa de 3º lugar', FINAL: 'Final',
};
const ORDER: KnockoutKey[] = ['R16', 'QF', 'SF', 'BRONZE', 'FINAL'];

export function BracketScreen() {
  const { game, playKnockout } = useGame();
  const [reveal, setReveal] = useState<KnockoutMatch | null>(null);
  if (!game) return null;

  const current = game.phase as KnockoutKey;

  const matchRow = (m: KnockoutMatch, key: KnockoutKey) => {
    const a = m.aId ? byId[m.aId].name : '—';
    const b = m.bId ? byId[m.bId].name : '—';
    const mine = m.aId === game.fighterId || m.bId === game.fighterId;
    return (
      <button
        key={`${key}-${a}-${b}`}
        onClick={() => m.result && setReveal(m)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ring-1 ${
          mine ? 'bg-panel-2 ring-neon' : 'bg-panel ring-line'
        } ${m.result ? 'hover:ring-neon-2' : ''}`}
      >
        <span className="text-sm">
          <b className={m.result?.winnerId === m.aId ? 'text-neon' : 'text-white/60'}>{a}</b>
          <span className="text-white/30"> vs </span>
          <b className={m.result?.winnerId === m.bId ? 'text-neon' : 'text-white/60'}>{b}</b>
        </span>
        {m.result && <WinTypeTag type={m.result.winType} />}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="text-center text-2xl font-black">{TITLES[current]}</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-5">
        {ORDER.map((key) => {
          const round = game.knockout[key];
          if (!round) return <div key={key} />;
          return (
            <div key={key} className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wide text-white/40">{TITLES[key]}</div>
              {round.map((m) => matchRow(m, key))}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button onClick={playKnockout} className="rounded-xl bg-neon px-8 py-3 font-black text-bg hover:brightness-110">
          Jogar {TITLES[current]} →
        </button>
      </div>

      {reveal && <MatchReveal match={reveal} onClose={() => setReveal(null)} />}
    </div>
  );
}
```

- [ ] **Step 3: Ligar no `src/App.tsx`** (cases R16/QF/SF/BRONZE/FINAL → `BracketScreen`)

```tsx
import { BracketScreen } from './components/screens/BracketScreen';
```
Substituir o `default` por:
```tsx
    case 'R16':
    case 'QF':
    case 'SF':
    case 'BRONZE':
    case 'FINAL':
      return <BracketScreen />;
    default:
      return <Placeholder phase={game.phase} />;
```

- [ ] **Step 4: Verificar no navegador**

Run: `npm run dev`
Expected: ao entrar no mata-mata, vê as colunas das fases; "Jogar Oitavas" preenche resultados; clicar num confronto resolvido abre o reveal com suspense ("simulando…" → vencedor + forma da vitória). Avança R16→QF→SF→Bronze→Final.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: chaveamento do mata-mata e reveal de partida com suspense"
```

---

## Task 16: Tela do campeão (`ChampionScreen`)

**Files:**
- Create: `src/components/screens/ChampionScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Criar `src/components/screens/ChampionScreen.tsx`**

```tsx
import { byId } from '../../data/players';
import { useGame } from '../../store/GameProvider';
import { PlayerCard } from '../ui/PlayerCard';

export function ChampionScreen() {
  const { game, goHome, newGame } = useGame();
  if (!game?.championId) return null;
  const champion = byId[game.championId];
  const isMine = game.championId === game.fighterId;
  const bronze = game.bronzeId ? byId[game.bronzeId] : null;

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="text-6xl">🏆</div>
      <div className="mt-2 text-sm uppercase tracking-widest text-white/40">Campeão da Copa Albus Nexus</div>
      <h2 className="mt-1 text-4xl font-black text-lendario">{champion.name}</h2>

      {isMine && (
        <p className="mt-3 animate-pulse text-lg font-bold text-neon-2">
          🎉 Seu fighter foi campeão! 🎉
        </p>
      )}

      <div className="mt-8">
        <PlayerCard player={champion} highlight />
      </div>

      {bronze && (
        <p className="mt-4 text-sm text-white/50">🥉 3º lugar: <b className="text-white/80">{bronze.name}</b></p>
      )}

      <div className="mt-10 flex flex-col gap-3">
        <button onClick={newGame} className="rounded-xl bg-neon px-6 py-3 font-black text-bg hover:brightness-110">
          🔁 Jogar de novo
        </button>
        <button onClick={goHome} className="rounded-xl bg-panel-2 px-6 py-3 font-bold ring-1 ring-line hover:ring-neon">
          🏠 Capa / Hall da Fama
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Ligar no `src/App.tsx`** (case `CHAMPION`)

```tsx
import { ChampionScreen } from './components/screens/ChampionScreen';
```
```tsx
    case 'CHAMPION':
      return <ChampionScreen />;
```

- [ ] **Step 3: Verificar o fluxo completo no navegador**

Run: `npm run dev`
Expected: jogar uma Copa inteira (roll → grupos → mata-mata → final) chega à tela do campeão; se o seu fighter vencer, aparece a comemoração; "Jogar de novo" reinicia; "Capa" mostra o campeão registrado no Hall da Fama.

- [ ] **Step 4: Verificação final (testes + build)**

Run: `npm test`
Expected: toda a suíte PASS.

Run: `npm run build`
Expected: typecheck + build sem erros.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: tela do campeão + comemoração e registro no Hall da Fama"
```

---

## Task 17: README e publicação no GitHub Pages

**Files:**
- Create: `README.md`, `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar `README.md`**

```markdown
# Copa Albus Nexus

Simulador estilo "7 a 0 da Copa do Mundo", mas de **X1 de League of Legends** entre os 28 do Albus Nexus.

- Fighter sorteado estilo gacha (craques raros, 2 rerolls).
- Motor de zebra por atributos **kill / farm / torre**.
- Fase de grupos (7 grupos de 4) + mata-mata até a final, com disputa de 3º lugar.
- Hall da Fama dos campeões. Tudo roda no navegador, sem backend.

## Rodar localmente

```bash
npm install
npm run dev
```

## Testes

```bash
npm test
```

## Ajustar atributos dos jogadores

Edite `src/data/players.ts` (kill/farm/torre de cada um). O overall é a média dos três.
As faixas e chances dos tiers ficam em `src/engine/fighterRoll.ts`.

## Publicar

`npm run build` gera `dist/`. O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na branch principal.
```

- [ ] **Step 2: Criar `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Confirmar `base` do Vite**

Verifique em `vite.config.ts` que `base: '/7-0Albus/'` corresponde ao nome do repositório no GitHub. Se o repo tiver outro nome, ajuste.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: README e workflow de deploy no GitHub Pages"
```

- [ ] **Step 5 (manual): habilitar Pages**

No GitHub: Settings → Pages → Source = "GitHub Actions". (Passo manual do usuário; não há comando.)

---

## Notas de verificação final (rodar ao concluir todas as tasks)

- [ ] `npm test` → toda a suíte verde.
- [ ] `npm run build` → sem erros de typecheck.
- [ ] `npm run dev` → jogar uma Copa do início ao fim sem travar; F5 no meio da Copa mantém o progresso (localStorage); "Nova Copa" preserva o Hall da Fama.
