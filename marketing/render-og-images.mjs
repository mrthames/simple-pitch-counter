import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const images = [
  { html: 'og-image.html', out: 'og-image-1200x630.png' },
  { html: 'og-image-android-beta.html', out: 'og-image-android-beta-1200x630.png' },
];

(async () => {
  const browser = await chromium.launch();

  for (const { html, out } of images) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`file://${path.join(__dirname, html).replace(/\\/g, '/')}`);
    await page.waitForTimeout(1000);

    await page.locator('.og').screenshot({
      path: path.join(__dirname, 'finals', out),
    });
    console.log(`Saved ${out}`);
    await context.close();
  }

  await browser.close();
  console.log('Done — OG images saved to marketing/finals/');
})();
