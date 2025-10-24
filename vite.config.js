import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: '/', // 👈 VERY IMPORTANT for cPanel hosting
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    }
=======
  server:{
    allowedhosts:['front.deploy.tz']
>>>>>>> eee38ecda169fb424347042dab3ea1f1f4ff8a6a
  }
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://127.0.0.1:8000/api/',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //       secure: false,
  //     },
  //   }
  // }
})
