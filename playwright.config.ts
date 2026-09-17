import { defineConfig } from '@playwright/test';
// Own port: 5173 is often taken by another project on this machine.
const url = 'http://127.0.0.1:5183';
export default defineConfig({
  testDir: './tests', reporter: 'list', workers: 1,
  use: { baseURL: url, headless: true, launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} },
  webServer: { command: 'npm run dev -- --port 5183 --strictPort', url, reuseExistingServer: true },
});
