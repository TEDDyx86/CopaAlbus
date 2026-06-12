# Design

Sistema visual da Copa Albus Nexus. Register **product**: acabamento de transmissão de
esports (HUD escuro, placares, acentos neon) com voz de zoeira entre amigos. Contido por
padrão; drama só nos momentos (roll lendário, revelação de partida, campeão).

## Tema

Dark mode permanente. Fundo azul-broadcast profundo com brilho superior + halo lateral +
uma grade de "campo" bem sutil mascarada no topo. Tokens em OKLCH (`src/index.css`).

## Cores (tokens `--color-*`)

| Papel | Token | Uso |
|-------|-------|-----|
| Fundo / elevação | `bg`, `bg-2`, `surface`, `surface-2`, `line`, `line-soft` | superfícies frias em camadas |
| Tinta | `ink`, `ink-muted`, `ink-faint` | corpo ≥ 4.5:1; faint só p/ rótulos/números não essenciais |
| Acento primário | `accent` (ciano) | ações primárias, seleção, vencedor, "seu fighter" |
| Acento secundário | `accent-2` (magenta) | destaques pontuais ("você", zebra, comemoração) |
| Frentes do X1 | `kill` (vermelho), `farm` (ouro), `torre` (azul) | barras de atributo + tag de vitória |
| Raridades | `lendario` (ouro), `epico` (roxo), `raro` (azul), `comum` (aço) | moldura/brilho da carta e badges |

Acento ≤ ~10% da superfície; brilho (glow) reservado a carta em destaque e momentos.
Cor nunca é o único sinal: frentes e vencedor têm sempre ícone/rótulo.

## Tipografia

- **Archivo Variable** (sans) — display + UI + corpo, via contraste de peso.
- **JetBrains Mono Variable** (mono) — números de placar (overall, pontos, datas) com `tnum`.
- Escala de produto fixa (rem), não fluida (exceto o título-herói da capa, com `clamp` ≤ 5rem).
- `tracking` de display ≥ -0.03em; `text-wrap: balance` em títulos.

## Componentes (`src/components/ui`)

- `Button` — `primary` / `ghost` / `subtle`, tamanhos `md`/`lg`, com hover/active/disabled/focus.
- `FighterCard` — carta do jogador: avatar de iniciais, OVR mono grande, `StatBars`,
  moldura/brilho por raridade. Props: `size` (sm/md/lg), `glow`, `won`, `dimmed`, `animate`.
- `StatBars` — medidores kill/farm/torre com cor da frente e preenchimento animado.
- `TierBadge` / `WinTypeTag` — pílulas de raridade e de forma da vitória.
- `CampaignRoad` — trilha da campanha (Grupos · Oitavas · Quartas · Semi · Final) marcando
  fase atual, fases vencidas e onde a run terminou.
- `Brand` / `TopBar` — marca e barra HUD de transmissão (ao vivo + fase + fighter).

## Motion

- Transições de UI 150–250 ms; curvas ease-out (`cubic-bezier(0.16,1,0.3,1)`), sem bounce.
- Resultado de cada jogo entra inline (`card-in`/`pop`) e o placar da série sobe ao vivo;
  título do campeão é a exceção teatral (sheen no card + confete).
- Materiais premium quando ajudam: glow da carta em destaque, halo por raridade, mask de fundo.
- `prefers-reduced-motion`: tudo vira quase instantâneo; confete não dispara.

## Responsivo

- Estrutural, não tipográfico: a trilha da campanha fica compacta no mobile; o confronto da
  série (suas duas cartas + placar) empilha na vertical em telas estreitas.
