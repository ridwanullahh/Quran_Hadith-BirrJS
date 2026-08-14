import { defineConfig } from 'vite';
import { birrVitePlugin } from './vite-plugin-birr.js';

export default defineConfig({
  plugins: [birrVitePlugin()],
  server: { port: 5181, host: true },
  build: { outDir: 'dist' },
});
