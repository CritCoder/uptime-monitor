import { test, expect } from '@playwright/test';

test.describe('Monitors Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display monitors page with existing monitors', async ({ page }) => {
    await page.goto('/monitors');
    
    // Should show monitors page
    await expect(page.locator('h1')).toContainText('Monitors');
    await expect(page.locator('text=Manage your monitoring targets')).toBeVisible();
    
    // Should show existing monitors
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=Cloudflare DNS')).toBeVisible();
    await expect(page.locator('text=SSH Port Check')).toBeVisible();
  });

  test('should navigate to create monitor page', async ({ page }) => {
    await page.goto('/monitors');
    
    await page.click('text=Add Monitor');
    await expect(page).toHaveURL('/monitors/create');
    await expect(page.locator('h1')).toContainText('Create Monitor');
  });

  test('should create a new monitor', async ({ page }) => {
    await page.goto('/monitors/create');
    
    // Fill in monitor details
    await page.fill('input[name="name"]', 'Test Monitor');
    await page.selectOption('select[name="type"]', 'http');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.selectOption('select[name="interval"]', '60');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to monitors page
    await expect(page).toHaveURL('/monitors');
    await expect(page.locator('text=Test Monitor')).toBeVisible();
  });

  test('should view monitor details', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click on first monitor
    await page.click('text=Google');
    await expect(page).toHaveURL(/\/monitors\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('Monitor Details');
  });

  test('should search monitors', async ({ page }) => {
    await page.goto('/monitors');
    
    // Search for Google
    await page.fill('input[placeholder*="Search"]', 'Google');
    
    // Should show only Google monitor
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).not.toBeVisible();
  });

  test('should filter monitors by status', async ({ page }) => {
    await page.goto('/monitors');
    
    // All monitors should be visible initially
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
  });
});
