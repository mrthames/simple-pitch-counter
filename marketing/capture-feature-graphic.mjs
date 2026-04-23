import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, '..', 'app', 'index.html');
const sampleDataPath = path.join(__dirname, 'sample-data.js');

import fs from 'fs';
const sampleData = fs.readFileSync(sampleDataPath, 'utf-8');

(async () => {
  const browser = await chromium.launch();

  // Capture Advanced mode screen
  const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page1 = await ctx1.newPage();
  await page1.goto(`file://${appPath.replace(/\\/g, '/')}`);
  await page1.evaluate(sampleData);
  await page1.reload();
  await page1.waitForTimeout(1000);
  await page1.screenshot({ path: path.join(__dirname, 'finals', '01-advanced-mode-screen.png') });

  // Capture Simple mode screen (start a simple game)
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page2 = await ctx2.newPage();
  await page2.goto(`file://${appPath.replace(/\\/g, '/')}`);
  // Load sample data but switch to a simple mode game view
  const simpleState = `
    const s = ${sampleData.replace('const sampleState =', '').replace(/localStorage\.setItem.*/, '').replace(/console\.log.*/g, '')};
    // Set current game to null so we land on history
    s.currentGame = null;
    localStorage.setItem('spc_v1', JSON.stringify(s));
  `;
  // Just use sample data as-is and navigate to history
  await page2.evaluate(sampleData);
  await page2.reload();
  await page2.waitForTimeout(1000);
  // Navigate to history screen
  await page2.evaluate(() => showScreen('history'));
  await page2.waitForTimeout(500);
  await page2.screenshot({ path: path.join(__dirname, 'finals', '02-simple-mode-screen.png') });

  await browser.close();
  console.log('Done — captured app screenshots for feature graphic');
})();
