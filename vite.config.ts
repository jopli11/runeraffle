import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: true,
  },
  preview: {
    port: parseInt(process.env.PORT || '5173'),
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Ensure consistent file names for easier referencing
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Prevent minification in development for easier debugging
    minify: process.env.NODE_ENV === 'production',
    // Generate sourcemaps in development
    sourcemap: process.env.NODE_ENV !== 'production',
  },
}) 