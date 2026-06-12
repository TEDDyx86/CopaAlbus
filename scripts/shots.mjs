import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.SHOT_URL || 'http://localhost:5176/7-0Albus/';
const OUT = '.shots';
const VIEW = process.env.SHOT_MOBILE
  ? { width: 390, height: 844, deviceScaleFactor: 2 }
  : { width: 1340, height: 880, deviceScaleFactor: 2 };
const SUFFIX = process.env.SHOT_MOBILE ? '-m' : '';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, src) {
  const handle = await page.evaluateHandle((s) => {
    const rx = new RegExp(s);
    return [...document.querySelectorAll('button')].find((b) => rx.test(b.textContent || ''));
  }, src);
  const el = handle.asElement();
  if (!el) throw new Error('botão não encontrado: ' + src);
  await el.click();
  await sleep(60);
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}${SUFFIX}.png` });
  console.log('shot', name + SUFFIX);
}

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport(VIEW);
await page.evaluateOnNewDocument(() => localStorage.clear());

await page.goto(BASE, { waitUntil: 'networkidle0' });
await sleep(500);
await shot(page, '1-home');

await clickText(page, 'Nova Copa');
await sleep(500);
await shot(page, '2-roll');

await clickText(page, 'Ficar com');
await sleep(500);
await shot(page, '3-draw');

await clickText(page, 'Começar a Copa');
await sleep(400);
await shot(page, '4-hub');

await clickText(page, 'Jogar rodada');
await sleep(300);
await clickText(page, 'Jogar rodada');
await sleep(300);
await clickText(page, 'Jogar rodada'); // 3ª rodada -> R16
await sleep(500);
await shot(page, '5-bracket-empty');

await clickText(page, 'Jogar Oitavas'); // resolve R16 -> QF
await sleep(500);
await shot(page, '6-bracket-played');

// abrir reveal de um confronto resolvido das oitavas
const opened = await page.evaluateHandle(() =>
  [...document.querySelectorAll('button')].find((b) => /ver lance/i.test(b.textContent || '')),
);
const el = opened.asElement();
if (el) {
  await el.click();
  await sleep(1900);
  await shot(page, '7-reveal');
  await clickText(page, 'Continuar');
  await sleep(300);
}

// seguir até o campeão
for (const label of ['Jogar Quartas', 'Jogar Semifinal', 'Jogar Disputa', 'Jogar Final']) {
  try { await clickText(page, label); await sleep(450); } catch { /* fase pode variar */ }
}
await sleep(600);
await shot(page, '8-champion');

await browser.close();
console.log('done');
