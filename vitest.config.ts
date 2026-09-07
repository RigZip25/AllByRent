import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Kept separate from vite.config.ts so the unit suite never boots the PWA
 * plugin or the build-time asset pipeline.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "virtual:pwa-register": path.resolve(__dirname, "./src/lib/pwaRegisterStub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
    reporters: "default",
  },
});
