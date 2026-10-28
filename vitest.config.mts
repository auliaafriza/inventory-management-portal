import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 20000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "https://dummyjson.com",
      NEXT_PUBLIC_FAILURE_RATE: "0",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/features/products/schemas/**/*.ts",
        "src/features/products/store/**/*.ts",
        "src/features/products/utils/**/*.ts",
        "src/lib/utils/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
})
