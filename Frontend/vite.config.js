import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://zr2c07nm-5000.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
