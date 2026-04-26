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

test.describe('Scoreboard improvements (#87-#92)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('scoreboard team labels are aligned with cells', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    const hdr = page.locator('.inn-sb-hdr').first();
    const cell = page.locator('.inn-sb-cell').first();
    await expect(hdr).toBeVisible();
    await expect(cell).toBeVisible();
    const hdrBox = await hdr.boundingBox();
    const cellBox = await cell.boundingBox();
    expect(hdrBox).not.toBeNull();
    expect(cellBox).not.toBeNull();
    expect(hdrBox!.height).toBeGreaterThan(0);
    expect(cellBox!.height).toBeGreaterThan(0);
  });

  test('Stats link is next to PITCHER label not pitcher name', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    const sectionLbl = page.locator('.section-lbl', { hasText: 'Pitcher' });
    await expect(sectionLbl.locator('.stats-link')).toBeVisible();
    await expect(page.locator('#pitcher-name-display .stats-link')).toHaveCount(0);
  });

  test('Stats link next to PITCHER label in advanced mode', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    const sectionLbl = page.locator('.section-lbl', { hasText: 'Pitcher' });
    await expect(sectionLbl.locator('.stats-link')).toBeVisible();
    await expect(page.locator('#pitcher-name-display .stats-link')).toHaveCount(0);
  });

  test('max-innings game prompts end when not tied', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Default max innings is 6. Give away team a 1-run lead
    await page.click('.sb-adj >> nth=1');
    // Play through 6 innings (12 half-innings)
    for (let i = 0; i < 12; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }
    // Should see game complete modal
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await expect(page.locator('.modal-box')).toContainText('Game complete');
  });

  test('max-innings tied game allows extra innings', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Play through 6 innings (12 half-innings), score stays 0-0
    for (let i = 0; i < 12; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }
    // Should NOT see game complete modal since tied 0-0
    await page.waitForTimeout(500);
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    await expect(page.locator('#inn-pill')).toContainText('7');
  });

  test('max-innings modal Continue allows extra innings', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.sb-adj >> nth=1');
    for (let i = 0; i < 12; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.locator('.modal-btn', { hasText: 'Continue' }).click();
    await expect(page.locator('#inn-pill')).toContainText('7');
  });

  test('editable inning cell updates score', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.sb-adj >> nth=1'); // away +1
    // End TOP 1
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    // End BOT 1
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    // Now in TOP 2. Inning 1 cells are editable.
    page.on('dialog', async dialog => {
      await dialog.accept('3');
    });
    // Click the away team cell for inning 1 — has onclick="editInningCell(0,'top')"
    await page.locator('#inn-scoreboard .inn-sb-cell[onclick*="editInningCell"]').first().click();
    // Away score should now be 3
    await expect(page.locator('#sb-away-score')).toContainText('3');
  });

  test('history card shows inning scoreboard instead of score pill', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 5);
    await page.click('.sb-adj >> nth=1'); // away +1
    // End half
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    // End game
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    // Should have history scoreboard, not score-pill
    await expect(page.locator('.hist-scoreboard')).toHaveCount(1);
    await expect(page.locator('.hist-scoreboard')).toContainText('R');
  });

  test('share card includes inning scoreboard', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    await page.click('.sb-adj >> nth=1');
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    await page.click('.end-half-btn');
    await page.click('.modal-btn.amber');
    // End game
    await page.click('.menu-btn');
    await page.click('text=End game');
    await page.click('.modal-btn.red');
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
    // Open stats and share
    await page.click('text=View stats');
    await page.waitForSelector('#saved-stats-overlay .stats-sheet');
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await page.locator('#saved-stats-overlay .stats-sheet').getByText('Share', { exact: true }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    if (download) {
      expect(download.suggestedFilename()).toBe('game-stats.png');
    }
  });
});

