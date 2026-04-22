import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'feature-graphic.html');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(1000);

  await page.locator('.banner').screenshot({
    path: path.join(__dirname, 'finals', 'feature-graphic-1024x500.png'),
  });

  await browser.close();
  console.log('Done — feature-graphic-1024x500.png saved to marketing/finals/');
})();
