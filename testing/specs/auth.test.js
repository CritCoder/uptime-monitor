import { test, expect } from '@playwright/test';
import { 
  login, 
  register, 
  logout, 
  waitForToast, 
  generateEmail,
  isLoggedIn,
  navigateTo
} from '../utils/helpers.js';
import config from '../config/test.config.js';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.baseURL);
  });

  test('should register a new user successfully', async ({ page }) => {
    const userData = {
      name: 'Test User',
      email: generateEmail(),
      password: 'TestPassword123!'
    };

    await register(page, userData);
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Should show success message
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
  });

  test('should not register with existing email', async ({ page }) => {
    const email = 'demo@uptime-monitor.com';
    const userData = {
      name: 'Test User',
      email,
      password: 'TestPassword123!'
    };

    await page.goto('/register');
    await page.fill('input[name="name"]', userData.name);
    await page.fill('input[type="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    await page.fill('input[name="confirmPassword"]', userData.password);
    await page.check('input[name="agree-terms"]');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=User already exists')).toBeVisible({ timeout: 10000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');
    
    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Should see dashboard content
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');
    
    // Click user menu
    await page.click('[aria-label="User menu"]').catch(async () => {
      // Try alternative selectors
      await page.click('button:has-text("Demo User")').catch(async () => {
        await page.click('[data-testid="user-menu"]');
      });
    });
    
    await page.click('text=Logout');
    
    // Should redirect to login or home page
    await page.waitForURL(/\/(login|)$/);
  });

  test('should show forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot your password?');
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('text=Reset your password')).toBeVisible();
  });

  test('should validate email format on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.check('input[name="agree-terms"]');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate password length on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', generateEmail());
    await page.fill('input[name="password"]', 'short');
    await page.fill('input[name="confirmPassword"]', 'short');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=at least 8 characters')).toBeVisible();
  });

  test('should validate password match on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', generateEmail());
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should require terms agreement on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', generateEmail());
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    // Don't check terms checkbox
    
    await page.click('button[type="submit"]');
    
    // Button should not submit (HTML5 validation)
    await expect(page).toHaveURL(/.*register/);
  });

  test('should persist login after page reload', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    await login(page, 'demo@uptime-monitor.com', 'demo123');
    
    // Try to access login page
    await page.goto('/login');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

