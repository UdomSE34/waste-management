import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 VERY IMPORTANT for cPanel hosting
  server: {
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:8000/api/',
        target:'https://back.deploy.tz/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
     optimizeDeps: {
    include: [
      "react-icons/fa",
      "react-icons/ai",
      "react-icons/bs",
      "react-icons/md",
      "react-icons/fi",
      "react-icons/io",
      "react-icons/gi",
    ],
  },
    allowedHosts: ['front.deploy.tz'],
  }
})
