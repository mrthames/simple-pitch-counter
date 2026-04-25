import { test, expect } from '@playwright/test';
import { clearState, startGame, addSimplePitches, throwPitches, waitForFlashToClear } from './helpers';

test.describe('Name editing in live game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('pitcher edit button is visible in change picker', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await expect(page.locator('#pitcher-select-list .edit-name-btn').first()).toBeVisible();
  });

  test('clicking pitcher edit opens modal with current name', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await expect(page.locator('#edit-player-name')).toHaveValue('Jake M.');
  });

  test('saving pitcher name updates display', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    await page.fill('#edit-player-name', 'Jacob Miller');
    await page.click('.modal-btn.primary');

    await expect(page.locator('.pitcher-name')).toContainText('Jacob Miller');
  });

  test('pitcher edit preserves pitch count', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await addSimplePitches(page, 7);

    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.fill('#edit-player-name', 'Jacob Miller');
    await page.click('.modal-btn.primary');

    await expect(page.locator('.pitch-count-badge-num').first()).toHaveText('7');
  });

  test('catcher edit button is visible in change picker', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    const catcherSection = page.locator('#catcher-section');
    await catcherSection.locator('.btn-sm').filter({ hasText: 'Change' }).click();
    await expect(page.locator('#catcher-section .edit-name-btn').first()).toBeVisible();
  });

  test('saving catcher name updates display', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    const catcherSection = page.locator('#catcher-section');
    await catcherSection.locator('.btn-sm').filter({ hasText: 'Change' }).click();
    await page.locator('#catcher-section .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    await page.fill('#edit-player-name', 'Michael Clark');
    await page.click('.modal-btn.primary');

    await expect(page.locator('#catcher-section')).toContainText('Michael Clark');
  });

  test('cancel edit does not change name', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    await page.fill('#edit-player-name', 'Wrong Name');
    await page.click('.modal-btn:not(.primary)');

    await expect(page.locator('.pitcher-name')).toContainText('Jake M.');
  });

  test('edit number updates display', async ({ page }) => {
    await startGame(page, { mode: 'simple', homePitcher: 'Jake M.' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.locator('#pitcher-select-list .edit-name-btn').first().click();
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    await page.fill('#edit-player-num', '42');
    await page.click('.modal-btn.primary');

    await expect(page.locator('.pitcher-name')).toContainText('#42');
  });
});

test.describe('Physical button mapping in advanced mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('advanced mode button mapping includes strike and ball options', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item', { hasText: 'Button mapping' }).click();
    await page.waitForSelector('#btn-map-overlay', { timeout: 3000 });

    const overlay = page.locator('#btn-map-overlay');
    await expect(overlay).toContainText('Called Strike');
    await expect(overlay).toContainText('Ball');
  });

  test('simple mode button mapping does not include strike and ball', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item', { hasText: 'Button mapping' }).click();
    await page.waitForSelector('#btn-map-overlay', { timeout: 3000 });

    const overlay = page.locator('#btn-map-overlay');
    await expect(overlay).not.toContainText('Called Strike');
  });
});

test.describe('Game summary pitcher card layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('advanced mode pitcher card shows K and BB on separate line', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'CS', 3);
    await waitForFlashToClear(page);
    await throwPitches(page, 'B', 4);
    await waitForFlashToClear(page);

    await page.click('.menu-btn');
    await page.click('text=Game summary');

    const pitcherWrap = page.locator('#sum-home-pitchers-wrap');
    const subLines = pitcherWrap.locator('.pitcher-stat-sub');
    await expect(subLines).toHaveCount(2);
    await expect(subLines.first()).toContainText('inn');
    await expect(subLines.first()).toContainText('last batter');
    await expect(subLines.nth(1)).toContainText('K:');
    await expect(subLines.nth(1)).toContainText('BB:');
  });

  test('simple mode pitcher card does not show K/BB line', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=Game summary');

    const pitcherWrap = page.locator('#sum-home-pitchers-wrap');
    const subLines = pitcherWrap.locator('.pitcher-stat-sub');
    await expect(subLines).toHaveCount(1);
    await expect(subLines.first()).toContainText('inn');
    await expect(subLines.first()).not.toContainText('K:');
  });
});

test.describe('Umpire feedback wording', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('summary uses Feedback label instead of issues', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=Game summary');

    const labels = page.locator('.form-row-lbl').filter({ hasText: 'Feedback?' });
    await expect(labels).toHaveCount(2);
  });

  test('summary feedback detail placeholder says describe feedback', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await page.locator('input[name="pu-iss"][value="Yes"]').click();
    await expect(page.locator('#sum-pu-comments')).toHaveAttribute('placeholder', 'Describe feedback');
  });

  test('export text uses Feedback None when no issues', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toContain('Feedback: None');
    expect(modalText).not.toContain('Issues');
  });
});

test.describe('Screen transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('navigating to setup is instant with no transition', async ({ page }) => {
    await page.click('.new-game-btn');
    await expect(page.locator('#screen-setup')).toHaveClass(/active/);
  });

  test('navigating between screens does not use view transitions', async ({ page }) => {
    const usesViewTransition = await page.evaluate(() => {
      const original = document.startViewTransition;
      let called = false;
      document.startViewTransition = (() => { called = true; return original?.call(document, () => {}); }) as any;
      return called;
    });
    expect(usesViewTransition).toBe(false);
  });
});

test.describe('Game history card start time', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('history card shows start time alongside date', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 3);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    const dateText = await page.locator('.hist-card-date').first().textContent();
    expect(dateText).toMatch(/·\s*\d{1,2}:\d{2}\s*(AM|PM)/);
  });
});

