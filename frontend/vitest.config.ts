import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/**/*.e2e.spec.ts", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "lib/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
      ],
      exclude: [
        "components/landing/**",
        "components/layout/**",
        "components/ui/**",
        "lib/landing.ts",
        "lib/mocks/**",
        "lib/api/types.ts",
        "lib/api/mock.ts",
        "lib/api.ts",
      ],
      thresholds: {
        statements: 85,
        branches: 80,
        lines: 85,
        functions: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
