import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard with monitoring data', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show dashboard title
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Should show monitoring stats
    await expect(page.locator('text=Total Monitors')).toBeVisible();
    await expect(page.locator('text=Up Monitors')).toBeVisible();
    await expect(page.locator('text=Down Monitors')).toBeVisible();
    await expect(page.locator('text=Average Uptime')).toBeVisible();
  });

  test('should display monitor cards', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show monitor cards
    await expect(page.locator('[data-testid="monitor-card"]').first()).toBeVisible();
    
    // Should show monitor status
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
  });

  test('should navigate to monitors page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Monitors');
    await expect(page).toHaveURL('/monitors');
    await expect(page.locator('h1')).toContainText('Monitors');
  });

  test('should navigate to incidents page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Incidents');
    await expect(page).toHaveURL('/incidents');
    await expect(page.locator('h1')).toContainText('Incidents');
  });

  test('should navigate to alerts page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Alerts');
    await expect(page).toHaveURL('/alerts');
    await expect(page.locator('h1')).toContainText('Alert Contacts');
  });

  test('should navigate to status pages', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Status Pages');
    await expect(page).toHaveURL('/status-pages');
    await expect(page.locator('h1')).toContainText('Status Pages');
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });
});
