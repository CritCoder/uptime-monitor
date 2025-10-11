import axios from 'axios';

const SCREENSHOT_API_URL = process.env.SCREENSHOT_API_URL || 'https://screenshot.support/api/screenshots';
const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY;

/**
 * Capture a screenshot of a URL using the screenshot API
 * @param {string} url - The URL to capture
 * @returns {Promise<string|null>} - The screenshot URL or null if failed
 */
export async function captureScreenshot(url) {
  // Skip if no API key is configured
  if (!SCREENSHOT_API_KEY || SCREENSHOT_API_KEY === 'YOUR_API_KEY') {
    console.warn('Screenshot API key not configured, skipping screenshot capture');
    return null;
  }

  try {
    const response = await axios.post(
      SCREENSHOT_API_URL,
      {
        url,
        format: 'png',
        width: 1920,
        height: 1080,
        fullPage: false,
        waitFor: 1000,
        browser: 'chromium',
        scrollToBottom: false,
        timeout: 30000
      },
      {
        headers: {
          'X-API-Key': SCREENSHOT_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35 seconds timeout
      }
    );

    if (response.data && response.data.success && response.data.screenshot) {
      // Construct the full screenshot URL
      const screenshotPath = response.data.screenshot.filePath;
      const screenshotUrl = `https://screenshot.support${screenshotPath}`;
      
      console.log(`📸 Screenshot captured for ${url}: ${screenshotUrl}`);
      return screenshotUrl;
    }

    console.warn(`Failed to capture screenshot for ${url}: No screenshot data in response`);
    return null;
  } catch (error) {
    console.error(`Failed to capture screenshot for ${url}:`, error.message);
    if (error.response) {
      console.error('Screenshot API error:', error.response.data);
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

