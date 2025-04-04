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
}) 