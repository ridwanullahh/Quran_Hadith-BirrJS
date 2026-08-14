/**
 * BirrStack Router — lightweight client-side hash + history router.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Features:
 *  - Named params: /users/:id
 *  - Query string parsing
 *  - Nested routes
 *  - Navigation guards (beforeEach, afterEach)
 *  - Programmatic navigation: router.push, router.replace, router.back
 *  - SPA mode by default (history API); hash mode opt-in
 */
import { type ReadonlySignal } from '../signals/index.js';
/** A parsed route definition. */
export interface RouteDefinition {
    /** Path pattern, e.g. /users/:id. */
    path: string;
    /** Component to render. */
    component?: () => Promise<{
        default: unknown;
    }> | {
        default: unknown;
    };
    /** Nested child routes. */
    children?: RouteDefinition[];
    /** Route name for programmatic navigation. */
    name?: string;
    /** Per-route guard. */
    beforeEnter?: (to: RouteLocation, from: RouteLocation | null) => boolean | string | Promise<boolean | string>;
    /** Route metadata (auth required, etc). */
    meta?: Record<string, unknown>;
}
/** A resolved route location. */
export interface RouteLocation {
    /** Full path including query. */
    fullPath: string;
    /** Path without query. */
    path: string;
    /** Path segments (params). */
    params: Record<string, string>;
    /** Parsed query string. */
    query: Record<string, string>;
    /** Hash fragment. */
    hash: string;
    /** Matched route definition. */
    matched: RouteDefinition;
    /** Route name. */
    name?: string;
    /** Route metadata. */
    meta: Record<string, unknown>;
}
export type RouterMode = 'history' | 'hash';
export interface RouterOptions {
    mode?: RouterMode;
    routes: RouteDefinition[];
    base?: string;
    scrollBehavior?: 'top' | 'preserve';
}
/** A reactive router. */
export declare class Router {
    private readonly compiled;
    private readonly mode;
    private readonly base;
    private readonly beforeEachGuards;
    /** The current route (reactive). */
    readonly current: ReadonlySignal<RouteLocation | null>;
    private setCurrent;
    constructor(options: RouterOptions);
    private getFullPath;
    private handleLocationChange;
    /** Programmatic navigation. */
    push(path: string): void;
    /** Replace current entry. */
    replace(path: string): void;
    /** Go back in history. */
    back(): void;
    /** Go forward in history. */
    forward(): void;
    /** Register a global navigation guard. */
    beforeEach(guard: (to: RouteLocation, from: RouteLocation | null) => boolean | string | Promise<boolean | string>): void;
    /** Subscribe to route changes. Returns an unsubscribe function. */
    subscribe(callback: (to: RouteLocation | null) => void): () => void;
}
/** Create a router. @public */
export declare function createRouter(options: RouterOptions): Router;
/** Link component helper: render an <a> that uses the router. */
export declare function linkProps(to: string): Record<string, string>;
/** Register the router globally so links can find it. */
export declare function registerRouter(router: Router): void;
//# sourceMappingURL=index.d.ts.map