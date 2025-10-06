import { test, expect } from '@playwright/test';

test.describe('Alerts Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display alerts page', async ({ page }) => {
    await page.goto('/alerts');
    
    // Should show alerts page
    await expect(page.locator('h1')).toContainText('Alert Contacts');
    await expect(page.locator('text=Manage notification channels')).toBeVisible();
    
    // Should show existing alert contacts
    await expect(page.locator('text=Email Contact')).toBeVisible();
    await expect(page.locator('text=SMS Contact')).toBeVisible();
  });

  test('should show alert contact details', async ({ page }) => {
    await page.goto('/alerts');
    
    // Should show contact types and values
    await expect(page.locator('text=email')).toBeVisible();
    await expect(page.locator('text=sms')).toBeVisible();
  });

  test('should show active/inactive status', async ({ page }) => {
    await page.goto('/alerts');
    
    // Should show status indicators
    await expect(page.locator('text=Active')).toBeVisible();
  });
});
