import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    exclude: [
      'tests/**/*.spec.ts', // Exclude Playwright E2E specs
      'src/main.test.ts', // Vue entry point, not a test file
      'node_modules/**'
    ]
  }
})
