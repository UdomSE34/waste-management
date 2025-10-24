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
<<<<<<< HEAD
    allowedHosts: ['front.deploy.tz'],
  }
=======
    allowedHosts: ['front.deploy.tz'],}
>>>>>>> d0d51596ace93a6de2f21987009b86296a84c8b5
})
