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
            }
            else {
                window.addEventListener('hashchange', () => this.handleLocationChange());
            }
            // Initial resolve
            this.handleLocationChange();
        }
    }
    getFullPath() {
        if (this.mode === 'hash') {
            const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
            return hash || '/';
        }
        if (typeof window === 'undefined')
            return '/';
        const path = window.location.pathname.slice(this.base.length);
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
            this.setCurrent(null);
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
        if (this.mode === 'history') {
            window.history.pushState({}, '', this.base + path);
            this.handleLocationChange();
        }
        else {
            window.location.hash = path;
        }
    }
    /** Replace current entry. */
    replace(path) {
        if (this.mode === 'history') {
            window.history.replaceState({}, '', this.base + path);
            this.handleLocationChange();
        }
        else {
            window.location.replace(`#${path}`);
        }
    }
    /** Go back in history. */
    back() {
        window.history.back();
    }
    /** Go forward in history. */
    forward() {
        window.history.forward();
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