import { test, expect } from '@playwright/test';

test.describe('Status Pages Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display status pages page', async ({ page }) => {
    await page.goto('/status-pages');
    
    // Should show status pages page
    await expect(page.locator('h1')).toContainText('Status Pages');
    await expect(page.locator('text=Create and manage public status pages')).toBeVisible();
    
    // Should show existing status page
    await expect(page.locator('text=Demo Status Page')).toBeVisible();
  });

  test('should show status page details', async ({ page }) => {
    await page.goto('/status-pages');
    
    // Should show status page info
    await expect(page.locator('text=Public')).toBeVisible();
    await expect(page.locator('text=4 monitors')).toBeVisible();
  });

  test('should navigate to status page details', async ({ page }) => {
    await page.goto('/status-pages');
    
    // Click on status page
    await page.click('text=Edit');
    await expect(page).toHaveURL(/\/status-pages\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('Status Page Details');
  });

  test('should view public status page', async ({ page }) => {
    // Open public status page in new tab
    await page.goto('/status-pages');
    await page.click('text=View');
    
    // Should open public status page
    await expect(page).toHaveURL(/\/status\/demo-status/);
    await expect(page.locator('text=Demo Status Page')).toBeVisible();
  });
});
