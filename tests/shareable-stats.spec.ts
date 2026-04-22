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
    await expect(page.locator('.stats-sheet')).toContainText('Share');
  });

  test('all pitchers quick stats has Share button', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Quick stats');
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
    await page.click('text=Quick stats');
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
    await page.click('text=Quick stats');
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

  test('individual pitcher share from history detail', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 10);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');

    // Click a pitcher row to expand details
    const pitcherRow = page.locator('#saved-stats-overlay .stats-sheet').getByText('Jake M.');
    await pitcherRow.click();

    // Expanded detail should have individual share link
    await expect(page.locator('#saved-stats-overlay')).toContainText('Share pitcher stats');
  });
});
