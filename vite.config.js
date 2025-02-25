import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://backend-video-1.onrender.com", // Backend server
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
})
