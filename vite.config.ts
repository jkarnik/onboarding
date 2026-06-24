/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Node.js v22+ ships a native experimental localStorage on globalThis that
    // shadows jsdom's fully-compliant implementation.  Disabling it here lets
    // jsdom own localStorage in all test workers.
    env: {
      NODE_OPTIONS: '--no-experimental-webstorage',
    },
  },
})
