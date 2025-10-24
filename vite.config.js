import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 VERY IMPORTANT for cPanel hosting
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
    allowedHosts: ['front.deploy.tz'],
  }
})
