import { defineConfig } from 'vite';
import { birrVitePlugin } from './vite-plugin-birr.js';

export default defineConfig({
  plugins: [birrVitePlugin()],
  server: { port: 5181, host: true },
  build: {
    outDir: 'dist',
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
