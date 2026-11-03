import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      '.next/**',
      '.kilo/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
})
