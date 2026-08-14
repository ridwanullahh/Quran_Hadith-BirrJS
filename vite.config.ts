import { defineConfig } from 'vite';
import { birrVitePlugin } from './vite-plugin-birr.js';

export default defineConfig({
  base: './',  // CRITICAL: relative paths for PaaS subdirectory hosting
  plugins: [birrVitePlugin()],
  server: {
    port: 5181,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: ['node:fs/promises', 'node:path', 'node:fs'],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
