import { defineConfig, devices } from '@playwright/test';

process.env.TEST = 'true'; // For test-runner isTesting

export default defineConfig({
  testDir: './playwright',
  globalSetup: './playwright/playwright.setup.ts',
  expect: { timeout: 10 * 1000 },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `https://127.0.0.1:33123/tutu-frontend`,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    timezoneId: 'Europe/Helsinki',
    video: process.env.VIDEO ? 'retain-on-failure' : 'off',
  },

  webServer: {
    command: 'pnpm exec vite --mode test',
    url: 'https://127.0.0.1:33123/tutu-frontend',
    reuseExistingServer: !process.env.CI, // fresh server in CI, reuse locally
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], bypassCSP: true },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], bypassCSP: true },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], bypassCSP: true },
    },
  ],
});
