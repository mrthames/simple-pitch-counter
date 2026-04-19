import { test, expect } from '@playwright/test';
import { clearState, startGame, getPitchCount, getBallCount, getStrikeCount, getOutCount, throwPitches, handleBIP, waitForFlashToClear, getInningText } from './helpers';

test.describe('Advanced mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
  });

  test('shows advanced UI elements', async ({ page }) => {
    await expect(page.locator('#adv-content')).toBeVisible();
    await expect(page.locator('#balls-num')).toHaveText('0');
    await expect(page.locator('#strikes-num')).toHaveText('0');
    await expect(page.locator('.pitch-btn.pt-B')).toBeVisible();
    await expect(page.locator('.pitch-btn.pt-CS')).toBeVisible();
    await expect(page.locator('.pitch-btn.pt-SS')).toBeVisible();
    await expect(page.locator('.pitch-btn.pt-F')).toBeVisible();
    await expect(page.locator('.pitch-btn.pt-BIP')).toBeVisible();
  });

  test('ball button increments ball count', async ({ page }) => {
    await page.click('.pitch-btn.pt-B');
    expect(await getBallCount(page)).toBe(1);
    expect(await getPitchCount(page)).toBe(1);
  });

  test('called strike increments strike count', async ({ page }) => {
    await page.click('.pitch-btn.pt-CS');
    expect(await getStrikeCount(page)).toBe(1);
  });

  test('swinging strike increments strike count', async ({ page }) => {
    await page.click('.pitch-btn.pt-SS');
    expect(await getStrikeCount(page)).toBe(1);
  });

  test('foul increments strike count when under 2', async ({ page }) => {
    await page.click('.pitch-btn.pt-F');
    expect(await getStrikeCount(page)).toBe(1);
  });

  test('foul does not increment strike count at 2 strikes', async ({ page }) => {
    await throwPitches(page, 'CS', 2);
    expect(await getStrikeCount(page)).toBe(2);

    await page.click('.pitch-btn.pt-F');
    expect(await getStrikeCount(page)).toBe(2);
    expect(await getPitchCount(page)).toBe(3);
  });

  test('four balls result in a walk and reset count', async ({ page }) => {
    await throwPitches(page, 'B', 4);
    await waitForFlashToClear(page);

    expect(await getBallCount(page)).toBe(0);
    expect(await getStrikeCount(page)).toBe(0);
  });

  test('three strikes result in a strikeout and add an out', async ({ page }) => {
    await throwPitches(page, 'CS', 3);
    await waitForFlashToClear(page);

    expect(await getBallCount(page)).toBe(0);
    expect(await getStrikeCount(page)).toBe(0);
    expect(await getOutCount(page)).toBe(1);
  });

  test('at-bat sequence chips appear', async ({ page }) => {
    await page.click('.pitch-btn.pt-B');
    await page.click('.pitch-btn.pt-CS');
    await page.click('.pitch-btn.pt-F');

    const chips = page.locator('#at-bat-seq .seq-chip');
    await expect(chips).toHaveCount(3);
  });

  test('BIP shows safe/out modal', async ({ page }) => {
    await page.click('.pitch-btn.pt-BIP');
    await expect(page.locator('#bip-overlay')).toBeVisible();
  });

  test('BIP safe does not add an out', async ({ page }) => {
    await page.click('.pitch-btn.pt-BIP');
    await handleBIP(page, 'safe');

    expect(await getOutCount(page)).toBe(0);
  });

  test('BIP out adds an out', async ({ page }) => {
    await page.click('.pitch-btn.pt-BIP');
    await handleBIP(page, 'out');

    expect(await getOutCount(page)).toBe(1);
  });

  test('three outs end the half inning automatically', async ({ page }) => {
    const inningBefore = await getInningText(page);
    expect(inningBefore).toContain('TOP');

    // First out: strikeout
    await throwPitches(page, 'SS', 3);
    await waitForFlashToClear(page);

    // Second out: BIP out
    await page.click('.pitch-btn.pt-BIP');
    await handleBIP(page, 'out');

    // Third out: BIP out — should auto-advance
    await page.click('.pitch-btn.pt-BIP');
    await page.waitForSelector('#bip-overlay[style*="flex"]');
    await page.click('.bip-btn.out');
    await waitForFlashToClear(page);

    const inningAfter = await getInningText(page);
    expect(inningAfter).toContain('BOT');
  });

  test('three BIP outs auto-end the half and reset outs', async ({ page }) => {
    // Two BIP outs
    await page.click('.pitch-btn.pt-BIP');
    await handleBIP(page, 'out');
    await page.click('.pitch-btn.pt-BIP');
    await handleBIP(page, 'out');
    expect(await getOutCount(page)).toBe(2);

    // Third BIP out triggers side-retired and auto-advances
    await page.click('.pitch-btn.pt-BIP');
    await page.waitForSelector('#bip-overlay[style*="flex"]');
    await page.click('.bip-btn.out');
    // Wait for END flash and half inning to advance
    await expect(page.locator('#inn-pill')).toContainText('BOT', { timeout: 5000 });
    // Outs should reset for the new half
    await expect(page.locator('.out-dot.filled')).toHaveCount(0, { timeout: 2000 });
  });

  test('pitch types accumulate correctly on pitcher', async ({ page }) => {
    await throwPitches(page, 'B', 2);
    await throwPitches(page, 'CS', 1);
    await throwPitches(page, 'F', 1);

    expect(await getPitchCount(page)).toBe(4);

    // Check via stats link in pitcher section
    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    const statsText = await page.locator('.stats-sheet').textContent();
    expect(statsText).toContain('4');
  });

  test('manual next batter resets count in advanced mode', async ({ page }) => {
    await throwPitches(page, 'B', 2);
    await page.click('.pitch-btn.pt-CS');
    expect(await getBallCount(page)).toBe(2);
    expect(await getStrikeCount(page)).toBe(1);

    await page.click('text=Next batter (manual)');
    expect(await getBallCount(page)).toBe(0);
    expect(await getStrikeCount(page)).toBe(0);
  });
});
