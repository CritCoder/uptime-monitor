import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testing/specs',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'testing/reports/html', open: 'never' }],
    ['json', { outputFile: 'testing/reports/results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server configuration
  webServer: process.env.CI ? undefined : {
    command: 'cd client && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});

