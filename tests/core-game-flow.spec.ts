import { test, expect } from '@playwright/test';
import { clearState, startGame, getPitchCount, addSimplePitches, getInningText, getScore } from './helpers';

test.describe('Core game flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('history screen shows empty state on fresh load', async ({ page }) => {
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    await expect(page.locator('#history-list')).toContainText('No games yet');
  });

  test('setup screen opens from new game button', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#screen-setup')).toHaveClass(/active/);
    await expect(page.locator('.setup-nav-title')).toHaveText('New Game');
  });

  test('cannot start game without a pitcher', async ({ page }) => {
    await page.click('.new-game-btn');
    page.on('dialog', dialog => dialog.accept());
    await page.fill('#hp-name', '');
    await page.fill('#ap-name', '');
    await page.click('.start-btn');
    await expect(page.locator('#screen-setup')).toHaveClass(/active/);
  });

  test('start game in simple mode and add pitches', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await expect(page.locator('#simple-content')).toBeVisible();

    await addSimplePitches(page, 5);
    const count = await getPitchCount(page);
    expect(count).toBe(5);
  });

  test('simple mode shows at-bat count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    await expect(page.locator('#simple-batter-num')).toHaveText('3');
  });

  test('next batter resets at-bat count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 4);
    await expect(page.locator('#simple-batter-num')).toHaveText('4');

    await page.locator('#simple-content .adv-secondary-btn', { hasText: 'Next batter' }).click();
    await expect(page.locator('#simple-batter-num')).toHaveText('0');

    const total = await getPitchCount(page);
    expect(total).toBe(4);
  });

  test('undo reverts last pitch', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    expect(await getPitchCount(page)).toBe(3);

    await page.click('#undo-btn-simple');
    expect(await getPitchCount(page)).toBe(2);
  });

  test('end half inning advances from top to bottom', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    const inning = await getInningText(page);
    expect(inning).toContain('TOP');
    expect(inning).toContain('1');

    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');

    const after = await getInningText(page);
    expect(after).toContain('BOT');
    expect(after).toContain('1');
  });

  test('end half inning advances from bottom to next inning top', async ({ page }) => {
    await startGame(page, { mode: 'simple' });

    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    const bot1 = await getInningText(page);
    expect(bot1).toContain('BOT');

    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    const top2 = await getInningText(page);
    expect(top2).toContain('TOP');
    expect(top2).toContain('2');
  });

  test('score adjustments work', async ({ page }) => {
    await startGame(page, { mode: 'simple' });

    await page.locator('.sb-adj').filter({ hasText: '+' }).first().click();
    await page.locator('.sb-adj').filter({ hasText: '+' }).first().click();

    const score = await getScore(page);
    expect(score.away).toBe(2);
  });

  test('score cannot go below zero', async ({ page }) => {
    await startGame(page, { mode: 'simple' });

    const minusBtn = page.locator('.sb-adj').filter({ hasText: '−' }).first();
    await minusBtn.click();
    await minusBtn.click();

    const score = await getScore(page);
    expect(score.away).toBe(0);
  });

  test('end game saves to history', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    await expect(page.locator('#history-list')).toContainText('Lions vs Tigers');
  });

  test('game persists across reload', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 7);

    await page.reload();
    await page.waitForSelector('#screen-game.active');
    expect(await getPitchCount(page)).toBe(7);
  });
});
