# Copa Albus Nexus — Design

**Data:** 2026-06-11
**Tipo:** Simulador de torneio (jogo web)

## Resumo

Simulador no estilo "7-0 da Copa do Mundo", mas de **X1 (1v1) de League of Legends**
entre os 28 membros do grupo **Albus Nexus**. O jogador escolhe um *fighter* para
acompanhar, vê a jornada dele rodada a rodada com suspense, e pode espiar todos os
outros confrontos. Vence a Copa quem chega à final e levanta a taça.

## Objetivos e não-objetivos

**Objetivos**
- Recriar a sensação do "7-0": escolher um, torcer, avançar rodada a rodada.
- Resultados imprevisíveis mas plausíveis — favorito ganha mais, zebra é possível.
- Sabor de X1 de LoL: a vitória sai por **farm**, **kill** ou **torre**.
- Rodar 100% no navegador, publicável no GitHub Pages.

**Não-objetivos (YAGNI)**
- Sem backend, contas ou multiplayer online. É single-player local.
- Sem integração com a API da Riot / dados reais de partidas.
- Sem editor de elenco dentro do app na v1 — os atributos ficam num arquivo de dados
  editável (`data/players.ts`) que o usuário ajusta na mão quando quiser.

## Elenco

Fonte: `OVERALL ALBUS.txt`. 28 jogadores. Cada jogador tem **três atributos de X1** —
`kill` (first blood), `farm` (CS / 100 de farm) e `torre` (primeira torre) — e o
**overall é derivado** (= média dos três, arredondada). Os atributos iniciais foram
gerados de modo que a média bata com o overall que o grupo já definiu, com uma leve
especialização por jogador. **Todos são editáveis** em `data/players.ts`.

Ordenados por overall (define os potes do sorteio):

| # | Jogador | Kill | Farm | Torre | OVR | Pote |
|---|---------|------|------|-------|-----|------|
| 1 | Boelitz | 99 | 99 | 99 | 99 | 1 |
| 2 | Gilmar | 98 | 94 | 93 | 95 | 1 |
| 3 | Jon | 89 | 90 | 94 | 91 | 1 |
| 4 | Leozão | 94 | 89 | 87 | 90 | 1 |
| 5 | Osni | 88 | 94 | 88 | 90 | 1 |
| 6 | Ana Bueno | 87 | 88 | 92 | 89 | 1 |
| 7 | Grein | 92 | 87 | 85 | 88 | 1 |
| 8 | Giovani | 86 | 92 | 86 | 88 | 2 |
| 9 | Teddy | 85 | 86 | 90 | 87 | 2 |
| 10 | Bruno | 91 | 86 | 84 | 87 | 2 |
| 11 | Kaminski | 84 | 90 | 84 | 86 | 2 |
| 12 | Leo Magro | 84 | 85 | 89 | 86 | 2 |
| 13 | Jackson | 89 | 84 | 82 | 85 | 2 |
| 14 | Luis020 | 81 | 87 | 81 | 83 | 2 |
| 15 | Pedro Rush | 88 | 81 | 80 | 83 | 3 |
| 16 | Badasento | 80 | 81 | 85 | 82 | 3 |
| 17 | Marquinho | 80 | 86 | 80 | 82 | 3 |
| 18 | Jonata | 85 | 80 | 78 | 81 | 3 |
| 19 | Le3 | 78 | 79 | 83 | 80 | 3 |
| 20 | Victor Vbabao | 78 | 84 | 78 | 80 | 3 |
| 21 | Vanzela | 84 | 79 | 77 | 80 | 3 |
| 22 | Jao | 77 | 78 | 82 | 79 | 4 |
| 23 | Thiago | 77 | 83 | 77 | 79 | 4 |
| 24 | Bato | 82 | 77 | 75 | 78 | 4 |
| 25 | Daniel | 75 | 76 | 80 | 77 | 4 |
| 26 | Yan | 75 | 81 | 75 | 77 | 4 |
| 27 | Augusto | 80 | 75 | 73 | 76 | 4 |
| 28 | Tuco | 52 | 76 | 52 | 60 | 4 |

(Tuco nasce "rato de farm": fraco no geral, mas com um farm respeitável — o tipo de
perfil que pode aprontar uma zebra se o X1 virar maratona de CS. Tudo ajustável.)

Cada jogador no código:
`{ id: string (slug), name: string, kill: number, farm: number, torre: number }`.
O `overall` é calculado: `round((kill + farm + torre) / 3)`.

