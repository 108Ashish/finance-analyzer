import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests during development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Properly configure external dependencies
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          clerk: ['@clerk/clerk-react']
        }
      }
    },
    // Make sure sources are included in the source maps
    sourcemap: true,
    // Add this line for better compatibility
    commonjsOptions: { include: [/node_modules/] },
    outDir: 'dist'
  },
  // Add environment variables for Clerk
  define: {
    'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.PUBLISHABLE_KEY)
  }
});