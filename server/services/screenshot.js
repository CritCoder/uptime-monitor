/**
 * Capture a screenshot of a URL using screenshot.support API
 * @param {string} url - The URL to capture
 * @returns {Promise<string|null>} - The screenshot URL path or null if failed
 */
export async function captureScreenshot(url) {
  try {
    console.log(`📸 Capturing screenshot for ${url}...`);

    const apiUrl = process.env.SCREENSHOT_API_URL || 'https://screenshot.support/api/screenshots';
    const apiKey = process.env.SCREENSHOT_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.error('❌ Screenshot API key not configured');
      return null;
    }

    // Build the API request URL
    const params = new URLSearchParams({
      url: url,
      format: 'png',
      width: '1920',
      height: '1080',
      fullPage: 'false',
      waitFor: '0',
      browser: 'chromium',
      scrollToBottom: 'false',
      timeout: '30000',
      api_key: apiKey
    });

    const requestUrl = `${apiUrl}?${params.toString()}`;

    // Make the API request
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error(`❌ Screenshot API failed for ${url}:`, data);
      return null;
    }

    // Construct the full screenshot URL
    const screenshotUrl = `https://screenshot.support${data.screenshot.filePath}`;
    console.log(`✅ Screenshot captured for ${url}: ${screenshotUrl}`);
    console.log(`📊 Credits remaining: ${data.creditsRemaining}`);

    return screenshotUrl;
  } catch (error) {
    console.error(`❌ Failed to capture screenshot for ${url}:`, error.message);
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