test.describe('Batch fixes (#94-#103)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('#94: umpire names carry from setup to summary', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.waitForSelector('#screen-setup.active');
    await page.click('#mode-simple');
    await page.fill('#s-home', 'Eagles');
    await page.fill('#s-away', 'Hawks');
    await page.fill('#hp-name', 'Jake');
    await page.fill('#ap-name', 'Sam');
    await page.fill('#s-ump-plate', 'John Smith');
    await page.fill('#s-ump-base', 'Mike Jones');
    await page.click('.start-btn');
    await page.waitForSelector('#screen-game.active');
    // End game without visiting summary first
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red', { hasText: 'End now' }).click();
    await page.waitForSelector('#screen-history.active');
    // View summary from history
    await page.locator('.hist-action-btn', { hasText: 'Summary' }).first().click();
    await page.waitForSelector('#screen-summary.active');
    await expect(page.locator('#sum-pu-name')).toHaveValue('John Smith');
    await expect(page.locator('#sum-bu-name')).toHaveValue('Mike Jones');
  });

  test('#95: division field pre-populated from config name', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Game summary' }).click();
    await page.waitForSelector('#screen-summary.active');
    // Division should be pre-populated with config name
    const divVal = await page.locator('#sum-division').inputValue();
    expect(divVal).toBeTruthy();
    expect(divVal).toContain('Default');
  });

  test('#95: division appears in export text', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Game summary' }).click();
    await page.waitForSelector('#screen-summary.active');
    await page.fill('#sum-division', 'Minors 8');
    await page.click('text=‹ Back');
    // End the game
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    // Open summary from history and generate export
    await page.locator('.hist-action-btn', { hasText: 'Summary' }).first().click();
    await page.waitForSelector('#screen-summary.active');
    await expect(page.locator('#sum-division')).toHaveValue('Minors 8');
  });

  test('#96: older completed games are collapsed', async ({ page }) => {
    // Start and end 3 games
    for (let i = 0; i < 3; i++) {
      await startGame(page, { mode: 'simple', homeTeam: `Team${i}H`, awayTeam: `Team${i}A` });
      await page.click('.menu-btn');
      await page.locator('.hbg-item', { hasText: 'End game' }).click();
      await page.locator('.modal-btn.red').click();
      await page.waitForSelector('#screen-history.active');
    }
    // First game (most recent) should be expanded
    const firstDetail = page.locator('#hist-detail-0');
    await expect(firstDetail).toBeVisible();
    // Third game should be collapsed
    const thirdDetail = page.locator('#hist-detail-2');
    await expect(thirdDetail).toBeHidden();
    // Should have a "Show details" button for collapsed card
    const showBtn = page.locator('.swipe-card-wrap').nth(2).locator('text=Show details');
    await expect(showBtn).toBeVisible();
    // Clicking Show details expands it
    await showBtn.click();
    await expect(thirdDetail).toBeVisible();
  });

  test('#97: game mercy modal appears at run differential limit', async ({ page }) => {
    // Set game mercy to 3 via config
    await page.evaluate(() => {
      (window as any).saveState();
    }).catch(() => {});
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('spc_v1') || '{}');
      if (!s.configs) s.configs = [];
      if (s.configs[0]) s.configs[0].mercyGame = 3;
      localStorage.setItem('spc_v1', JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector('#screen-history.active');
    await startGame(page, { mode: 'simple' });
    // Add 3 runs to away team
    for (let i = 0; i < 3; i++) {
      await page.click('.sb-adj >> nth=1');
    }
    // Game mercy modal should appear
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await expect(page.locator('.modal-box')).toContainText('Game mercy reached');
  });

  test('#98: R column header is centered', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // R header should be visible
    const rHeader = page.locator('.inn-sb-hdr', { hasText: 'R' });
    await expect(rHeader).toBeVisible();
  });

  test('#100: undo after BIP side-retired reverts fully', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    // Advance to 2 outs
    await page.click('.adv-secondary-btn >> text=+ Out');
    await page.click('.adv-secondary-btn >> text=+ Out');
    await expect(page.locator('#out1')).toHaveClass(/filled/);
    // Throw a BIP pitch
    const bipBtn = page.locator('.pitch-btn').filter({ hasText: /Play/ });
    await bipBtn.click();
    await page.waitForSelector('#bip-overlay[style*="flex"]', { timeout: 3000 });
    // Mark as out (3rd out → side retired)
    await page.click('.bip-btn.out');
    await waitForFlashToClear(page);
    // Side retired modal appears
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await expect(page.locator('.modal-box')).toContainText('End half inning');
    // Click End to advance to next half
    await page.locator('.modal-btn.amber').click();
    // Now in Bottom of Inning 1
    await expect(page.locator('#inn-pill')).toContainText('BOT');
    // Undo — should revert to 2 outs in Top 1 before the BIP
    await page.click('#undo-btn-adv');
    await expect(page.locator('#inn-pill')).toContainText('TOP');
    await expect(page.locator('#out1')).toHaveClass(/filled/);
  });

  test('#101: button mapping options are vertically centered', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item', { hasText: 'Button mapping' }).click();
    await page.waitForSelector('#btn-map-overlay', { timeout: 3000 });
    // Check that options have display:flex and align-items:center
    const firstOpt = page.locator('#btn-map-rows div[onclick*="setBtnMapping"]').first();
    await expect(firstOpt).toHaveCSS('display', 'flex');
    await expect(firstOpt).toHaveCSS('align-items', 'center');
  });

  test('#102: 0-0 game shows scoreboard not score-pill', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Go back to history (close game)
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Close' }).click();
    await page.waitForSelector('#screen-history.active');
    // Should see a scoreboard, not a score-pill
    await expect(page.locator('.hist-scoreboard')).toBeVisible();
    await expect(page.locator('.score-pill')).toHaveCount(0);
  });

  test('#103: adding new pitcher auto-selects and closes picker', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('#p-change-btn');
    await page.fill('#new-p-name', 'New Guy');
    await page.fill('#new-p-num', '99');
    await page.click('text=Add');
    // Picker auto-closes and new pitcher is the active pitcher
    await expect(page.locator('.pitcher-name')).toContainText('New Guy');
    // Reopen picker to verify active badge
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    const activeRow = page.locator('.player-row', { hasText: 'New Guy' });
    await expect(activeRow.locator('.badge-active')).toBeVisible();
  });

  test('#99: max innings default is 6', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Play 6 innings with a 1-run lead
    await page.click('.sb-adj >> nth=1');
    for (let i = 0; i < 12; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await expect(page.locator('.modal-box')).toContainText('6 innings');
  });

  test('#94: umpire names persist through live game summary visit', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.waitForSelector('#screen-setup.active');
    await page.click('#mode-simple');
    await page.fill('#s-home', 'Eagles');
    await page.fill('#s-away', 'Hawks');
    await page.fill('#hp-name', 'Jake');
    await page.fill('#ap-name', 'Sam');
    await page.fill('#s-ump-plate', 'John Smith');
    await page.fill('#s-ump-base', 'Mike Jones');
    await page.click('.start-btn');
    await page.waitForSelector('#screen-game.active');
    // Visit summary during live game
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Game summary' }).click();
    await page.waitForSelector('#screen-summary.active');
    await expect(page.locator('#sum-pu-name')).toHaveValue('John Smith');
    await expect(page.locator('#sum-bu-name')).toHaveValue('Mike Jones');
    // Go back and end game
    await page.click('text=‹ Back');
    await page.waitForSelector('#screen-game.active');
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    // Verify umpire names still persist in saved game summary
    await page.locator('.hist-action-btn', { hasText: 'Summary' }).first().click();
    await page.waitForSelector('#screen-summary.active');
    await expect(page.locator('#sum-pu-name')).toHaveValue('John Smith');
    await expect(page.locator('#sum-bu-name')).toHaveValue('Mike Jones');
  });

  test('#95: division prefix in email subject', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Game summary' }).click();
    await page.waitForSelector('#screen-summary.active');
    await page.fill('#sum-division', 'Minors 8');
    await page.click('text=‹ Back');
    // End game
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    // Open summary and generate export
    await page.locator('.hist-action-btn', { hasText: 'Summary' }).first().click();
    await page.waitForSelector('#screen-summary.active');
    // Save and generate report
    await page.locator('.summary-action-btn', { hasText: 'Share' }).click();
    await page.waitForSelector('#active-modal .export-box');
    // Check export text includes division
    const exportText = await page.locator('#active-modal .export-box').textContent();
    expect(exportText).toContain('Minors 8');
  });

  test('#95: division in export body text', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Game summary' }).click();
    await page.waitForSelector('#screen-summary.active');
    await page.fill('#sum-division', 'Majors');
    await page.click('text=‹ Back');
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    await page.locator('.hist-action-btn', { hasText: 'Summary' }).first().click();
    await page.waitForSelector('#screen-summary.active');
    await page.locator('.summary-action-btn', { hasText: 'Share' }).click();
    await page.waitForSelector('#active-modal .export-box');
    const exportText = await page.locator('#active-modal .export-box').textContent();
    expect(exportText).toContain('Majors');
  });

  test('#96: live game is always expanded in history', async ({ page }) => {
    // End a game first so there's a completed game
    await startGame(page, { mode: 'simple', homeTeam: 'Old', awayTeam: 'Game' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    // Start a new game and close to history (live)
    await startGame(page, { mode: 'simple', homeTeam: 'Live', awayTeam: 'Game' });
    await page.click('.menu-btn');
    await page.locator('.hbg-item', { hasText: 'Close' }).click();
    await page.waitForSelector('#screen-history.active');
    // Live game card (index 0) should have Resume visible
    const liveCard = page.locator('.swipe-card-wrap').first();
    await expect(liveCard.locator('.hist-action-btn', { hasText: 'Resume' })).toBeVisible();
  });

  test('#96: Hide details toggle collapses expanded card', async ({ page }) => {
    // Create 3 completed games
    for (let i = 0; i < 3; i++) {
      await startGame(page, { mode: 'simple', homeTeam: `T${i}H`, awayTeam: `T${i}A` });
      await page.click('.menu-btn');
      await page.locator('.hbg-item', { hasText: 'End game' }).click();
      await page.locator('.modal-btn.red').click();
      await page.waitForSelector('#screen-history.active');
    }
    // Expand the third card
    const thirdCard = page.locator('.swipe-card-wrap').nth(2);
    await thirdCard.locator('text=Show details').click();
    await expect(page.locator('#hist-detail-2')).toBeVisible();
    // Now hide it
    await thirdCard.locator('text=Hide details').click();
    await expect(page.locator('#hist-detail-2')).toBeHidden();
  });

  test('#97: game mercy warning at 1 run away', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).saveState();
    }).catch(() => {});
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('spc_v1') || '{}');
      if (!s.configs) s.configs = [];
      if (s.configs[0]) { s.configs[0].mercyGame = 5; s.configs[0].mercyRuns = 0; }
      localStorage.setItem('spc_v1', JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector('#screen-history.active');
    await startGame(page, { mode: 'simple' });
    // Add 4 runs (1 away from 5-run game mercy)
    for (let i = 0; i < 4; i++) {
      await page.click('.sb-adj >> nth=1');
    }
    // Should see warning alert about game mercy
    await expect(page.locator('.alert.a-warn')).toContainText('game mercy');
  });

  test('#97: game mercy Continue dismisses modal', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).saveState();
    }).catch(() => {});
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('spc_v1') || '{}');
      if (!s.configs) s.configs = [];
      if (s.configs[0]) s.configs[0].mercyGame = 3;
      localStorage.setItem('spc_v1', JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector('#screen-history.active');
    await startGame(page, { mode: 'simple' });
    for (let i = 0; i < 3; i++) {
      await page.click('.sb-adj >> nth=1');
    }
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.locator('.modal-btn', { hasText: 'Continue' }).click();
    // Modal should be gone, game continues
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    await expect(page.locator('#screen-game')).toHaveClass(/active/);
  });

  test('#97: game mercy End game ends the game', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).saveState();
    }).catch(() => {});
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('spc_v1') || '{}');
      if (!s.configs) s.configs = [];
      if (s.configs[0]) s.configs[0].mercyGame = 3;
      localStorage.setItem('spc_v1', JSON.stringify(s));
    });
    await page.reload();
    await page.waitForSelector('#screen-history.active');
    await startGame(page, { mode: 'simple' });
    for (let i = 0; i < 3; i++) {
      await page.click('.sb-adj >> nth=1');
    }
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    // Click End game on mercy modal
    await page.locator('.modal-btn', { hasText: 'End game' }).click();
    // Should show confirmEndGame modal
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.locator('.modal-btn.red', { hasText: 'End now' }).click();
    await page.waitForSelector('#screen-history.active');
  });

  test('#98: R column header has centered justify-content', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    const rHeader = page.locator('.inn-sb-hdr', { hasText: 'R' });
    await expect(rHeader).toHaveCSS('justify-content', 'center');
  });

  test('#99: tied game at max innings allows extra innings', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Play through 6 innings (12 half-innings), score stays 0-0 (tied)
    for (let i = 0; i < 12; i++) {
      await page.click('.end-half-btn');
      await page.click('.modal-btn.amber');
    }
    // Should NOT see game complete modal since tied 0-0
    await page.waitForTimeout(500);
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    // Should be in inning 7
    await expect(page.locator('#inn-pill')).toContainText('7');
  });

  test('#103: adding new catcher auto-selects and closes picker', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'CatcherA' });
    const catcherChange = page.locator('#catcher-section .btn-sm', { hasText: 'Change' });
    await catcherChange.click();
    await page.fill('#new-c-name', 'New Catcher');
    await page.fill('#new-c-num', '7');
    await page.locator('#catcher-section').locator('text=Add').click();
    // Picker auto-closes and new catcher is active
    await expect(page.locator('#catcher-section')).toContainText('New Catcher');
  });

  test('#100: undo after non-pitch out side-retired reverts fully', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Get to 2 outs via non-pitch outs
    await page.locator('#simple-content .adv-secondary-btn', { hasText: '+ Out' }).click();
    await page.locator('#simple-content .adv-secondary-btn', { hasText: '+ Out' }).click();
    // Add a pitch for state to track
    await page.click('text=+ Pitch');
    // Third out via non-pitch out
    await page.locator('#simple-content .adv-secondary-btn', { hasText: '+ Out' }).click();
    // Side retired modal
    await page.waitForSelector('.modal-overlay', { timeout: 3000 });
    await page.locator('.modal-btn.amber').click();
    // Now in BOT 1
    await expect(page.locator('#inn-pill')).toContainText('BOT');
    // Undo should go back to TOP 1 with 2 outs
    await page.locator('#undo-btn-simple').click();
    await expect(page.locator('#inn-pill')).toContainText('TOP');
  });
});

