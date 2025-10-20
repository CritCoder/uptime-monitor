import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory if it doesn't exist
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Capture a screenshot of a URL using Playwright
 * @param {string} url - The URL to capture
 * @returns {Promise<string|null>} - The screenshot URL path or null if failed
 */
export async function captureScreenshot(url) {
  let browser = null;

  try {
    console.log(`📸 Capturing screenshot for ${url}...`);

    // Launch browser in headless mode
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Set a timeout for navigation
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for any animations or lazy loading
    await page.waitForTimeout(1000);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const filePath = path.join(SCREENSHOTS_DIR, filename);

    // Take screenshot
    await page.screenshot({
      path: filePath,
      fullPage: false,
      type: 'png'
    });

    await browser.close();
    browser = null;

    // Return the URL path (relative to server)
    const screenshotUrl = `/screenshots/${filename}`;
    console.log(`✅ Screenshot captured for ${url}: ${screenshotUrl}`);

    return screenshotUrl;
  } catch (error) {
    console.error(`❌ Failed to capture screenshot for ${url}:`, error.message);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }

    return null;
  }
}

/**
 * Refresh screenshot for a monitor
 * @param {Object} monitor - The monitor object
 * @returns {Promise<string|null>} - The new screenshot URL or null
 */
export async function refreshMonitorScreenshot(monitor) {
  if (monitor.type !== 'http' && monitor.type !== 'https') {
    console.log(`Skipping screenshot for monitor ${monitor.name} (type: ${monitor.type})`);
    return null;
  }

  const url = monitor.url;
  if (!url) {
    console.warn(`No URL found for monitor ${monitor.name}`);
    return null;
  }

  return await captureScreenshot(url);
}

