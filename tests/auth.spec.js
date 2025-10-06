import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should show landing page content
    await expect(page.locator('h1')).toContainText('Professional Uptime Monitoring');
    
    // Should have login/register buttons
    await expect(page.locator('text=Log in')).toBeVisible();
    await expect(page.locator('text=Get started for free')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Log in');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Get started for free');
    
    await expect(page).toHaveURL('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message (toast notification)
    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Logout - look for logout button in navigation
    await page.click('text=Logout');
    
    // Should redirect to landing page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Professional Uptime Monitoring');
  });
});
