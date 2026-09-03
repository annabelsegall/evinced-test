const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  /* Timeout per test */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  /* Run tests sequentially by default to ensure clean accessibility scans */
  fullyParallel: false,
  workers: 1,
  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  /* Authenticate Evinced SDK before tests */
  globalSetup: require.resolve('./global-setup'),

  use: {
    baseURL: process.env.BASE_URL || 'https://a11y-audits.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
