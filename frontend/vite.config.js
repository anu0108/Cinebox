import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Any request starting with /api gets forwarded to the backend
      // This means in dev, axios.get('/api/movies') hits localhost:5174/api/movies
      // In production you'd point to your real API URL instead
      '/api': 'http://localhost:5174',
    },
  },
})
