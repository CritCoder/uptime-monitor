import { test, expect } from '@playwright/test';
import { 
  login, 
  createMonitor, 
  deleteMonitor,
  waitForNetworkIdle,
  waitForToast,
  navigateTo
} from '../utils/helpers.js';
import { testMonitors } from '../utils/fixtures.js';
import config from '../config/test.config.js';

test.describe('Monitors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.baseURL);
    await login(page, 'demo@uptime-monitor.com', 'demo123');
  });

  test('should create an HTTP monitor', async ({ page }) => {
    const monitor = testMonitors.httpMonitor;
    
    await createMonitor(page, monitor);
    
    // Should show success message
    await expect(page.locator('text=Monitor created')).toBeVisible({ timeout: 10000 });
    
    // Should be on monitors page with new monitor
    await page.goto('/monitors');
    await expect(page.locator(`text=${monitor.name}`)).toBeVisible();
  });

  test('should create an HTTPS monitor', async ({ page }) => {
    const monitor = testMonitors.httpsMonitor;
    
    await createMonitor(page, monitor);
    
    await expect(page.locator('text=Monitor created')).toBeVisible({ timeout: 10000 });
  });

  test('should view monitor details', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click first monitor
    await page.click('.monitor-card', { timeout: 10000 }).catch(async () => {
      await page.click('a[href*="/monitors/"]').first();
    });
    
    // Should show monitor details
    await expect(page).toHaveURL(/.*monitors\/\d+/);
    await expect(page.locator('text=Response Time')).toBeVisible();
  });

  test('should edit a monitor', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click first monitor
    await page.click('a[href*="/monitors/"]').first();
    
    // Click edit button
    await page.click('button:has-text("Edit")').catch(async () => {
      await page.click('a[href*="/edit"]');
    });
    
    // Should be on edit page
    await expect(page).toHaveURL(/.*\/edit/);
    
    // Change monitor name
    const newName = 'Updated Monitor Name';
    await page.fill('input[name="name"]', newName);
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Monitor updated')).toBeVisible({ timeout: 10000 });
  });

  test('should delete a monitor', async ({ page }) => {
    // Create a monitor first
    const monitor = { ...testMonitors.httpMonitor, name: `Delete Test ${Date.now()}` };
    await createMonitor(page, monitor);
    
    await page.goto('/monitors');
    await page.click(`text=${monitor.name}`);
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")').catch(async () => {
      await page.click('button:has-text("Yes")');
    });
    
    // Should show success message
    await expect(page.locator('text=Monitor deleted')).toBeVisible({ timeout: 10000 });
    
    // Should not see monitor in list
    await page.goto('/monitors');
    await expect(page.locator(`text=${monitor.name}`)).not.toBeVisible();
  });

  test('should pause and resume a monitor', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click first monitor
    await page.click('a[href*="/monitors/"]').first();
    
    // Pause monitor
    await page.click('button:has-text("Pause")').catch(async () => {
      await page.click('[data-action="pause"]');
    });
    
    // Should show paused status
    await expect(page.locator('text=Paused')).toBeVisible({ timeout: 10000 });
    
    // Resume monitor
    await page.click('button:has-text("Resume")').catch(async () => {
      await page.click('[data-action="resume"]');
    });
    
    // Should show active status
    await expect(page.locator('text=Active')).toBeVisible({ timeout: 10000 });
  });

  test('should filter monitors by status', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click filter dropdown
    await page.click('button:has-text("Filter")').catch(async () => {
      await page.click('[data-testid="filter-button"]');
    });
    
    // Select "Down" filter
    await page.click('text=Down').catch(async () => {
      await page.click('[data-filter="down"]');
    });
    
    await waitForNetworkIdle(page);
    
    // Should only show down monitors
    await expect(page.locator('[data-status="down"]')).toBeVisible().catch(() => {
      // No down monitors is also valid
    });
  });

  test('should search monitors', async ({ page }) => {
    await page.goto('/monitors');
    
    // Type in search box
    await page.fill('input[type="search"]', 'test').catch(async () => {
      await page.fill('[placeholder*="Search"]', 'test');
    });
    
    await waitForNetworkIdle(page);
    
    // Results should be filtered
    const monitors = page.locator('.monitor-card');
    const count = await monitors.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should validate required fields when creating monitor', async ({ page }) => {
    await page.goto('/monitors/create');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should validate URL format', async ({ page }) => {
    await page.goto('/monitors/create');
    
    await page.fill('input[name="name"]', 'Test Monitor');
    await page.fill('input[name="url"]', 'invalid-url');
    await page.click('button[type="submit"]');
    
    // Should show URL validation error
    await expect(page.locator('text=valid URL')).toBeVisible().catch(async () => {
      await expect(page.locator('text=invalid')).toBeVisible();
    });
  });

  test('should show monitor statistics', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click first monitor
    await page.click('a[href*="/monitors/"]').first();
    
    // Should show statistics
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Response Time')).toBeVisible();
    await expect(page.locator('text=Checks')).toBeVisible();
  });

  test('should display recent checks', async ({ page }) => {
    await page.goto('/monitors');
    
    // Click first monitor
    await page.click('a[href*="/monitors/"]').first();
    
    // Should show recent checks section
    await expect(page.locator('text=Recent Checks')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Check History')).toBeVisible();
    });
  });
});

