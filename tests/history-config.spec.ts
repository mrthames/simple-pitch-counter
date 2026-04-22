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
    await expect(page.locator('.stats-sheet-overlay')).toBeVisible();
    await expect(page.locator('.stats-sheet')).toContainText('Lions vs Tigers');
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

  test('setup defaults to simple mode', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#mode-simple')).toHaveClass(/selected/);
    await expect(page.locator('#mode-advanced')).not.toHaveClass(/selected/);
  });

  test('setup mode toggle between simple and advanced', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#mode-simple')).toHaveClass(/selected/);

    await page.click('#mode-advanced');
    await expect(page.locator('#mode-advanced')).toHaveClass(/selected/);
    await expect(page.locator('#mode-simple')).not.toHaveClass(/selected/);

    await page.click('#mode-simple');
    await expect(page.locator('#mode-simple')).toHaveClass(/selected/);
    await expect(page.locator('#mode-advanced')).not.toHaveClass(/selected/);
  });

  test('setup auto-populates current time', async ({ page }) => {
    await page.click('.new-game-btn');
    const timeVal = await page.locator('#s-time').inputValue();
    expect(timeVal).toMatch(/^\d{2}:\d{2}$/);
  });

  test('setup date is pre-filled with today', async ({ page }) => {
    await page.click('.new-game-btn');
    const dateVal = await page.locator('#s-date').inputValue();
    const today = new Date().toISOString().split('T')[0];
    expect(dateVal).toBe(today);
  });

  test('setup name fields have autocapitalize attribute', async ({ page }) => {
    await page.click('.new-game-btn');
    const nameFields = ['#hp-name', '#hc-name', '#ap-name', '#ac-name', '#s-ump-plate', '#s-ump-base', '#s-home', '#s-away'];
    for (const sel of nameFields) {
      await expect(page.locator(sel)).toHaveAttribute('autocapitalize', 'words');
    }
  });

  test('advanced mode description text is not shown', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.click('#mode-advanced');
    await expect(page.locator('#mode-info')).toHaveCount(0);
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

  test('umpire fields clear on new game', async ({ page }) => {
    // Start a game and fill umpire in setup
    await page.click('.new-game-btn');
    await page.click('#mode-simple');
    await page.fill('#s-ump-plate', 'John Ump');
    await page.fill('#hp-name', 'Test P.');
    await page.fill('#ap-name', 'Test Q.');
    await page.click('.start-btn');
    await page.waitForSelector('#screen-game.active');

    // End game
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    // Start new game — umpire field should be empty
    await page.click('.new-game-btn');
    await expect(page.locator('#s-ump-plate')).toHaveValue('');
  });

  test('config form includes pitcher catch limit field', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=Configuration');
    await page.waitForSelector('#screen-config.active');

    // Click edit on default config
    await page.locator('.config-actions .btn-xs', { hasText: 'Edit' }).first().click();
    await page.waitForSelector('.modal-overlay');

    const catchField = page.locator('#cfg-pcatch');
    await expect(catchField).toBeVisible();
    await expect(catchField).toHaveValue('41');
  });

  test('config summary shows pitcher catch limit', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=Configuration');
    await page.waitForSelector('#screen-config.active');
    await expect(page.locator('.config-sub').first()).toContainText('no catch @41p');
  });
});
