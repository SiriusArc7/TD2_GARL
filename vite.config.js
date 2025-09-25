import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // base: mode === 'production' ? '/TD2_GARL/' : './',
  base: '/TD2_GARL/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
}))
