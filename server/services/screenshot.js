import axios from 'axios';

const SCREENSHOT_API_URL = 'https://screenshot.support/api/screenshots';
const SCREENSHOT_API_KEY = 'sk_d0610488a65404e71f91d38e379c62dad3c3ed6765e98947629a149256fdd83a';

/**
 * Capture a screenshot of a website using the Screenshot API
 * @param {string} url - The URL to capture
 * @param {Object} options - Screenshot options
 * @returns {Promise<string>} Base64 encoded screenshot or URL
 */
export async function captureScreenshot(url, options = {}) {
  try {
    const defaultOptions = {
      url: url,
      format: 'png',
      width: 1920,
      height: 1080,
      fullPage: false,
      waitFor: 0,
      browser: 'chromium',
      scrollToBottom: false,
      timeout: 30000
    };

    const requestOptions = { ...defaultOptions, ...options };

    console.log(`📸 Capturing screenshot for: ${url}`);

    const response = await axios.post(SCREENSHOT_API_URL, requestOptions, {
      headers: {
        'X-API-Key': SCREENSHOT_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 35000 // 35 second timeout
    });

    if (response.data && response.data.screenshot) {
      console.log(`✅ Screenshot captured successfully for: ${url}`);
      return response.data.screenshot;
    } else {
      throw new Error('No screenshot data received from API');
    }
  } catch (error) {
    console.error(`❌ Screenshot capture failed for ${url}:`, error.message);
    
    if (error.response) {
      console.error('API Response:', error.response.data);
      throw new Error(`Screenshot API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Screenshot API request failed - service may be unavailable');
    } else {
      throw new Error(`Screenshot capture error: ${error.message}`);
    }
  }
}

/**
 * Capture a screenshot and save it to the database
 * @param {string} monitorId - The monitor ID
 * @param {string} url - The URL to capture
 * @returns {Promise<string>} Screenshot URL or base64 data
 */
export async function captureAndSaveScreenshot(monitorId, url) {
  try {
    const screenshot = await captureScreenshot(url, {
      width: 1280,
      height: 720,
      fullPage: false
    });

    // For now, we'll return the base64 data
    // In production, you might want to save this to a file storage service
    return screenshot;
  } catch (error) {
    console.error(`Failed to capture screenshot for monitor ${monitorId}:`, error);
    throw error;
  }
}

/**
 * Get a cached screenshot or capture a new one
 * @param {string} url - The URL to capture
 * @param {boolean} forceRefresh - Force a new capture
 * @returns {Promise<string>} Screenshot data
 */
export async function getScreenshot(url, forceRefresh = false) {
  try {
    // For now, we'll always capture a new screenshot
    // In production, you might want to implement caching
    return await captureScreenshot(url);
  } catch (error) {
    console.error(`Failed to get screenshot for ${url}:`, error);
    throw error;
  }
}