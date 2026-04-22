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

  test('summary radio button labels are visible', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await expect(page.locator('.form-row-lbl').filter({ hasText: 'Plate issues?' })).toBeVisible();
    await expect(page.locator('.form-row-lbl').filter({ hasText: 'Base issues?' })).toBeVisible();
  });

  test('mid-game summary hides report and end actions', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await expect(page.locator('#sum-actions')).not.toBeVisible();
  });

  test('edit summary from history card opens summary screen', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 10);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Edit summary');
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);
    await expect(page.locator('#sum-home-pitchers-wrap')).toContainText('Jake M.');
  });

  test('history summary shows save and share buttons', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Edit summary');
    await expect(page.locator('#sum-actions')).toBeVisible();
    await expect(page.locator('#sum-actions')).toContainText('Save');
    await expect(page.locator('#sum-actions')).toContainText('Share');
  });

  test('history summary save persists umpire edits', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Edit summary');
    await page.fill('#sum-pu-name', 'John Doe');
    await page.click('text=Save');

    await page.locator('#screen-summary .btn-sm').filter({ hasText: 'Back' }).click();
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Edit summary');
    await expect(page.locator('#sum-pu-name')).toHaveValue('John Doe');
  });

  test('history summary share generates export with tagline', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Edit summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('Tigers');
    expect(modalText).toContain('Simple Pitch Counter');
  });

  test('export includes umpire data when filled', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await page.fill('#sum-pu-name', 'John Doe');

    await page.locator('#screen-summary .btn-sm').filter({ hasText: 'Back' }).click();
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Edit summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('John Doe');
  });

  test('export includes pitch type breakdown in advanced mode', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);
    await throwPitches(page, 'CS', 2);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Edit summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('5');
  });

  test('end game from menu saves to history', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
  });

  test('end game modal only shows cancel and end now', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=End game');

    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('Cancel');
    expect(modalText).toContain('End now');
    expect(modalText).not.toContain('Go to summary');
  });

  test('back button returns to game from summary', async ({ page }) => {
    await startGame(page, { mode: 'simple' });

    await page.click('.menu-btn');
    await page.click('text=Game summary');
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);

    await page.locator('#screen-summary .btn-sm').filter({ hasText: 'Back' }).click();
    await expect(page.locator('#screen-game')).toHaveClass(/active/);
  });

  test('back button from history summary returns to history', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);

    await page.click('text=Edit summary');
    await expect(page.locator('#screen-summary')).toHaveClass(/active/);

    await page.locator('#screen-summary .btn-sm').filter({ hasText: 'Back' }).click();
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
  });
});
