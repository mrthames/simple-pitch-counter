import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches, throwPitches, waitForFlashToClear } from './helpers';

test.describe('Game summary and export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('summary screen accessible from hamburger menu', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);
    await expect(page.locator('#screen-summary .summary-nav-title')).toHaveText('Game Summary');
  });

  test('summary shows pitcher stats', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.', awayPitcher: 'Sam T.' });
    await addSimplePitches(page, 12);

    await page.click('.menu-btn');
    await page.click('text=Game summary');

    const homePitchers = page.locator('#sum-home-pitchers-wrap');
    await expect(homePitchers).toContainText('Jake M.');
    await expect(homePitchers).toContainText('12');
  });

  test('summary has home run input fields', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });

    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await expect(page.locator('#sum-hr-hl')).toContainText('Tigers');
    await expect(page.locator('#sum-hr-al')).toContainText('Lions');
    await expect(page.locator('#sum-hr-home')).toBeVisible();
    await expect(page.locator('#sum-hr-away')).toBeVisible();
  });

  test('summary has umpire fields', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await expect(page.locator('#sum-pu-name')).toBeVisible();
    await expect(page.locator('#sum-bu-name')).toBeVisible();
  });

  test('generate report creates export text', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 10);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.click('text=Generate Report');

    await expect(page.locator('#screen-export')).toHaveClass(/active/);
    const exportText = await page.locator('#export-box').textContent();
    expect(exportText).toContain('Game Summary');
    expect(exportText).toContain('Tigers');
    expect(exportText).toContain('Lions');
    expect(exportText).toContain('10');
  });

  test('export includes umpire data when filled', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.fill('#sum-pu-name', 'John Doe');
    await page.click('text=Generate Report');

    const exportText = await page.locator('#export-box').textContent();
    expect(exportText).toContain('John Doe');
  });

  test('export includes pitch type breakdown in advanced mode', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);
    await throwPitches(page, 'CS', 2);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.click('text=Generate Report');

    const exportText = await page.locator('#export-box').textContent();
    expect(exportText).toContain('Pitch Type Breakdown');
    expect(exportText).toContain('B:3');
    expect(exportText).toContain('K:0');
  });

  test('end game from summary saves to history', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.click('text=End & Save');
    await page.click('.modal-btn.red');

    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
  });

  test('back button returns to game from summary', async ({ page }) => {
    await startGame(page, { mode: 'simple' });

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);

    await page.locator('#screen-summary .btn-sm').filter({ hasText: 'Back' }).click();
    await expect(page.locator('#screen-game')).toHaveClass(/active/);
  });

  test('export back button returns to summary', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.click('text=Generate Report');
    await expect(page.locator('#screen-export')).toHaveClass(/active/);

    await page.locator('#screen-export .btn-sm').filter({ hasText: 'Back' }).click();
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);
  });
});
