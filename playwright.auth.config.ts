import { defineConfig, devices } from "@playwright/test";

/**
 * E2E dos fluxos de autenticação contra um Supabase SIMULADO (tests/e2e-auth/mock-supabase.mjs).
 * Valida integração Next.js ↔ @supabase/ssr (cookies, proxy, redirecionamentos) sem projeto real.
 * Rodar: npm run test:e2e:auth
 */
const APP_PORT = 3200;
const MOCK_PORT = 54331;

export default defineConfig({
  testDir: "./tests/e2e-auth",
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : undefined,
  },
  projects: [
    // IPs distintos por projeto: o limite de cadastros por IP (5/10 min) vale também nos testes
    { name: "desktop", use: { ...devices["Desktop Chrome"], extraHTTPHeaders: { "x-forwarded-for": "10.0.0.1" } } },
    { name: "mobile", use: { ...devices["Pixel 7"], extraHTTPHeaders: { "x-forwarded-for": "10.0.0.2" } } },
  ],
  webServer: [
    { command: `node tests/e2e-auth/mock-supabase.mjs`, port: MOCK_PORT, env: { MOCK_SUPABASE_PORT: String(MOCK_PORT) } },
    {
      command: `next build && next start -p ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}`,
      timeout: 240_000,
      reuseExistingServer: false,
      env: {
        NEXT_DIST_DIR: ".next-e2e-auth",
        NEXT_PUBLIC_SITE_URL: `http://localhost:${APP_PORT}`,
        NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${MOCK_PORT}`,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key-somente-para-testes",
      },
    },
  ],
});
