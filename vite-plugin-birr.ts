import type { Plugin } from 'vite';
import { compile } from 'birrstack-compiler';

export function birrVitePlugin(): Plugin {
  const cssMap = new Map<string, string>();

  return {
    name: 'birrstack',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.birr')) return null;
      const result = compile(code, { coreImport: 'birrstack-core' });
      if (result.css) cssMap.set(id, result.css);
      return { code: result.code, map: null };
    },
    generateBundle() {
      let allCss = '';
      for (const [, css] of cssMap) allCss += css + '\n';
      if (allCss) {
        this.emitFile({ type: 'asset', fileName: 'assets/birrstack-styles.css', source: allCss });
      }
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.birr')) return;
      ctx.server.ws.send({ type: 'custom', event: 'birrstack:hmr', data: { file: ctx.file } });
    },
  };
}
