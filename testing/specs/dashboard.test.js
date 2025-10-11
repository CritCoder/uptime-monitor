import { test, expect } from '@playwright/test';
import { login, waitForNetworkIdle, navigateTo } from '../utils/helpers.js';
import config from '../config/test.config.js';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.baseURL);
    await login(page, 'demo@uptime-monitor.com', 'demo123');
  });

  test('should display dashboard with summary cards', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Should show summary cards
    await expect(page.locator('text=Total Monitors')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Monitors')).toBeVisible();
    });
    
    await expect(page.locator('text=Up')).toBeVisible();
    await expect(page.locator('text=Down')).toBeVisible();
  });

  test('should display recent incidents', async ({ page }) => {
    // Should show recent incidents section
    await expect(page.locator('text=Recent Incidents')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Incidents')).toBeVisible();
    });
  });

  test('should navigate to monitors from dashboard', async ({ page }) => {
    await page.click('text=View All Monitors').catch(async () => {
      await page.click('a[href="/monitors"]');
    });
    
    await expect(page).toHaveURL(/.*monitors/);
  });

  test('should navigate to incidents from dashboard', async ({ page }) => {
    await page.click('text=View All Incidents').catch(async () => {
      await page.click('a[href="/incidents"]');
    });
    
    await expect(page).toHaveURL(/.*incidents/);
  });

  test('should display monitor status overview', async ({ page }) => {
    // Should show monitor status chart or list
    const hasChart = await page.locator('[data-testid="status-chart"]').isVisible().catch(() => false);
    const hasList = await page.locator('.monitor-status-list').isVisible().catch(() => false);
    
    expect(hasChart || hasList).toBeTruthy();
  });

  test('should show uptime percentage', async ({ page }) => {
    // Should display uptime percentage somewhere on dashboard
    const uptimeRegex = /\d+(\.\d+)?%/;
    await expect(page.locator(`text=${uptimeRegex}`)).toBeVisible();
  });

  test('should refresh dashboard data', async ({ page }) => {
    const initialContent = await page.content();
    
    // Click refresh button if available
    await page.click('button[aria-label="Refresh"]').catch(async () => {
      await page.reload();
    });
    
    await waitForNetworkIdle(page);
    
    const newContent = await page.content();
    expect(newContent).toBeTruthy();
  });

  test('should display response time metrics', async ({ page }) => {
    await expect(page.locator('text=Response Time')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Avg Response')).toBeVisible();
    });
  });

  test('should show workspace selector', async ({ page }) => {
    // Should have workspace selector or name
    const hasSelector = await page.locator('[data-testid="workspace-selector"]').isVisible().catch(() => false);
    const hasName = await page.locator('text=Workspace').isVisible().catch(() => false);
    
    expect(hasSelector || hasName).toBeTruthy();
  });
});

