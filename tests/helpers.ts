import { Page, expect } from '@playwright/test';

export async function clearState(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#screen-history.active');
}

export async function startGame(page: Page, options: {
  mode?: 'simple' | 'advanced';
  homePitcher?: string;
  awayPitcher?: string;
  homeCatcher?: string;
  awayCatcher?: string;
  homeTeam?: string;
  awayTeam?: string;
} = {}) {
  const {
    mode = 'advanced',
    homePitcher = 'Jake M.',
    awayPitcher = 'Sam T.',
    homeCatcher = '',
    awayCatcher = '',
    homeTeam = 'Eagles',
    awayTeam = 'Hawks',
  } = options;

  await page.click('.new-game-btn');
  await page.waitForSelector('#screen-setup.active');

  if (mode === 'simple') {
    await page.click('#mode-simple');
  } else {
    await page.click('#mode-advanced');
  }

  if (homeTeam) await page.fill('#s-home', homeTeam);
  if (awayTeam) await page.fill('#s-away', awayTeam);
  if (homePitcher) await page.fill('#hp-name', homePitcher);
  if (awayPitcher) await page.fill('#ap-name', awayPitcher);
  if (homeCatcher) await page.fill('#hc-name', homeCatcher);
  if (awayCatcher) await page.fill('#ac-name', awayCatcher);

  await page.click('.start-btn');
  await page.waitForSelector('#screen-game.active');
}

export async function getPitchCount(page: Page): Promise<number> {
  const text = await page.locator('.pitch-count-badge-num').first().textContent();
  return parseInt(text || '0');
}

export async function getBallCount(page: Page): Promise<number> {
  const text = await page.locator('#balls-num').textContent();
  return parseInt(text || '0');
}

export async function getStrikeCount(page: Page): Promise<number> {
  const text = await page.locator('#strikes-num').textContent();
  return parseInt(text || '0');
}

export async function getOutCount(page: Page): Promise<number> {
  return await page.locator('.out-dot.filled').count();
}

export async function getScore(page: Page): Promise<{ home: number; away: number }> {
  const home = parseInt(await page.locator('#sb-home-score').textContent() || '0');
  const away = parseInt(await page.locator('#sb-away-score').textContent() || '0');
  return { home, away };
}

export async function getInningText(page: Page): Promise<string> {
  return await page.locator('#inn-pill').textContent() || '';
}

export async function throwPitches(page: Page, type: string, count: number) {
  for (let i = 0; i < count; i++) {
    await page.click(`.pitch-btn.pt-${type}`);
    await page.waitForTimeout(100);
  }
}

export async function addSimplePitches(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await page.click('.big-btn.blue');
    await page.waitForTimeout(100);
  }
}

export async function waitForFlashToClear(page: Page) {
  await page.waitForTimeout(1000);
}

export async function handleBIP(page: Page, result: 'safe' | 'out') {
  await page.waitForSelector('#bip-overlay[style*="flex"]', { timeout: 2000 });
  if (result === 'safe') {
    await page.click('.bip-btn.safe');
  } else {
    await page.click('.bip-btn.out');
  }
  await waitForFlashToClear(page);
}
