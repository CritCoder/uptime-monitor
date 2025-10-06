import { test, expect } from '@playwright/test';

test.describe('Settings Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Should show settings page
    await expect(page.locator('h1')).toContainText('Settings');
    await expect(page.locator('text=Manage your account settings')).toBeVisible();
  });

  test('should show profile section', async ({ page }) => {
    await page.goto('/settings');
    
    // Should show profile form
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select[name="timezone"]')).toBeVisible();
  });

  test('should show account information', async ({ page }) => {
    await page.goto('/settings');
    
    // Should show account details
    await expect(page.locator('text=Account')).toBeVisible();
    await expect(page.locator('text=Plan')).toBeVisible();
    await expect(page.locator('text=Email Verified')).toBeVisible();
    await expect(page.locator('text=Member Since')).toBeVisible();
  });

  test('should update profile', async ({ page }) => {
    await page.goto('/settings');
    
    // Update name
    await page.fill('input[name="name"]', 'Updated Demo User');
    
    // Update timezone
    await page.selectOption('select[name="timezone"]', 'America/New_York');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });
});
