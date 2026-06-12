# Product

## Register

product

## Users

O grupo de amigos **Albus Nexus** (28 pessoas) que jogam League of Legends juntos.
Usam o jogo no navegador, em momentos de descontração, geralmente para zoar e ver quem
o "destino" escolheu como fighter e até onde ele chega na Copa. Contexto descontraído,
sessões curtas, muitas vezes compartilhando tela ou o resultado no grupo.

## Product Purpose

Simulador estilo "7 a 0 da Copa do Mundo" aplicado a X1 de LoL entre os 28 do Albus
Nexus. O jogador recebe um fighter sorteado (raridade estilo gacha) e joga **a campanha
dele**: encara adversários sorteados aleatoriamente — 3 jogos na fase de grupos (precisa de
2 vitórias pra classificar), depois MD3 nas oitavas/quartas/semi e MD5 na final. Cada X1 se
decide por kill, farm ou torre. Vencer a final levanta a taça; perder qualquer série encerra
a campanha naquela fase. Sucesso = vontade de "rodar mais uma" e de mandar o print no grupo.

> Decisão de design: a simulação acompanha **apenas a run do fighter do jogador** (não o
> torneio inteiro). Adversários são sorteio uniforme entre os outros 27 — assim nenhum
> overall altíssimo (ex.: Boelitz 99) domina a Copa só por estar sempre no caminho.

## Brand Personality

Visual de **transmissão de esports** levado a sério (HUD escuro, placares, lower-thirds,
acentos neon, sensação de TV de campeonato) com **voz de zoeira entre amigos**: leve,
debochada, brasileira, próxima. A craft é "pro broadcast"; a fala é de grupo de Discord.
Três palavras: competitivo, debochado, vivo.

## Anti-references

- Dashboard corporativo / admin genérico (Bootstrap, Material padrão, tabelas sem alma).
- SaaS "cream/sand" minimalista, eyebrow tracking em toda seção, cards idênticos repetidos.
- Gacha exagerado tipo caça-níquel: brilho excessivo, dourado por tudo, ruído visual.
- Cara de "template de torneio" sério e sem personalidade.

## Design Principles

- **Parece transmissão, fala como amigo:** o rigor visual é de broadcast; o texto é de grupo.
- **O fighter é o astro:** quem o destino te deu merece destaque teatral, sobretudo na revelação.
- **Drama nos momentos certos:** roll lendário, zebra, título do campeão merecem teatro; o resto respira.
- **Contido por padrão, intenso por exceção:** escuro elegante na base, brilho só onde importa.
- **Legibilidade acima de estilo:** placares e tabelas têm que ler num relance, mesmo no escuro.

## Accessibility & Inclusion

- Contraste de corpo ≥ 4.5:1 mesmo no tema escuro; placares e tabelas com leitura imediata.
- As três frentes (kill/farm/torre) e o vencedor nunca dependem só de cor — sempre com ícone/rótulo.
- `prefers-reduced-motion`: revelações viram crossfade/instantâneo; nada de movimento essencial.