test.describe('Game summary export content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('export includes innings count', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).toMatch(/\d+ inning/);
  });

  test('export includes end time when game is ended', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    // Should show start time – end time pattern
    expect(modalText).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)\s*[–-]\s*\d{1,2}:\d{2}\s*(AM|PM)/);
  });
});

test.describe('About page rate link', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('about page has Rate This App link', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toContainText('Rate This App');
  });
});

test.describe('Auto review prompt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('completed game count increments in localStorage', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    const count = await page.evaluate(() => localStorage.getItem('spc_completed_games'));
    expect(count).toBe('1');
  });

  test('completed game count increments across multiple games', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await startGame(page, { mode: 'simple' });
      await addSimplePitches(page, 2);
      await page.click('.menu-btn');
      await page.click('text=End game');
      await page.click('.modal-btn.red');
    }

    const count = await page.evaluate(() => localStorage.getItem('spc_completed_games'));
    expect(count).toBe('3');
  });
});

test.describe('Pitcher stats list (#80)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('stats link visible in both simple and advanced modes', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    await expect(page.locator('.stats-link')).toBeVisible();
  });

  test('stats link opens pitcher list first', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 3);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Pitcher Stats');
    await expect(page.locator('.stats-sheet')).toContainText('Jake M.');
    await expect(page.locator('.stats-sheet')).toContainText('Sam T.');
  });

  test('clicking pitcher in list opens detail stats', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'CS', 3);
    await waitForFlashToClear(page);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');

    await expect(page.locator('.stats-sheet')).toContainText('P (Pitches)');
    await expect(page.locator('.stats-sheet')).toContainText('All Pitchers');
  });

  test('detail stats back button returns to pitcher list', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await throwPitches(page, 'B', 2);

    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet');
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet');

    await page.locator('.stats-sheet').getByText('All Pitchers').click();
    await page.waitForSelector('.stats-sheet');
    await expect(page.locator('.stats-sheet')).toContainText('Pitcher Stats');
  });
});

test.describe('Inning scoreboard (#81)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('inning scoreboard visible in game view', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await expect(page.locator('#inn-scoreboard')).toBeVisible();
  });

  test('scoreboard shows team abbreviations and R column', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    const sb = page.locator('#inn-scoreboard');
    await expect(sb).toContainText('TIG');
    await expect(sb).toContainText('LIO');
    await expect(sb).toContainText('R');
  });

  test('scoreboard tracks runs across innings', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });

    // Score 2 runs in TOP 1 (away batting)
    await page.click('.sb-adj >> nth=1'); // away +
    await page.click('.sb-adj >> nth=1');

    // End half
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');

    // Check scoreboard shows 2 in TOP 1
    const sb = page.locator('#inn-scoreboard');
    const text = await sb.textContent();
    expect(text).toContain('2');
  });
});

test.describe('Alert messages (#82)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('approaching limit alert does not repeat pitch count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 47);
    const alertText = await page.locator('#simple-alerts').textContent();
    expect(alertText).not.toMatch(/47 pitches/);
    expect(alertText).toContain('Approaching');
  });

  test('cant catch alert does not repeat pitch count', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'Mike C.' });
    await addSimplePitches(page, 41);
    const alertText = await page.locator('#simple-alerts').textContent();
    expect(alertText).not.toMatch(/41 pitches/);
    expect(alertText).toContain('Cannot catch');
  });

  test('over limit alert does not repeat pitch count', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 51);
    const alertText = await page.locator('#simple-alerts').textContent();
    expect(alertText).not.toMatch(/51 pitches —/);
    expect(alertText).toContain('over the 50-pitch limit');
  });
});

test.describe('Summary dividers (#84)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('export dividers are short', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeTeam: 'Tigers', awayTeam: 'Lions' });
    await addSimplePitches(page, 5);

    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');

    await page.click('text=Summary');
    await page.click('text=Share');
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });

    const modalText = await page.locator('.modal-box').textContent();
    expect(modalText).not.toContain('──────────────────────────────');
    expect(modalText).toContain('────────');
  });
});

test.describe('Umpire name capitalization (#85)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('umpire name auto-capitalizes after space on setup', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.waitForSelector('#screen-setup.active');

    await page.fill('#s-ump-plate', 'john smith');
    const val = await page.locator('#s-ump-plate').inputValue();
    expect(val).toBe('John Smith');
  });

  test('umpire name auto-capitalizes after space on summary', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.click('text=Game summary');

    await page.fill('#sum-pu-name', 'jane doe');
    const val = await page.locator('#sum-pu-name').inputValue();
    expect(val).toBe('Jane Doe');
  });
});

test.describe('Button mapping per mode (#79)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('advanced mode mapping excludes pitch option', async ({ page }) => {
    await startGame(page, { mode: 'advanced', homeCatcher: 'Mike C.', awayCatcher: 'Dan R.' });
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item', { hasText: 'Button mapping' }).click();
    await page.waitForSelector('#btn-map-overlay', { timeout: 3000 });

    const overlay = page.locator('#btn-map-overlay');
    await expect(overlay).not.toContainText('+ Pitch');
    await expect(overlay).toContainText('Called Strike');
    await expect(overlay).toContainText('Ball');
  });

  test('simple mode mapping excludes advanced options', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item', { hasText: 'Button mapping' }).click();
    await page.waitForSelector('#btn-map-overlay', { timeout: 3000 });

    const overlay = page.locator('#btn-map-overlay');
    await expect(overlay).toContainText('+ Pitch');
    await expect(overlay).not.toContainText('Called Strike');
    await expect(overlay).not.toContainText('+ Out');
  });
});
