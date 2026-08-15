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
import { signal, effect } from '../signals/index.js';
/** Compile a path pattern into a regex. */
function compilePath(path) {
    const paramNames = [];
    let pattern = path
        .replace(/\/+$/, '') // trailing slash
        .replace(/\//g, '\\/');
    pattern = pattern.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });
    return {
        regex: new RegExp(`^${pattern}$`),
        paramNames,
    };
}
function compileRoutes(routes, parentPath = '') {
    const compiled = [];
    for (const route of routes) {
        const fullPath = (parentPath + route.path).replace(/\/+/g, '/');
        const { regex, paramNames } = compilePath(fullPath);
        compiled.push({ definition: { ...route, path: fullPath }, regex, paramNames });
        if (route.children) {
            compiled.push(...compileRoutes(route.children, fullPath));
        }
    }
    return compiled;
}
function parseQuery(search) {
    const query = {};
    if (!search)
        return query;
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    for (const [key, value] of params.entries()) {
        query[key] = value;
    }
    return query;
}
/** A reactive router. */
export class Router {
    compiled;
    mode;
    base;
    beforeEachGuards = [];
    /** The current route (reactive). */
    current;
    setCurrent;
    // Internal navigation stack for proper back/forward within the app
    navStack = [];
    navIndex = -1;
    constructor(options) {
        this.mode = options.mode ?? 'history';
        this.base = options.base ?? '';
        this.compiled = compileRoutes(options.routes);
        const initial = signal(null);
        this.setCurrent = (loc) => { initial.value = loc; };
        this.current = initial;
        // Wire up browser events
        if (typeof window !== 'undefined') {
            if (this.mode === 'history') {
                window.addEventListener('popstate', () => this.handleLocationChange());
                // SPA fallback for static hosts: if the page was redirected from 404.html,
                // restore the original path from the query string.
                // The 404.html redirect format is: /?/original/path
                // Also handles subdirectory hosting: /repo-name/?/original/path
                const search = window.location.search;
                if (search.startsWith('?/') || search.startsWith('?&')) {
                    let path = search.slice(2).split('&')[0] || '/';
                    // If the path doesn't start with /, add it
                    if (!path.startsWith('/'))
                        path = '/' + path;
                    // Clean the URL to the original path (preserving any subdirectory base)
                    const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
                    window.history.replaceState({}, '', basePath + path);
                }
            }
            else {
                window.addEventListener('hashchange', () => this.handleLocationChange());
            }
            // Handle direct URL access (SPA fallback)
            // On initial load, resolve the current URL
            this.handleLocationChange();
            // For history mode, intercept link clicks to prevent full page reloads
            if (this.mode === 'history') {
                document.addEventListener('click', (e) => {
                    const target = e.target;
                    const link = target.closest('a');
                    if (!link)
                        return;
                    const href = link.getAttribute('href');
                    if (!href || href.startsWith('http') || href.startsWith('#') || link.target === '_blank')
                        return;
                    // Only intercept internal links
                    if (href.startsWith('/') || href.startsWith('./')) {
                        e.preventDefault();
                        this.push(href);
                    }
                });
            }
        }
    }
    getFullPath() {
        if (this.mode === 'hash') {
            const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
            return hash || '/';
        }
        if (typeof window === 'undefined')
            return '/';
        // For history mode, detect the base subdirectory if not explicitly set.
        // When deployed to /repo-name/, the pathname includes the repo name.
        // We strip the base (if set) or auto-detect it from the first path segment.
        let path = window.location.pathname;
        if (this.base && path.startsWith(this.base)) {
            path = path.slice(this.base.length);
        }
        else if (!this.base) {
            // Auto-detect: check if the first path segment looks like a subdirectory
            // (not a known route prefix). This handles GitHub Pages /repo-name/ hosting.
            // The SPA fallback in the 404.html already strips the subdirectory,
            // so if we're here without a ?/ redirect, the path should be clean.
        }
        const search = window.location.search;
        return (path || '/') + search;
    }
    async handleLocationChange() {
        const fullPath = this.getFullPath();
        const [pathPart, queryPart = '', hashPart = ''] = fullPath.split(/(?=\?)|(?=#)/).filter(Boolean);
        const path = pathPart || '/';
        const query = parseQuery(queryPart);
        const hash = hashPart.startsWith('#') ? hashPart.slice(1) : '';
        // Match
        let matched;
        let params = {};
        for (const route of this.compiled) {
            const m = route.regex.exec(path);
            if (m) {
                matched = route;
                route.paramNames.forEach((name, i) => {
                    params[name] = decodeURIComponent(m[i + 1]);
                });
                break;
            }
        }
        if (!matched) {
            // Emit a not-found location instead of null (prevents apps from hanging)
            const notFoundLocation = {
                fullPath,
                path,
                params: {},
                query,
                hash,
                matched: { path: '*', name: 'not-found' },
                name: 'not-found',
                meta: {},
            };
            this.setCurrent(notFoundLocation);
            return;
        }
        const location = {
            fullPath,
            path,
            params,
            query,
            hash,
            matched: matched.definition,
            name: matched.definition.name,
            meta: matched.definition.meta ?? {},
        };
        const from = this.current.value;
        // Run beforeEach guards
        for (const guard of this.beforeEachGuards) {
            const result = await guard(location, from);
            if (result === false)
                return;
            if (typeof result === 'string') {
                this.push(result);
                return;
            }
        }
        // Run route-specific guard
        if (matched.definition.beforeEnter) {
            const result = await matched.definition.beforeEnter(location, from);
            if (result === false)
                return;
            if (typeof result === 'string') {
                this.push(result);
                return;
            }
        }
        this.setCurrent(location);
        // Scroll behavior
        if (typeof window !== 'undefined') {
            if (hash) {
                const el = document.getElementById(hash);
                if (el) {
                    el.scrollIntoView();
                    return;
                }
            }
            if (options_scrollBehavior(this) === 'top') {
                window.scrollTo(0, 0);
            }
        }
    }
    /** Programmatic navigation. */
    push(path) {
        // Track navigation in internal stack
        if (this.navIndex < this.navStack.length - 1) {
            // We're in the middle of the stack, truncate forward history
            this.navStack = this.navStack.slice(0, this.navIndex + 1);
        }
        this.navStack.push(path);
        this.navIndex = this.navStack.length - 1;
        if (this.mode === 'history') {
            window.history.pushState({ birrPath: path }, '', this.base + path);
            this.handleLocationChange();
        }
        else {
            window.location.hash = path;
        }
    }
    /** Replace current entry. */
    replace(path) {
        if (this.navStack.length > 0) {
            this.navStack[this.navIndex] = path;
        }
        else {
            this.navStack.push(path);
            this.navIndex = 0;
        }
        if (this.mode === 'history') {
            window.history.replaceState({ birrPath: path }, '', this.base + path);
            this.handleLocationChange();
        }
        else {
            window.location.replace(`#${path}`);
        }
    }
    /** Go back within the app's navigation stack. */
    back() {
        if (this.navIndex > 0) {
            this.navIndex--;
            const path = this.navStack[this.navIndex];
            if (this.mode === 'history') {
                window.history.pushState({ birrPath: path }, '', this.base + path);
                this.handleLocationChange();
            }
            else {
                window.location.hash = path;
            }
        }
        else {
            // No more app history — go to browser's previous page
            window.history.back();
        }
    }
    /** Go forward within the app's navigation stack. */
    forward() {
        if (this.navIndex < this.navStack.length - 1) {
            this.navIndex++;
            const path = this.navStack[this.navIndex];
            if (this.mode === 'history') {
                window.history.pushState({ birrPath: path }, '', this.base + path);
                this.handleLocationChange();
            }
            else {
                window.location.hash = path;
            }
        }
        else {
            window.history.forward();
        }
    }
    /** Check if there's a previous page in the app's navigation stack. */
    canGoBack() {
        return this.navIndex > 0;
    }
    /** Register a global navigation guard. */
    beforeEach(guard) {
        this.beforeEachGuards.push(guard);
    }
    /** Subscribe to route changes. Returns an unsubscribe function. */
    subscribe(callback) {
        return effect(() => callback(this.current.value));
    }
}
// Helper to read scrollBehavior without storing it on the instance (kept simple for now)
const scrollBehaviorMap = new WeakMap();
function options_scrollBehavior(router) {
    return scrollBehaviorMap.get(router) ?? 'top';
}
/** Create a router. @public */
export function createRouter(options) {
    const router = new Router(options);
    if (options.scrollBehavior) {
        scrollBehaviorMap.set(router, options.scrollBehavior);
    }
    return router;
}
/** Link component helper: render an <a> that uses the router. */
export function linkProps(to) {
    return {
        href: to,
        'data-birr-link': '',
        onclick: (e) => {
            e.preventDefault();
            // Router instance is read from a global registry — the app sets it on init
            const router = window.__birrRouter;
            if (router) {
                router.push(to);
            }
        },
    };
}
/** Register the router globally so links can find it. */
export function registerRouter(router) {
    if (typeof window !== 'undefined') {
        window.__birrRouter = router;
    }
}
//# sourceMappingURL=index.js.map