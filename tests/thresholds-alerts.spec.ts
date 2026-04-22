import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches, getPitchCount } from './helpers';

test.describe('Thresholds and alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('no rest required under 20 pitches', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 15);
    await expect(page.locator('#simple-rest-lbl')).not.toBeVisible();
  });

  test('rest label appears at threshold', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 21);
    await expect(page.locator('#simple-rest-lbl')).toBeVisible();
    await expect(page.locator('#simple-rest-lbl')).toContainText('rest required');
  });

  test('approaching limit alert shows near max', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 47);
    await expect(page.locator('#simple-alerts')).toContainText('approaching');
  });

  test('over limit alert shows at max', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 50);
    await expect(page.locator('#simple-alerts')).toContainText('over');
  });

  test('pitch count color changes at thresholds', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 28);
    const colorMid = await page.locator('#simple-count-num').evaluate(el => el.style.color);
    expect(colorMid).not.toBe('');

    await addSimplePitches(page, 10);
    const colorHigh = await page.locator('#simple-count-num').evaluate(el => el.style.color);
    expect(colorHigh).not.toBe(colorMid);
  });

  test('catcher inning limit warning at 3 innings', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });

    // Home catcher gets an inning each time a TOP half ends.
    // Must end on a TOP half to view home catcher section.
    // 6 end-halfs: TOP1→BOT1→TOP2→BOT2→TOP3→BOT3→TOP4
    // Home catcher has 3 innings (TOP1,2,3). Warning shows at C_INN_LIM-1 = 3.
    for (let i = 0; i < 6; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }

    const catcherSection = page.locator('#catcher-section');
    await expect(catcherSection).toContainText('last allowed inning');
  });

  test('catcher inning limit maxed at 4 innings', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });

    // 8 end-halfs: ...→TOP4→BOT4→TOP5
    // Home catcher has 4 innings (TOP1,2,3,4). Maxed at C_INN_LIM = 4.
    for (let i = 0; i < 8; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }

    const catcherSection = page.locator('#catcher-section');
    await expect(catcherSection).toContainText(/limit reached|Change catcher/);
  });

  test('pitcher cant catch alert at 41+ pitches', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    await addSimplePitches(page, 41);

    await expect(page.locator('#simple-alerts')).toContainText('cannot catch remainder');
  });

  test('pitcher cant catch alert does not appear in catcher section', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    await addSimplePitches(page, 41);

    await expect(page.locator('#catcher-section')).not.toContainText('ineligible');
    await expect(page.locator('#catcher-section')).not.toContainText('pitcher');
  });

  test('at-bat warning shows at 6+ pitches in simple mode', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 6);
    await expect(page.locator('#simple-alerts')).toContainText('At-bat pitch count');
  });

  test('mercy rule alert shows when run limit reached in advanced mode', async ({ page }) => {
    // Default config has mercyRuns=5
    await startGame(page, { mode: 'advanced' });
    // During TOP 1, away team bats — add 5 runs for away
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1'); // away +
    }
    await expect(page.locator('#adv-alerts')).toContainText('mercy limit reached');
  });

  test('mercy rule warning shows at one run before limit in simple mode', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // During TOP 1, away team bats — add 4 runs for away
    for (let i = 0; i < 4; i++) {
      await page.click('.sb-adj >> nth=1'); // away +
    }
    await expect(page.locator('#simple-alerts')).toContainText('1 away from');
  });

  test('mercy run count resets after half inning ends', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    // Add 5 runs for away (batting in TOP)
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1');
    }
    await expect(page.locator('#adv-alerts')).toContainText('mercy');

    // Mercy modal should appear — end half through it
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.click('.modal-btn.amber');

    // Mercy alert should be gone in new half
    await expect(page.locator('#adv-alerts')).not.toContainText('mercy');
  });

  test('mercy modal appears when run limit reached', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Add 5 runs for away team
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1');
    }

    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('Mercy limit reached');
    expect(modalText).toContain('5 runs scored');
  });

  test('mercy modal Continue keeps playing', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1');
    }

    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.locator('.modal-btn', { hasText: 'Continue' }).click();

    // Should stay in same half inning
    const inning = await page.locator('#inn-pill').textContent();
    expect(inning).toContain('TOP');
    expect(inning).toContain('1');
  });

  test('mercy modal End half advances inning', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1');
    }

    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.click('.modal-btn.amber');

    await expect(page.locator('#inn-pill')).toContainText('BOT', { timeout: 3000 });
  });

  test('mercy rule tracks runs from fielding team too', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // In TOP 1, home team is fielding — add 5 runs for home (nth=3 is home +)
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=3');
    }

    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('Mercy limit reached');
  });

  test('mercy alert shows in simple mode alerts area', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    for (let i = 0; i < 5; i++) {
      await page.click('.sb-adj >> nth=1');
    }

    await expect(page.locator('#simple-alerts')).toContainText('mercy limit reached');
  });
});
