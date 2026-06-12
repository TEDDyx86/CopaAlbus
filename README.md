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
As faixas e chances dos tiers de raridade ficam em `src/engine/fighterRoll.ts`.

## Publicar

`npm run build` gera `dist/`. O workflow em `.github/workflows/deploy.yml` publica no
GitHub Pages a cada push na branch principal (habilite em Settings → Pages → Source =
"GitHub Actions"). O caminho base (`base` em `vite.config.ts`) está como `/7-0Albus/` —
ajuste se o repositório tiver outro nome.
