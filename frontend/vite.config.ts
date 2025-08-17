import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include specific polyfills
      include: ['buffer', 'process', 'util', 'stream', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  base: process.env.GITHUB_ACTIONS ? '/tokentycoon/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/stores': resolve(__dirname, './src/stores'),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    sourcemap: true, // Enable sourcemaps for production
  },
  optimizeDeps: {
    include: ['@privy-io/react-auth', 'wagmi', 'viem'],
  },
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from the parent directory (for design folder)
      allow: ['..']
    }
  }
})
