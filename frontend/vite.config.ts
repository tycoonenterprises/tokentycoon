import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/EthereumCardGame/' : '/',
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
