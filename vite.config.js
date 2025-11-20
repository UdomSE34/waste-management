import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/', // 👈 VERY IMPORTANT for cPanel hosting
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:8000/api/',
//         // target:'https://back.deploy.tz/api/',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//         secure: false,
//       },
//     },
//     allowedHosts: ['front.deploy.tz'],
//   }
// })


// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://back.deploy.tz', // 🔥 REMOVE /api from here
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // 🔥 REMOVE rewrite
      },
    },
    allowedHosts: ['front.deploy.tz', 'localhost'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})