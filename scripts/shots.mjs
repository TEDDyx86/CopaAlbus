import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.SHOT_URL || 'http://localhost:5176/';
const OUT = '.shots';
const KEY = 'copa-albus-nexus:run:v2';
const VIEW = process.env.SHOT_MOBILE
  ? { width: 390, height: 844, deviceScaleFactor: 2 }
  : { width: 1340, height: 880, deviceScaleFactor: 2 };
const SUFFIX = process.env.SHOT_MOBILE ? '-m' : '';

const states = JSON.parse(readFileSync(`${OUT}/states.json`, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, src) {
  const handle = await page.evaluateHandle((s) => {
    const rx = new RegExp(s);
    return [...document.querySelectorAll('button')].find((b) => rx.test(b.textContent || ''));
  }, src);
  const el = handle.asElement();
  if (!el) throw new Error('botão não encontrado: ' + src);
  await el.click();
  await sleep(80);
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}${SUFFIX}.png` });
  console.log('shot', name + SUFFIX);
}

/** injeta um RunState no localStorage e recarrega a app */
async function load(page, state) {
  await page.evaluate((k, s) => localStorage.setItem(k, JSON.stringify(s)), KEY, state);
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(400);
}

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport(VIEW);

await page.goto(BASE, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await sleep(400);
await shot(page, '1-home');

await clickText(page, 'Nova campanha');
await sleep(400);
await shot(page, '2-roll');

await clickText(page, 'Ficar com');
await sleep(300);
await clickText(page, 'Jogar jogo'); // 1 jogo de grupo
await sleep(300);
await shot(page, '3-groups');

await load(page, states.seriesMid);
await shot(page, '4-series');

await load(page, states.eliminated);
await shot(page, '5-eliminated');

await load(page, states.champion);
await sleep(500);
await shot(page, '6-champion');

await browser.close();
console.log('done');
