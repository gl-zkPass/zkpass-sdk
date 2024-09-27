import { defineConfig, devices } from "@playwright/test";
import { FRONTEND_URL, ISSUER_VERIFIER_URL } from "./utils/constants";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: false,
  retries: 3,
  workers: 1,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
  webServer: [
    {
      command: `cd .. && npm run dev`,
      url: FRONTEND_URL,
      reuseExistingServer: true,
    },
    {
      command: `cd ../../issuer-verifier && npm run dev`,
      url: ISSUER_VERIFIER_URL,
      reuseExistingServer: true,
    },
  ],
});
