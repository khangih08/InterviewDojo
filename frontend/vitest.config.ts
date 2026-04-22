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
      thresholds: {
        statements: 50,
        branches: 55,
        lines: 60,
        functions: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
