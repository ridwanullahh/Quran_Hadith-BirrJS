/**
 * BirrStack SSR — Server-Side Rendering support.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides renderToString() for server-side rendering of BirrStack components.
 * The output HTML can be hydrated by the client runtime.
 */
import type { ComponentDefinition, BirrProps, Slot } from '../component/index.js';
/** Render a component to an HTML string (server-side). */
export declare function renderToString(component: ComponentDefinition, props?: BirrProps, slots?: Record<string, Slot>): string;
/** SSR context for tracking hydration data. */
export interface SSRContext {
    html: string;
    data: Record<string, unknown>;
}
/** Render an app to a full HTML document (for SSR). */
export declare function renderToDocument(component: ComponentDefinition, options?: {
    title?: string;
    head?: string;
}): string;
//# sourceMappingURL=index.d.ts.map