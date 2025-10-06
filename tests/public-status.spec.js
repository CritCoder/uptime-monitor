import { test, expect } from '@playwright/test';

test.describe('Public Status Page', () => {
  test('should display public status page without authentication', async ({ page }) => {
    await page.goto('/status/demo-status');
    
    // Should show status page content
    await expect(page.locator('h1')).toContainText('Demo Status Page');
    await expect(page.locator('text=System Status')).toBeVisible();
    await expect(page.locator('text=Services')).toBeVisible();
  });

  test('should show monitor status', async ({ page }) => {
    await page.goto('/status/demo-status');
    
    // Should show monitor statuses
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=Cloudflare DNS')).toBeVisible();
    await expect(page.locator('text=SSH Port Check')).toBeVisible();
  });

  test('should show uptime statistics', async ({ page }) => {
    await page.goto('/status/demo-status');
    
    // Should show uptime percentage
    await expect(page.locator('text=97.28%')).toBeVisible();
    await expect(page.locator('text=4 of 4 services operational')).toBeVisible();
  });

  test('should show recent incidents section', async ({ page }) => {
    await page.goto('/status/demo-status');
    
    // Should show incidents section (even if empty)
    await expect(page.locator('text=Recent Incidents')).toBeVisible();
  });

  test('should be accessible without login', async ({ page }) => {
    // Go directly to status page without authentication
    await page.goto('/status/demo-status');
    
    // Should not redirect to login
    await expect(page).toHaveURL('/status/demo-status');
    await expect(page.locator('text=Demo Status Page')).toBeVisible();
  });
});
