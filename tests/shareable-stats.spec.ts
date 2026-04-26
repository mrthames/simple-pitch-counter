import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches, throwPitches } from './helpers';

test.describe('Shareable stats cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('individual pitcher stats sheet has Share button in advanced mode', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Share');
  });

  test('all pitchers quick stats has Share button', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Pitcher stats');
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Share');
    await expect(page.locator('.stats-sheet')).toContainText('Close');
  });

  test('quick stats shows last batter pitch count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    // Advance batter to record lastBatterPitches
    await page.locator('#simple-content .adv-secondary-btn', { hasText: 'Next batter' }).click();
    await page.waitForTimeout(200);

    await page.click('.menu-btn');
    await page.click('text=Pitcher stats');
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Last batter: 5');
  });

  test('history stats overlay has Share button', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 10);

    // End game
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    // Open stats from history card
    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');
    await expect(page.locator('#saved-stats-overlay .stats-sheet')).toContainText('Share');
    await expect(page.locator('#saved-stats-overlay .stats-sheet')).toContainText('Close');
  });

  test('history stats shows last batter in pitcher rows', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 8);

    // Advance batter to set lastBatterPitches=8
    await page.locator('#simple-content .adv-secondary-btn', { hasText: 'Next batter' }).click();
    await page.waitForTimeout(200);
    await addSimplePitches(page, 3);

    // End game
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');
    await expect(page.locator('#saved-stats-overlay .stats-sheet')).toContainText('Last batter: 8');
  });

  test('share button triggers download in browser (non-iOS fallback)', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('.stats-sheet').getByText('Share', { exact: true }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('pitcher-stats.png');
    }
  });

  test('pitcher list share triggers download in browser', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Pitcher stats');
    await page.waitForSelector('.stats-sheet');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('.stats-sheet').getByText('Share', { exact: true }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('game-stats.png');
    }
  });

  test('advanced mode individual stats card has pitch breakdown', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);
    await throwPitches(page, 'CS', 2);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Share');
    await expect(page.locator('.stats-sheet')).toContainText('Pitch Breakdown');
  });

  test('history stats share button triggers download', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('#saved-stats-overlay .stats-sheet').getByText('Share', { exact: true }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('game-stats.png');
    }
  });

  test('individual pitcher share from history triggers image download', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 10);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');

    const pitcherRow = page.locator('#saved-stats-overlay .stats-sheet').getByText('Jake M.');
    await pitcherRow.click();
    await expect(page.locator('#saved-stats-overlay')).toContainText('Share pitcher stats');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('#saved-stats-overlay').getByText('Share pitcher stats').click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('pitcher-stats.png');
    }
  });

  test('swipe down dismisses stats sheet overlay', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Pitcher stats');
    await page.waitForSelector('.stats-sheet');

    const sheet = page.locator('.stats-sheet');
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(page.locator('.stats-sheet-overlay')).toHaveCount(0);
  });

  test('small swipe does not dismiss stats sheet', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Pitcher stats');
    await page.waitForSelector('.stats-sheet');

    const sheet = page.locator('.stats-sheet');
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 50, { steps: 5 });
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(page.locator('.stats-sheet-overlay')).toHaveCount(1);
  });

  test('history stats overlay supports swipe dismiss', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');

    const sheet = page.locator('#saved-stats-overlay .stats-sheet');
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(page.locator('#saved-stats-overlay')).toHaveCount(0);
  });

  test('summary stats drawer shows K BB BIP boxes', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'CS', 3);
    await throwPitches(page, 'B', 4);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.waitForSelector('#screen-summary.active');

    await page.locator('#screen-summary .stats-btn').first().click();
    await page.waitForSelector('#sum-stats-overlay .stats-sheet');
    await expect(page.locator('#sum-stats-overlay .stats-summary-row')).toBeVisible();
    await expect(page.locator('#sum-stats-overlay .stats-summary-lbl', { hasText: /^K\b/ })).toBeVisible();
    await expect(page.locator('#sum-stats-overlay .stats-summary-lbl', { hasText: /^BB\b/ })).toBeVisible();
    await expect(page.locator('#sum-stats-overlay .stats-summary-lbl', { hasText: /^BIP\b/ })).toBeVisible();
  });

  test('summary stats drawer has Share button', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.waitForSelector('#screen-summary.active');

    await page.locator('#screen-summary .stats-btn').first().click();
    await page.waitForSelector('#sum-stats-overlay .stats-sheet');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('#sum-stats-overlay .stats-sheet').getByText('Share', { exact: true }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('pitcher-stats.png');
    }
  });

  test('summary stats drawer supports swipe dismiss', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.waitForSelector('#screen-summary.active');

    await page.locator('#screen-summary .stats-btn').first().click();
    await page.waitForSelector('#sum-stats-overlay .stats-sheet');

    const sheet = page.locator('#sum-stats-overlay .stats-sheet');
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 200, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(page.locator('#sum-stats-overlay')).toHaveCount(0);
  });

  test('live game pitcher stats shows K BB BIP boxes', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'CS', 3);
    await throwPitches(page, 'B', 2);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');
    const sheet = page.locator('.stats-sheet');
    await expect(sheet.locator('.stats-summary-row')).toBeVisible();
    await expect(sheet.locator('.stats-summary-lbl', { hasText: /^K\b/ })).toBeVisible();
    await expect(sheet.locator('.stats-summary-lbl', { hasText: /^BB\b/ })).toBeVisible();
    await expect(sheet.locator('.stats-summary-lbl', { hasText: /^BIP\b/ })).toBeVisible();
  });

  test('history detail expanded pitcher shows K BB BIP boxes', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'CS', 3);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');

    const pitcherRow = page.locator('#saved-stats-overlay .stats-sheet').getByText('Jake M.');
    await pitcherRow.click();

    await expect(page.locator('#saved-stats-overlay .stats-summary-row')).toBeVisible();
    await expect(page.locator('#saved-stats-overlay .stats-summary-lbl', { hasText: /^K\b/ })).toBeVisible();
  });
});