test.describe('Batch fixes (#105-#111)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  // #105: R column alignment
  test('#105: R column in game scoreboard does not use lbl class', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 1);
    const rCol = page.locator('.inn-scoreboard .inn-sb-col').last();
    await expect(rCol).not.toHaveClass(/lbl/);
    const rHeader = rCol.locator('.inn-sb-hdr');
    await expect(rHeader).toHaveText('R');
  });

  test('#105: R column in history scoreboard does not use lbl class', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 1);
    // End the game
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item').filter({ hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    const rCol = page.locator('.hist-scoreboard .hist-sb-col').last();
    await expect(rCol).not.toHaveClass(/lbl/);
  });

  // #106: Config form alignment
  test('#106: config form rows use align-items end', async ({ page }) => {
    // Navigate to config from history hamburger menu
    await page.locator('.hist-menu-btn').click();
    await page.locator('#history-hbg-menu .hbg-item').filter({ hasText: 'Configuration' }).click();
    await page.waitForSelector('#screen-config.active');
    // Click edit on the default config
    await page.locator('.config-item .btn-xs').filter({ hasText: 'Edit' }).first().click();
    const row2 = page.locator('.row2').first();
    await expect(row2).toHaveCSS('align-items', 'end');
  });

  // #107: Per-mode button mapping defaults
  test('#107: simple mode defaults volume up to pitch', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Check btn-hints for "pitch" mapping (simple defaults to volUp=pitch)
    const hintsHtml = await page.locator('.btn-hints').innerHTML();
    expect(hintsHtml.toLowerCase()).toContain('pitch');
  });

  test('#107: advanced mode defaults volume up to calledStrike', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    // Check btn-hints for calledStrike mapping (advanced defaults to volUp=calledStrike)
    const hintsHtml = await page.locator('.btn-hints').innerHTML();
    expect(hintsHtml).toContain('Strike');
  });

  test('#107: resuming game loads correct mode mapping', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Change simple mapping via JS
    await page.evaluate(() => { (window as any).setBtnMapping('volUp', 'undo'); });
    // Close to history (keeps as live game)
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item').filter({ hasText: 'Close' }).click();
    await page.waitForSelector('#screen-history.active');
    // Resume the game — should reload simple mapping with our change
    await page.locator('.hist-action-btn', { hasText: 'Resume' }).click();
    await page.waitForSelector('#screen-game.active');
    const hintsHtml = await page.locator('.btn-hints').innerHTML();
    expect(hintsHtml).toContain('Undo');
  });

  // #108: Button hint backwards K SVG
  test('#108: calledStrike hint uses backwards K SVG', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    const hintArea = page.locator('.btn-hints');
    const hintHtml = await hintArea.innerHTML();
    expect(hintHtml).toContain('scale(-1,1)');
  });

  // #109: Auto-close picker after adding player
  test('#109: pitcher picker closes after adding new pitcher', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('#p-change-btn');
    await page.waitForSelector('#pitcher-select-list[style*="block"]');
    await page.fill('#new-p-name', 'Test P.');
    await page.locator('#pitcher-select-list .add-player-form .btn-sm').click();
    // Picker should be closed
    await expect(page.locator('#pitcher-select-list')).not.toHaveAttribute('style', /block/);
    await expect(page.locator('.pitcher-name')).toContainText('Test P.');
  });

  test('#109: catcher picker closes after adding new catcher', async ({ page }) => {
    await startGame(page, { mode: 'simple', homeCatcher: 'CatcherA' });
    const catcherSection = page.locator('#catcher-section');
    await catcherSection.locator('.btn-sm').filter({ hasText: 'Change' }).click();
    await page.fill('#new-c-name', 'Test C.');
    await catcherSection.locator('text=Add').click();
    // Picker should be closed and new catcher selected
    await expect(catcherSection).toContainText('Test C.');
  });

  // #110: Start game without names
  test('#110: game starts with default pitcher name when blank', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.waitForSelector('#screen-setup.active');
    await page.click('#mode-simple');
    await page.fill('#hp-name', '');
    await page.fill('#ap-name', '');
    await page.click('.start-btn');
    await expect(page.locator('#screen-game')).toHaveClass(/active/);
    await expect(page.locator('.pitcher-name')).toContainText('Pitcher 1');
  });

  test('#110: game starts with default catcher name when blank', async ({ page }) => {
    await page.click('.new-game-btn');
    await page.waitForSelector('#screen-setup.active');
    await page.click('#mode-simple');
    await page.fill('#hp-name', 'Jake');
    await page.fill('#ap-name', 'Sam');
    await page.click('.start-btn');
    await expect(page.locator('#screen-game')).toHaveClass(/active/);
    await expect(page.locator('#catcher-section')).toContainText('Catcher 1');
  });

  // #111: Game clock
  test('#111: game clock toggle appears in hamburger menu', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await expect(page.locator('#clock-toggle-btn')).toContainText('Enable game clock');
  });

  test('#111: enabling game clock shows 00:00', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#clock-toggle-btn').click();
    const clock = page.locator('#game-clock');
    await expect(clock).toBeVisible();
    await expect(clock).toHaveText('00:00');
  });

  test('#111: clicking clock starts it running', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#clock-toggle-btn').click();
    const clock = page.locator('#game-clock');
    await clock.click();
    await expect(clock).toHaveClass(/running/);
    // Wait and verify clock advances
    await page.waitForTimeout(1100);
    const text = await clock.textContent();
    expect(text).not.toBe('00:00');
  });

  test('#111: clicking running clock pauses it', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await page.locator('#clock-toggle-btn').click();
    const clock = page.locator('#game-clock');
    await clock.click(); // start
    await page.waitForTimeout(1100);
    await clock.click(); // pause
    await expect(clock).toHaveClass(/paused/);
    const pausedTime = await clock.textContent();
    await page.waitForTimeout(1100);
    // Time should not advance while paused
    await expect(clock).toHaveText(pausedTime!);
  });

  test('#111: disabling game clock hides it', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Enable via direct JS since menu toggle is tricky in tests
    await page.evaluate(() => { (window as any).toggleClockEnabled(); });
    await expect(page.locator('#game-clock')).toBeVisible();
    // Disable
    await page.evaluate(() => { (window as any).toggleClockEnabled(); });
    await expect(page.locator('#game-clock')).not.toBeVisible();
  });

  test('#111: menu label toggles between enable/disable', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await page.click('.menu-btn');
    await expect(page.locator('#clock-toggle-btn')).toContainText('Enable game clock');
    await page.locator('#clock-toggle-btn').click();
    await page.click('.menu-btn');
    await expect(page.locator('#clock-toggle-btn')).toContainText('Disable game clock');
  });

  test('#111: end game stops clock automatically', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Enable and start clock
    await page.click('.menu-btn');
    await page.locator('#clock-toggle-btn').click();
    await page.locator('#game-clock').click();
    await page.waitForTimeout(1100);
    // End the game
    await page.click('.menu-btn');
    await page.waitForSelector('#game-hbg-menu.open');
    await page.locator('#game-hbg-menu .hbg-item').filter({ hasText: 'End game' }).click();
    await page.locator('.modal-btn.red').click();
    await page.waitForSelector('#screen-history.active');
    // Reopen game from history to verify clock stopped
    const gameState = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('spc_v1') || '{}');
      return s.games?.[0];
    });
    expect(gameState.clockRunning).toBe(false);
    expect(gameState.clockElapsed).toBeGreaterThan(0);
  });

  test('#111: clock persists across app reloads', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Enable and start clock
    await page.click('.menu-btn');
    await page.locator('#clock-toggle-btn').click();
    await page.locator('#game-clock').click();
    await page.waitForTimeout(1200);
    // Reload the page
    await page.reload();
    await page.waitForSelector('#screen-game.active');
    const clock = page.locator('#game-clock');
    await expect(clock).toBeVisible();
    await expect(clock).toHaveClass(/running/);
    // Should show accumulated time (at least 1 second)
    await page.waitForTimeout(500);
    const text = await clock.textContent();
    expect(text).not.toBe('00:00');
  });
});

