import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('should check what happens after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@uptime-monitor.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await expect(page).toHaveURL('/dashboard');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(2000);
    
    // Check what's actually on the page
    const bodyText = await page.textContent('body');
    console.log('Body text:', bodyText);
    
    // Check for any error messages
    const errorElements = await page.locator('[class*="error"], [class*="Error"]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('Error element:', text);
    }
    
    // Check if there are any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-dashboard.png' });
    
    // Just check if we're on the right page
    await expect(page).toHaveURL('/dashboard');
  });
});
