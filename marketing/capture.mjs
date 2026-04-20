import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'screenshots.html');

const slides = [
  { id: 'slide-1', name: '01-advanced-pitch-tracking' },
  { id: 'slide-2', name: '02-simple-mode' },
  { id: 'slide-3-combo', name: '03-simple-and-advanced' },
  { id: 'slide-4', name: '04-live-scoreboard' },
  { id: 'slide-5', name: '05-pitcher-stats' },
  { id: 'slide-6', name: '06-game-history' },
  { id: 'slide-7', name: '07-game-summaries' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 2800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(3000);

  for (const slide of slides) {
    const el = page.locator(`#${slide.id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const outPath = path.join(__dirname, `${slide.name}.png`);
    await el.screenshot({ path: outPath });
    console.log(`Captured ${slide.name}`);
  }

  await browser.close();
  console.log('Done.');
})();
