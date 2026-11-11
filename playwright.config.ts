import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const CI = Boolean(process.env.CI);

/**
 * Smoke e2e against the production build (brief, section 12): run `pnpm build` first. Locally it
 * reuses a server already on the port; in CI it starts one.
 */
export default defineConfig({
  testDir: "src/tests/e2e",
  timeout: 120_000,
  workers: CI ? 1 : undefined,
  retries: CI ? 1 : 0,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/pt`,
    // Production refuses loopback origins in the 404 proxy (SSRF), except this exact one.
    env: { TRUSTED_LOCAL_ORIGIN: `http://localhost:${PORT}` },
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
