import { test, expect } from '@playwright/test';
import { clearState } from './helpers';

test.describe('About screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearState(page);
  });

  test('about screen accessible from history menu', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toHaveClass(/active/);
  });

  test('about screen shows app name and version', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toContainText('Simple Pitch Counter');
    await expect(page.locator('#screen-about')).toContainText('Version 2.2');
  });

  test('about screen shows app description', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toContainText('pitch counting app');
  });

  test('about screen has website link', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    const websiteLink = page.locator('#screen-about a[href="https://simplepitchcounter.com"]');
    await expect(websiteLink).toBeVisible();
  });

  test('about screen has privacy policy link', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    const privacyLink = page.locator('#screen-about a[href*="privacy"]');
    await expect(privacyLink).toBeVisible();
  });

  test('about screen has feedback link', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    const feedbackLink = page.locator('#screen-about a[href*="feedback"]');
    await expect(feedbackLink).toBeVisible();
  });

  test('about screen has buy me a coffee link', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    const coffeeLink = page.locator('#screen-about a[href*="justinttha1"]');
    await expect(coffeeLink).toBeVisible();
    await expect(coffeeLink).toContainText('Keep this app free and supported');
  });

  test('back button returns to history', async ({ page }) => {
    await page.click('.hist-menu-btn');
    await page.click('text=About this app');
    await expect(page.locator('#screen-about')).toHaveClass(/active/);

    await page.locator('#screen-about .btn-sm').click();
    await expect(page.locator('#screen-history')).toHaveClass(/active/);
  });
});
