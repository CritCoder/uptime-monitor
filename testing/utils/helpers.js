import { expect } from '@playwright/test';

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Login helper
 */
export async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

/**
 * Register a new user
 */
export async function register(page, userData) {
  await page.goto('/register');
  await page.fill('input[name="name"]', userData.name);
  await page.fill('input[type="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.password);
  await page.check('input[name="agree-terms"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/login');
}

/**
 * Create a monitor
 */
export async function createMonitor(page, monitorData) {
  await page.goto('/monitors/create');
  
  await page.fill('input[name="name"]', monitorData.name);
  await page.fill('input[name="url"]', monitorData.url);
  await page.selectOption('select[name="type"]', monitorData.type || 'http');
  await page.selectOption('select[name="interval"]', monitorData.interval || '300');
  
  await page.click('button[type="submit"]');
  await waitForNetworkIdle(page);
}

/**
 * Delete a monitor
 */
export async function deleteMonitor(page, monitorName) {
  await page.goto('/monitors');
  await page.click(`text=${monitorName}`);
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Confirm")');
  await waitForNetworkIdle(page);
}

/**
 * Check if element is visible
 */
export async function isVisible(page, selector) {
  try {
    return await page.isVisible(selector, { timeout: 5000 });
  } catch {
    return false;
  }
}

/**
 * Wait for toast message
 */
export async function waitForToast(page, message) {
  await page.waitForSelector(`text=${message}`, { timeout: 10000 });
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `testing/reports/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Generate random email
 */
export function generateEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@uptime-test.com`;
}

/**
 * Generate random string
 */
export function generateRandomString(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(page, urlPattern, callback) {
  const responsePromise = page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200
  );
  
  await callback();
  
  return await responsePromise;
}

/**
 * Check API response status
 */
export async function expectAPISuccess(response) {
  expect(response.status()).toBe(200);
  const json = await response.json();
  expect(json.success || json.message).toBeTruthy();
  return json;
}

/**
 * Logout helper
 */
export async function logout(page) {
  await page.click('button[aria-label="User menu"]', { timeout: 5000 }).catch(() => {});
  await page.click('text=Logout', { timeout: 5000 }).catch(() => {});
  await page.waitForURL('/login', { timeout: 10000 }).catch(() => {});
}

/**
 * Navigate to page and wait for load
 */
export async function navigateTo(page, path) {
  await page.goto(path);
  await waitForNetworkIdle(page);
}

/**
 * Fill form field
 */
export async function fillField(page, selector, value) {
  await page.fill(selector, ''); // Clear first
  await page.fill(selector, value);
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page) {
  try {
    await page.waitForURL('/dashboard', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

