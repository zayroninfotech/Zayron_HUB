import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    // Build output goes into Django's static/dist/ — served at /static/dist/
    outDir: 'static/dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Predictable filenames so Django template can reference them
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'assets/index.css'
          return 'assets/[name][extname]'
        },
      },
    },
  },
  // Dev server proxies API calls to Django
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/media': { target: 'http://localhost:8000', changeOrigin: true },
      '/static': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
