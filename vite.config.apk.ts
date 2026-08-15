import { defineConfig } from 'vite';
import { birrVitePlugin } from './vite-plugin-birr.js';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [birrVitePlugin(), viteSingleFile()],
  build: {
    outDir: 'dist-apk',
    chunkSizeWarningLimit: 50000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
