import { test, expect } from '@playwright/test';

test.describe('Incidents Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display incidents page', async ({ page }) => {
    await page.goto('/incidents');
    
    // Should show incidents page
    await expect(page.locator('h1')).toContainText('Incidents');
    await expect(page.locator('text=Track and manage service incidents')).toBeVisible();
    
    // Should show recent incidents section
    await expect(page.locator('text=Recent Incidents')).toBeVisible();
  });

  test('should show no incidents when system is healthy', async ({ page }) => {
    await page.goto('/incidents');
    
    // Should show empty state or no incidents message
    await expect(page.locator('text=No incidents found')).toBeVisible();
  });

  test('should navigate to incident details', async ({ page }) => {
    await page.goto('/incidents');
    
    // If there are incidents, click on the first one
    const incidentLink = page.locator('text=View').first();
    if (await incidentLink.isVisible()) {
      await incidentLink.click();
      await expect(page).toHaveURL(/\/incidents\/[a-f0-9-]+/);
      await expect(page.locator('h1')).toContainText('Incident Details');
    }
  });
});
