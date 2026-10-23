import { fileURLToPath, URL } from "node:url";

import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite-plus";

// Read PORT from the same .env files as `vp dev`, so both use the same port
const env = loadEnv("development", fileURLToPath(new URL(".", import.meta.url)), "");
const port = Number(env.PORT) || 5173;
const baseURL = `http://localhost:${port}`;

// https://playwright.dev/docs/test-configuration
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: `vp dev --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
    },
});
