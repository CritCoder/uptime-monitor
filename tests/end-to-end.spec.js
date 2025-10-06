import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey', () => {
  test('complete user journey from landing to monitoring', async ({ page }) => {
    // 1. Start at landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Uptime Monitor');
    
    // 2. Navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL('/login');
    
    // 3. Login with demo credentials
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // 4. Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 5. Check dashboard shows monitoring data
    await expect(page.locator('text=Total Monitors')).toBeVisible();
    await expect(page.locator('text=Google')).toBeVisible();
    
    // 6. Navigate to monitors page
    await page.click('text=Monitors');
    await expect(page).toHaveURL('/monitors');
    await expect(page.locator('h1')).toContainText('Monitors');
    
    // 7. Create a new monitor
    await page.click('text=Add Monitor');
    await expect(page).toHaveURL('/monitors/create');
    
    await page.fill('input[name="name"]', 'E2E Test Monitor');
    await page.selectOption('select[name="type"]', 'http');
    await page.fill('input[name="url"]', 'https://httpbin.org/status/200');
    await page.selectOption('select[name="interval"]', '60');
    
    await page.click('button[type="submit"]');
    
    // 8. Should redirect back to monitors
    await expect(page).toHaveURL('/monitors');
    await expect(page.locator('text=E2E Test Monitor')).toBeVisible();
    
    // 9. Navigate to incidents
    await page.click('text=Incidents');
    await expect(page).toHaveURL('/incidents');
    await expect(page.locator('h1')).toContainText('Incidents');
    
    // 10. Navigate to alerts
    await page.click('text=Alerts');
    await expect(page).toHaveURL('/alerts');
    await expect(page.locator('h1')).toContainText('Alert Contacts');
    
    // 11. Navigate to status pages
    await page.click('text=Status Pages');
    await expect(page).toHaveURL('/status-pages');
    await expect(page.locator('h1')).toContainText('Status Pages');
    
    // 12. View public status page
    await page.click('text=View');
    await expect(page).toHaveURL(/\/status\/demo-status/);
    await expect(page.locator('text=Demo Status Page')).toBeVisible();
    
    // 13. Navigate to settings
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
    
    // 14. Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Uptime Monitor');
  });

  test('public status page accessibility', async ({ page }) => {
    // Test public status page without authentication
    await page.goto('/status/demo-status');
    
    await expect(page.locator('h1')).toContainText('Demo Status Page');
    await expect(page.locator('text=System Status')).toBeVisible();
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
    
    // Should show uptime statistics
    await expect(page.locator('text=97.28%')).toBeVisible();
  });
});
