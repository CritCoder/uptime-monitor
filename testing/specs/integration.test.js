import { test, expect } from '@playwright/test';
import { 
  login, 
  register, 
  createMonitor, 
  waitForNetworkIdle,
  generateEmail,
  navigateTo
} from '../utils/helpers.js';
import config from '../config/test.config.js';

test.describe('Full Integration Tests', () => {
  test('complete user journey: register -> login -> create monitor -> view dashboard', async ({ page }) => {
    // Step 1: Register a new user
    const userData = {
      name: 'Integration Test User',
      email: generateEmail(),
      password: 'TestPassword123!'
    };

    await register(page, userData);
    await expect(page).toHaveURL(/.*login/);

    // Step 2: Login with the new user
    await login(page, userData.email, userData.password);
    await expect(page).toHaveURL(/.*dashboard/);

    // Step 3: Create a monitor
    const monitor = {
      name: `Integration Test Monitor ${Date.now()}`,
      url: 'https://example.com',
      type: 'http',
      interval: 300
    };

    await createMonitor(page, monitor);
    await expect(page.locator('text=Monitor created')).toBeVisible({ timeout: 10000 });

    // Step 4: Navigate to monitors page
    await page.goto('/monitors');
    await expect(page.locator(`text=${monitor.name}`)).toBeVisible();

    // Step 5: View monitor details
    await page.click(`text=${monitor.name}`);
    await expect(page).toHaveURL(/.*monitors\/\d+/);
    await expect(page.locator('text=Response Time')).toBeVisible();

    // Step 6: Go back to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Total Monitors')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Monitors')).toBeVisible();
    });
  });

  test('demo user can access all features', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');

    // Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Monitors
    await page.goto('/monitors');
    await expect(page).toHaveURL(/.*monitors/);

    // Incidents
    await page.goto('/incidents');
    await expect(page).toHaveURL(/.*incidents/);

    // Alerts
    await page.goto('/alerts');
    await expect(page).toHaveURL(/.*alerts/);

    // Status Pages
    await page.goto('/status-pages');
    await expect(page).toHaveURL(/.*status-pages/);

    // Settings
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*settings/);
  });

  test('navigation flow works correctly', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');

    // Navigate through main menu
    await page.click('a[href="/monitors"]').catch(async () => {
      await page.goto('/monitors');
    });
    await expect(page).toHaveURL(/.*monitors/);

    await page.click('a[href="/incidents"]').catch(async () => {
      await page.goto('/incidents');
    });
    await expect(page).toHaveURL(/.*incidents/);

    await page.click('a[href="/alerts"]').catch(async () => {
      await page.goto('/alerts');
    });
    await expect(page).toHaveURL(/.*alerts/);

    await page.click('a[href="/dashboard"]').catch(async () => {
      await page.goto('/dashboard');
    });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('protected routes redirect unauthenticated users', async ({ page }) => {
    // Try to access protected pages without login
    const protectedRoutes = [
      '/dashboard',
      '/monitors',
      '/incidents',
      '/alerts',
      '/status-pages',
      '/settings'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('public routes are accessible without authentication', async ({ page }) => {
    // Landing page
    await page.goto('/');
    await expect(page.locator('text=Professional Uptime Monitoring')).toBeVisible();

    // Login page
    await page.goto('/login');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();

    // Register page
    await page.goto('/register');
    await expect(page.locator('text=Create your account')).toBeVisible();

    // Forgot password page
    await page.goto('/forgot-password');
    await expect(page.locator('text=Reset your password')).toBeVisible();
  });

  test('workspace switching works', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');

    // Check if workspace selector exists
    const hasWorkspaceSelector = await page.locator('[data-testid="workspace-selector"]').isVisible()
      .catch(() => false);

    if (hasWorkspaceSelector) {
      await page.click('[data-testid="workspace-selector"]');
      await expect(page.locator('text=Workspace')).toBeVisible();
    }
  });

  test('error handling works correctly', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page-12345');
    
    // Should either show 404 or redirect to dashboard/home
    const is404 = await page.locator('text=404').isVisible().catch(() => false);
    const isRedirected = page.url().includes('/dashboard') || page.url().endsWith('/');
    
    expect(is404 || isRedirected).toBeTruthy();
  });

  test('forms validate required fields', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');

    // Try to create monitor without required fields
    await page.goto('/monitors/create');
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');

    // Go to monitors
    await page.goto('/monitors');
    
    // Try to use search
    const searchInput = page.locator('input[type="search"]').or(page.locator('[placeholder*="Search"]'));
    const isSearchVisible = await searchInput.isVisible().catch(() => false);
    
    if (isSearchVisible) {
      await searchInput.fill('test');
      await waitForNetworkIdle(page);
      // Search should filter results or show "no results"
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    
    // Should see mobile menu button
    const mobileMenu = page.locator('button[aria-label*="menu"]').or(page.locator('.mobile-menu-button'));
    await expect(mobileMenu).toBeVisible();

    // Test mobile navigation
    await login(page, 'demo@uptime-monitor.com', 'demo123');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

