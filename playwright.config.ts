import { defineConfig, devices } from '@playwright/test'

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:4173/c-path/', trace: 'retain-on-failure', launchOptions: executablePath ? { executablePath } : undefined },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173/c-path/', reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
})
