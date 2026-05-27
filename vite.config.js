import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite plugin config with internal loopback mapping
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

