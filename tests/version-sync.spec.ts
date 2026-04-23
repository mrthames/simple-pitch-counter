import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { clearState } from './helpers';

test.describe('Version sync', () => {
  test('all version strings match across Android, iOS, and app UI', async () => {
    const root = resolve(__dirname, '..');

    const indexHtml = readFileSync(resolve(root, 'app/index.html'), 'utf-8');
    const uiMatch = indexHtml.match(/Version\s+([\d.]+)/);
    const uiVersion = uiMatch?.[1];

    const gradle = readFileSync(resolve(root, 'android/app/build.gradle.kts'), 'utf-8');
    const gradleMatch = gradle.match(/versionName\s*=\s*"([\d.]+)"/);
    const androidVersion = gradleMatch?.[1];

    const pbxproj = readFileSync(resolve(root, 'app/Little League Pitch Counter.xcodeproj/project.pbxproj'), 'utf-8');
    const xcodeMatches = [...pbxproj.matchAll(/MARKETING_VERSION\s*=\s*([\d.]+);/g)];
    const iosVersions = xcodeMatches.map(m => m[1]);

    expect(uiVersion, 'UI version should be defined').toBeTruthy();
    expect(androidVersion, 'Android version should be defined').toBeTruthy();
    expect(iosVersions.length, 'iOS versions should be found').toBeGreaterThan(0);

    expect(androidVersion, 'Android versionName should match app UI').toBe(uiVersion);
    for (const v of iosVersions) {
      expect(v, 'iOS MARKETING_VERSION should match app UI').toBe(uiVersion);
    }
  });

  test('about screen displays the same version as source files', async ({ page }) => {
    const root = resolve(__dirname, '..');
    const gradle = readFileSync(resolve(root, 'android/app/build.gradle.kts'), 'utf-8');
    const gradleMatch = gradle.match(/versionName\s*=\s*"([\d.]+)"/);
    const expectedVersion = gradleMatch?.[1];

    await page.goto('/');
    await clearState(page);
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toContainText(`Version ${expectedVersion}`);
  });
});