## Motor de simulação

Tudo determinístico a partir de um **PRNG com seed** (ex.: `mulberry32`), para que a
Copa seja reproduzível e salvável. A seed é gerada ao criar a Copa e guardada no estado.

A partida é resolvida em **dois passos**: primeiro escolhe-se a *frente* onde o X1 se
decide (que vira a forma da vitória), depois quem vence **naquela frente**. São os três
atributos que decidem tudo — o overall só serve pra potes/seeding/exibição.

### Passo 1 — Em qual frente o X1 se decide (kill / farm / torre)

A partida pende para a frente onde **algum dos dois jogadores é mais forte** — é o que
permite a um especialista arrastar o jogo para o terreno dele (motor da zebra):

```
peso_d = max(A.stat_d, B.stat_d) ^ PULL        // d ∈ {kill, farm, torre}
```

Sorteia a frente `d` com probabilidade proporcional a `peso_d`. O expoente `PULL`
controla o quanto a frente mais forte domina o sorteio. A frente sorteada é a
**forma da vitória** (`winType`).

### Passo 2 — Quem vence naquela frente

Cada jogador recebe uma **forma do dia** (ruído aleatório) e disputa com o atributo
*daquela frente*:

```
form = (rng() * 2 - 1) * FORM_AMPLITUDE        // uniforme em [-FORM_AMPLITUDE, +FORM_AMPLITUDE]
effA = A.stat_d + formA
effB = B.stat_d + formB
P(A vence) = 1 / (1 + 10 ^ ((effB - effA) / SCALE))
```

Sorteia `rng() < P(A)` para decidir o vencedor.

**Constantes padrão (ajustáveis na implementação via TDD):**
- `PULL = 4` → frentes onde alguém é forte dominam o sorteio, mas a frente fraca não é impossível.
- `SCALE = 10` → na frente, atributos iguais = 50%; +10 ≈ 76%. Menor que antes porque os
  atributos numa mesma frente ficam mais próximos e a especialização precisa pesar.
- `FORM_AMPLITUDE = 6` → dá o "dia inspirado/dia ruim" e abre a fresta da zebra.

**Efeito da zebra:** um confronto Tuco (kill 52 / **farm 76** / torre 52) vs um overall
maior porém menos especializado em farm tende, com frequência, a cair na frente do
**farm** (porque o farm 76 do Tuco puxa o jogo pra lá). Nessa frente específica a
diferença encolhe e a "forma do dia" pode coroar o azarão. Já contra alguém com farm
alto, o Tuco apanha igual. É a especialização, não a sorte pura, que cria a zebra.

A partida resolvida retorna:
`{ winnerId, loserId, winType: 'kill' | 'farm' | 'torre', decisiveness, formWinner, formLoser }`,
onde `decisiveness = effVencedor − effPerdedor` na frente decidida (alto = atropelo,
baixo/negativo = sufoco/zebra) — usado só para narrativa/UI.

## Estrutura do torneio

### Sorteio (draw)

- 4 potes de 7, por overall (ver tabela). 
- 7 grupos (A–G) de 4, **um de cada pote por grupo**, com a posição dentro do pote
  sorteada pelo PRNG. Grupos equilibrados, sem "grupo da morte" só de top.

### Fase de grupos

- Todos contra todos dentro do grupo: 6 jogos por grupo, 42 no total.
- Pontuação: vitória = 3, derrota = 0 (não há empate em X1).
- **Classificação no grupo** (ordem de desempate):
  1. Pontos
  2. Confronto direto entre os empatados
  3. Maior overall
  4. Sorteio (PRNG)
- Classificam: **1º e 2º de cada grupo (14)** + **2 melhores 3º lugares = 16**.
- **Ranking dos 3º lugares** (para escolher os 2 melhores): pontos → overall → PRNG.

### Mata-mata

- 16 classificados → **Oitavas → Quartas → Semifinal → Final**.
- **Disputa de 3º lugar:** os perdedores das semifinais jogam pelo bronze.
- **Seeding do chaveamento:** os 16 são ranqueados por camada
  (1ºs de grupo, depois 2ºs, depois melhores 3ºs), e dentro de cada camada por
  pontos → overall. Esse ranking 1..16 monta um chaveamento semeado padrão
  (1×16, 8×9, 5×12, 4×13, 3×14, 6×11, 7×10, 2×15). Regra de cortesia: se nas oitavas
  cair um reencontro de mesmo grupo, aplica-se uma troca determinística para evitar.