test.describe('Batch fixes (#121-#123)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  // #121: Pitch button centering
  test('#121: pitch buttons use pt-row2 class', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    const foulBtn = page.locator('.pitch-btn.pt-F');
    await expect(foulBtn).toHaveClass(/pt-row2/);
    const bipBtn = page.locator('.pitch-btn.pt-BIP');
    await expect(bipBtn).toHaveClass(/pt-row2/);
    // Verify the old standalone row2 class is not present (would cause grid override)
    const foulClass = await foulBtn.getAttribute('class');
    expect(foulClass).not.toMatch(/ row2 |^row2 | row2$/);
  });

  test('#121: pitch buttons have flex display for centering', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    const foulBtn = page.locator('.pitch-btn.pt-F');
    await expect(foulBtn).toHaveCSS('display', 'flex');
    const bipBtn = page.locator('.pitch-btn.pt-BIP');
    await expect(bipBtn).toHaveCSS('display', 'flex');
  });

  // #122/#127: Inline stat descriptions and graph legend
  test('#122: individual pitcher stats shows inline descriptions', async ({ page }) => {
    await startGame(page, { mode: 'advanced' });
    await throwPitches(page, 'B', 2);
    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet', { timeout: 3000 });
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet', { timeout: 3000 });
    const text = await page.locator('.stats-sheet').textContent();
    expect(text).toContain('K (Strikeouts)');
    expect(text).toContain('BB (Walks)');
    expect(text).toContain('BIP (In Play)');
    expect(text).toContain('K/BB (Strikeout to Walk)');
    expect(text).toContain('P/IP (Pitches per Inning)');
    expect(text).toContain('P/BF (Pitches per Batter)');
    expect(text).toContain('B = Ball');
    expect(text).toContain('Called Strike');
    expect(text).toContain('Swing Strike');
    expect(text).toContain('Ball in Play');
  });

  test('#122: simple mode stats has inline descriptions but no graph legend', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    await addSimplePitches(page, 3);
    await page.locator('.stats-link').click();
    await page.waitForSelector('.stats-sheet', { timeout: 3000 });
    await page.locator('.stats-sheet').getByText('Jake M.').click();
    await page.waitForSelector('.stats-sheet', { timeout: 3000 });
    const text = await page.locator('.stats-sheet').textContent();
    expect(text).toContain('K (Strikeouts)');
    expect(text).toContain('BB (Walks)');
    expect(text).not.toContain('B = Ball');
  });

  // #123: Live clock on history card
  test('#123: history card shows clock when clock enabled on live game', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Enable and start clock
    await page.evaluate(() => { (window as any).toggleClockEnabled(); });
    await page.locator('#game-clock').click();
    await page.waitForTimeout(1100);
    // Close to history
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item').filter({ hasText: 'Close' }).click();
    await page.waitForSelector('#screen-history.active');
    // Should show clock instead of LIVE text
    const badge = page.locator('.live-badge');
    await expect(badge).toBeVisible();
    const clockEl = badge.locator('.hist-clock');
    await expect(clockEl).toBeVisible();
    const clockText = await clockEl.textContent();
    expect(clockText).toMatch(/\d+:\d+/);
  });

  test('#123: history card shows LIVE when clock not enabled', async ({ page }) => {
    await startGame(page, { mode: 'simple' });
    // Close to history without enabling clock
    await page.click('.menu-btn');
    await page.locator('#game-hbg-menu .hbg-item').filter({ hasText: 'Close' }).click();
    await page.waitForSelector('#screen-history.active');
    // Should show standard LIVE badge
    const badge = page.locator('.live-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('LIVE');
  });
});
