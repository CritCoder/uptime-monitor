import axios from 'axios';

const LOGO_API_BASE_URL = 'https://high-dingo-95.deno.dev';

// Cache for logo URLs to avoid repeated API calls
const logoCache = new Map();

/**
 * Search for company logos using the Logo Search API
 * @param {string} query - Company name to search for
 * @param {number} limit - Number of results to return (default: 5)
 * @returns {Promise<Array>} Array of logo objects
 */
export async function searchLogos(query, limit = 5) {
  try {
    // Check cache first
    const cacheKey = `${query.toLowerCase()}_${limit}`;
    if (logoCache.has(cacheKey)) {
      return logoCache.get(cacheKey);
    }

    const response = await axios.get(`${LOGO_API_BASE_URL}/search`, {
      params: {
        q: query,
        limit: limit
      },
      timeout: 10000 // 10 second timeout
    });

    const logos = response.data.results || [];
    
    // Cache the results for 1 hour
    logoCache.set(cacheKey, logos);
    setTimeout(() => logoCache.delete(cacheKey), 60 * 60 * 1000);

    return logos;
  } catch (error) {
    console.error('Logo search error:', error.message);
    return [];
  }
}

/**
 * Get a specific logo for a company
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} Logo URL or null if not found
 */
export async function getCompanyLogo(companyName) {
  try {
    const logos = await searchLogos(companyName, 1);
    return logos.length > 0 ? logos[0].thumbnailUrl : null;
  } catch (error) {
    console.error('Get company logo error:', error.message);
    return null;
  }
}

/**
 * Get multiple logos for different companies
 * @param {Array<string>} companyNames - Array of company names
 * @returns {Promise<Object>} Object with company names as keys and logo URLs as values
 */
export async function getMultipleLogos(companyNames) {
  const logoPromises = companyNames.map(async (name) => {
    const logo = await getCompanyLogo(name);
    return { name, logo };
  });

  const results = await Promise.all(logoPromises);
  
  return results.reduce((acc, { name, logo }) => {
    acc[name] = logo;
    return acc;
  }, {});
}

/**
 * Health check for the logo API
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function checkLogoApiHealth() {
  try {
    const response = await axios.get(`${LOGO_API_BASE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    console.error('Logo API health check failed:', error.message);
    return false;
  }
}
