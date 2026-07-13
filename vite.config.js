import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces for Tailscale access
    port: 3000,
    strictPort: true,
    // Restrict Host header to Tailscale MagicDNS names instead of `true`,
    // which would disable DNS-rebinding protection entirely
    allowedHosts: ['.ts.net'],
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  build: {
    sourcemap: false,
    target: 'es2020'
  },
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

