import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches } from './helpers';

test.describe('History and configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('history shows empty state on fresh load', async ({ page }) => {
    await expect(page.locator('#history-list')).toContainText('No games yet');
  });

  test('completed game appears in history list', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
  });

  test('multiple games appear in history', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 3);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await startGame(page, { mode: 'simple', homeTeam: 'Bears', awayTeam: 'Wolves' });
    await addSimplePitches(page, 4);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
    await expect(page.locator('#history-list')).toContainText('Wolves vs Bears');
  });

  test('history shows pitch counts for pitchers', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 25);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    const histCard = page.locator('.hist-card').first();
    await expect(histCard).toContainText('25');
  });

  test('clicking history card shows stats modal', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 10);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.locator('.hist-card').first().locator('text=View stats').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Lions vs Tigers');
  });

  test('close game without ending saves as live game', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Close');

    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    const histCard = page.locator('.hist-card').first();
    await expect(histCard).toContainText('Lions vs Tigers');
  });

  test('history persists across page reload', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.reload();
    await page.waitForSelector('#screen-history.active');
    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
  });

  test('setup shows default configuration preset', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#setup-config-name')).toContainText('Default');
  });

  test('setup mode toggle between simple and advanced', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.click('#mode-simple');
    await expect(page.locator('#mode-simple')).toHaveClass(/selected/);

    await page.click('#mode-advanced');
    await expect(page.locator('#mode-advanced')).toHaveClass(/selected/);
  });

  test('setup cancel returns to history', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#screen-setup')).toHaveClass(/active/);

    await page.locator('#screen-setup .btn-sm').filter({ hasText: 'Games' }).click();
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
  });

  test('game mode shows in history card', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    const histCard = page.locator('.hist-card').first();
    await expect(histCard).toContainText('Advanced');
  });
});
