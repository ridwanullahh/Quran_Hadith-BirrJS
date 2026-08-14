/**
 * BirrStack Component runtime.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A BirrStack component is a plain object with a `setup()` function that returns
 * reactive state and methods, and a `render()` function that produces DOM.
 * The `.birr` compiler generates the render function from the template.
 */
import { effect } from '../signals/index.js';
/**
 * Mount a component definition into a host element.
 *
 * @public
 */
export function mount(definition, host, props = {}, slots = {}) {
    const unmountCallbacks = [];
    let unmounted = false;
    const ctx = {
        host,
        props,
        slots,
        onUnmount(fn) {
            unmountCallbacks.push(fn);
        },
        emit(event, ...args) {
            const handler = props[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`];
            if (typeof handler === 'function') {
                handler(...args);
            }
        },
    };
    // Validate props
    if (definition.props) {
        for (const [key, spec] of Object.entries(definition.props)) {
            if (!(key in props)) {
                if (spec.required) {
                    throw new Error(`BirrStack: missing required prop "${key}" on component "${definition.name ?? '<anonymous>'}"`);
                }
                if (spec.default !== undefined) {
                    props[key] = typeof spec.default === 'function' ? spec.default() : spec.default;
                }
            }
        }
    }
    const state = definition.setup(ctx);
    const root = definition.render(state, ctx);
    // Mount into host
    host.appendChild(root);
    return {
        root,
        unmount() {
            if (unmounted)
                return;
            unmounted = true;
            for (const cb of unmountCallbacks) {
                try {
                    cb();
                }
                catch (err) {
                    console.error('BirrStack: error during unmount callback', err);
                }
            }
            if (root.parentNode === host) {
                host.removeChild(root);
            }
        },
    };
}
/**
 * Define a component with full type inference.
 *
 * @public
 */
export function defineComponent(def) {
    return def;
}
/**
 * Watch a reactive source and run a callback when it changes.
 * Returns an unwatch function.
 *
 * @public
 */
export function watch(source, callback) {
    let oldValue = undefined;
    const dispose = effect(() => {
        const value = source();
        if (!Object.is(value, oldValue)) {
            callback(value, oldValue);
            oldValue = value;
        }
    });
    return dispose;
}
/**
 * onMount: run a callback once after the component is mounted.
 * Must be called within setup().
 *
 * @public
 */
export function onMount(ctx, fn) {
    // Defer to next microtask so mount is complete
    queueMicrotask(() => {
        if (ctx.host.isConnected) {
            const cleanup = fn();
            if (typeof cleanup === 'function') {
                ctx.onUnmount(cleanup);
            }
        }
    });
}
/**
 * onUnmount: register a cleanup callback. Must be called within setup().
 *
 * @public
 */
export function onUnmount(ctx, fn) {
    ctx.onUnmount(fn);
}
//# sourceMappingURL=index.js.map