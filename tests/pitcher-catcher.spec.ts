import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches, throwPitches, waitForFlashToClear } from './helpers';

test.describe('Pitcher and catcher management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('pitcher name and pitch count display on game screen', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await expect(page.locator('.pitcher-name')).toContainText('Jake M.');
    await expect(page.locator('.pitch-count-badge-num').first()).toHaveText('0');
  });

  test('change pitcher mid-game via picker', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');

    await page.fill('#new-p-name', 'Relief P.');
    await page.locator('#pitcher-select-list .add-player-form .btn-sm').click();

    // Picker auto-closes after add and new pitcher is selected
    await expect(page.locator('.pitcher-name')).toContainText('Relief P.');
    await expect(page.locator('.pitch-count-badge-num').first()).toHaveText('0');
  });

  test('original pitcher retains pitch count after switch', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 8);

    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.fill('#new-p-name', 'Relief P.');
    await page.locator('#pitcher-select-list .add-player-form .btn-sm').click();

    // Picker auto-closes after add — reopen to verify original pitcher count
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    const originalRow = page.locator('#pitcher-select-list .player-row').filter({ hasText: 'Jake M.' });
    await expect(originalRow).toContainText('8 pitches');
  });

  test('switch back to original pitcher preserves count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.fill('#new-p-name', 'Relief P.');
    await page.locator('#pitcher-select-list .add-player-form .btn-sm').click();

    // Picker auto-closes, Relief P. selected — add pitches then switch back
    await addSimplePitches(page, 3);

    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .player-row').filter({ hasText: 'Jake M.' }).click();
    await expect(page.locator('.pitch-count-badge-num').first()).toHaveText('5');
  });

  test('catcher displays when set during setup', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    const catcherSection = page.locator('#catcher-section');
    await expect(catcherSection).toContainText('Mike C.');
  });

  test('change catcher mid-game', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });

    const catcherSection = page.locator('#catcher-section');
    await catcherSection.locator('.btn-sm').filter({ hasText: 'Change' }).click();
    await page.fill('#new-c-name', 'New Catcher');
    await catcherSection.locator('.btn-sm').filter({ hasText: 'Add' }).click();

    // Picker auto-closes after add and new catcher is selected
    await expect(catcherSection).toContainText('New Catcher');
  });

  test('default catcher created when none provided at setup', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await expect(page.locator('#catcher-section')).toContainText('Catcher 1');
  });

  test('pitcher stats sheet shows in advanced mode', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 2);
    await throwPitches(page, 'CS', 1);
    await throwPitches(page, 'F', 1);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');

    const statsText = await page.locator('.stats-sheet').textContent();
    expect(statsText).toContain('Jake M.');
    expect(statsText).toContain('4');
  });

  test('pitcher switches between half innings', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.', awayPitcher: 'Sam T.' });

    // TOP 1: home team fields, so home pitcher (Jake M.) is active
    await expect(page.locator('.pitcher-name')).toContainText('Jake M.');

    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');

    // BOT 1: away team fields, so away pitcher (Sam T.) is active
    await expect(page.locator('.pitcher-name')).toContainText('Sam T.');
  });

  test('catcher inning count increments after fielding half', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });

    // End TOP 1 (home catcher gets 1 inning), then BOT 1 → now at TOP 2
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');

    // At TOP 2: home catcher has 1 inning, 3 remaining
    const catcherSection = page.locator('#catcher-section');
    await expect(catcherSection).toContainText('3 innings remaining');
    await expect(catcherSection).toContainText('of 4 inn.');
  });

  test('change pitcher picker uses player-picker card style', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await expect(page.locator('#pitcher-select-list .player-picker')).toBeVisible();
  });
});
