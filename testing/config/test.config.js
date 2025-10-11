export default {
  // Base URLs
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
  apiURL: process.env.TEST_API_URL || 'http://localhost:3000',

  // Timeouts
  timeout: 30000,
  navigationTimeout: 30000,

  // Test user credentials
  testUser: {
    email: `test-${Date.now()}@uptime-test.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  },

  // Browser settings
  headless: process.env.HEADLESS !== 'false',
  slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,

  // Database
  testDbUrl: process.env.TEST_DATABASE_URL || 'file:./testing.db',

  // Retry settings
  retries: process.env.CI ? 2 : 0,

  // Screenshot on failure
  screenshot: true,
  video: process.env.CI ? 'on' : 'retain-on-failure',

  // Reporting
  reporter: [
    ['list'],
    ['html', { outputFolder: 'testing/reports/html' }],
    ['json', { outputFile: 'testing/reports/results.json' }]
  ]
};

