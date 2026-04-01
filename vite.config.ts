import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (!normalizedId.includes('node_modules')) {
            return
          }

          if (
            normalizedId.includes('react-router-dom') ||
            normalizedId.includes('node_modules/react/') ||
            normalizedId.includes('node_modules/react-dom/')
          ) {
            return 'react-vendor'
          }

          if (normalizedId.includes('recharts')) {
            return 'charts-vendor'
          }

          if (normalizedId.includes('framer-motion')) {
            return 'motion-vendor'
          }

          if (normalizedId.includes('lucide-react')) {
            return 'icons-vendor'
          }
        },
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
  },
})
