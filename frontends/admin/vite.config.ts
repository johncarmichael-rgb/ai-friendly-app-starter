import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [react()],
  base: env.VITE_BASE_PATH || '/admin/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3003,
    host: true,
  },
  build: {
    // Fast builds for development watch mode
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        // In development: allow lazy-loaded routes to split, but keep vendor code together
        manualChunks: process.env.NODE_ENV === 'production' ? undefined : (id) => {
          // Let lazy-loaded pages split naturally
          if (id.includes('/pages/')) {
            return undefined;
          }
          // Bundle everything else together
          return 'vendor';
        },
      },
    },
  },
  };
});