- Confronto único em cada fase do mata-mata (não é melhor de N).

## Fluxo de telas

1. **Capa** — título "Copa Albus Nexus", botão *Nova Copa* e **Hall da Fama** dos campeões anteriores.
2. **Escolha seu fighter** — grid dos 28 com nome e overall; seleciona um.
3. **Sorteio dos grupos** — revelação animada dos 7 grupos.
4. **Hub do torneio** — fase/rodada atual em destaque, com o seu fighter no centro;
   tabelas dos grupos; botão *jogar próxima rodada*; aba "ver todos os confrontos".
5. **Tela de partida (suspense + revelação)** — os dois jogadores frente a frente,
   estado "simulando…" com tensão, e então revela o vencedor + a forma da vitória
   (farm/kill/torre) em destaque. As partidas do **seu fighter** sempre passam por
   essa tela; as demais auto-simulam, mas qualquer uma pode ser aberta para ver a
   revelação.
6. **Chaveamento (bracket)** — visual do mata-mata de 16 até a final.
7. **Campeão** — tela de troféu com o campeão; comemoração especial se for o seu fighter.
   Grava o campeão no Hall da Fama.

## Visual

Esports moderno: **dark mode + acentos neon**, layout limpo tipo transmissão de
campeonato (LEC/LCK). Cards de jogador com o overall em destaque; cores neon para
sinalizar vencedor e a forma da vitória (ex.: ícone/cor distinta para farm, kill e torre).

## Arquitetura

**Stack:** React + Vite + TypeScript + Tailwind. Publicável no GitHub Pages
(Vite com `base` configurado).

Módulos isolados, com fronteiras claras e testáveis:

| Módulo | Responsabilidade | Depende de |
|--------|------------------|------------|
| `data/players.ts` | Elenco fixo (gerado do .txt) | — |
| `engine/rng.ts` | PRNG com seed (mulberry32) | — |
| `engine/simMatch.ts` | Função pura: 2 jogadores + rng → resultado da partida | rng |
| `engine/draw.ts` | Sorteio: elenco + rng → 7 grupos | rng |
| `engine/groupStage.ts` | Tabelas, desempates, 16 classificados | simMatch |
| `engine/bracket.ts` | Monta e avança o mata-mata (+ 3º lugar) | simMatch |
| `engine/tournament.ts` | Máquina de estados das fases | os engines acima |
| `store/` | Estado React + persistência localStorage | tournament |
| `components/` | As 7 telas e UI compartilhada | store |

**Máquina de estados (fases):**
`HOME → SELECT_FIGHTER → DRAW → GROUP_STAGE → R16 → QF → SF → BRONZE → FINAL → CHAMPION`

**Persistência (localStorage):**
- Estado da Copa atual + seed do PRNG, sob uma chave (sobrevive ao F5).
- *Nova Copa* limpa a run atual, mas **preserva o Hall da Fama**.
- Hall da Fama: lista de `{ champion, date, fighterEscolhido, seed }`.

## Tratamento de erros / casos de borda

- localStorage indisponível ou corrompido → começa do zero sem quebrar (try/catch).
- Empates triplos no grupo → cadeia de desempate aplicada na ordem definida; PRNG
  garante resolução final determinística.
- Reencontro de mesmo grupo nas oitavas → regra de troca determinística no seeding.
- Estado salvo de versão antiga/incompatível → descarta e reinicia a run.

## Testes (Vitest)

Foco no motor (funções puras, TDD):
- `simMatch`: ao longo de N execuções — (a) a frente decidida tende às frentes onde os
  jogadores são fortes (passo 1); (b) na frente decidida, o mais forte naquele atributo
  vence mais; (c) um especialista (ex.: Tuco no farm) tem chance de zebra perceptível
  quando o jogo cai na sua frente, mas apanha consistentemente fora dela; (d) `overall`
  derivado = `round((kill+farm+torre)/3)`.
- `draw`: sempre produz 7 grupos de 4, um de cada pote, sem repetição.
- `groupStage`: pontuação e cadeia de desempate corretas; seleciona 16 (14 + 2 melhores 3ºs).
- `bracket`: avanço correto das fases, disputa de 3º lugar, sem reencontro de grupo nas oitavas.
- Determinismo: mesma seed → mesma Copa.
