/**
 * BirrStack Signals — fine-grained reactivity runtime.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Design:
 *  - Signals hold a value and track dependent computations.
 *  - Computations are re-evaluated lazily when a dependent signal changes.
 *  - Effects run eagerly and re-run when their dependencies change.
 *  - Batching collapses multiple signal writes into a single notification pass.
 *
 * Target: < 3KB minified+gzipped for this module.
 */
let activeObserver = null;
const observerStack = [];
let batchDepth = 0;
const pendingEffects = new Set();
function pushObserver(obs) {
    observerStack.push(activeObserver);
    activeObserver = obs;
}
function popObserver() {
    activeObserver = observerStack.pop() ?? null;
}
/**
 * A signal: a reactive cell holding a value.
 *
 * @public
 */
export class Signal {
    _value;
    /** Computations that depend on this signal. */
    dependents = new Set();
    constructor(value) {
        this._value = value;
    }
    /** Read the current value, registering the active observer as a dependent. */
    get value() {
        if (activeObserver !== null) {
            this.dependents.add(activeObserver);
        }
        return this._value;
    }
    /** Write a new value, notifying dependents (batched). */
    set value(next) {
        if (Object.is(next, this._value))
            return;
        this._value = next;
        this.notify();
    }
    /** Update the value via a function. */
    update(fn) {
        this.value = fn(this._value);
    }
    /** Peek at the value without registering a dependency. */
    peek() {
        return this._value;
    }
    notify() {
        if (batchDepth > 0) {
            for (const dep of this.dependents) {
                if (dep instanceof Effect) {
                    pendingEffects.add(dep);
                }
                else {
                    dep.markDirty();
                }
            }
        }
        else {
            // Snapshot to avoid mutation during iteration
            const snapshot = Array.from(this.dependents);
            for (const dep of snapshot) {
                dep.markDirty();
            }
        }
    }
}
/**
 * Create a signal.
 * @public
 */
export function signal(value) {
    return new Signal(value);
}
/**
 * A computed value: re-evaluated lazily when dependencies change.
 *
 * @public
 */
export class Computed {
    _value = undefined;
    _dirty = true;
    fn;
    dependents = new Set();
    constructor(fn) {
        this.fn = fn;
    }
    markDirty() {
        if (!this._dirty) {
            this._dirty = true;
            for (const dep of this.dependents) {
                dep.markDirty();
            }
        }
    }
    get value() {
        if (this._dirty) {
            this.recompute();
        }
        if (activeObserver !== null) {
            this.dependents.add(activeObserver);
        }
        return this._value;
    }
    recompute() {
        pushObserver(this);
        try {
            this._value = this.fn();
        }
        finally {
            popObserver();
        }
        this._dirty = false;
    }
}
/**
 * Create a computed value.
 * @public
 */
export function computed(fn) {
    return new Computed(fn);
}
/**
 * An effect: runs eagerly, re-runs when dependencies change.
 *
 * @public
 */
export class Effect {
    _disposed = false;
    fn;
    cleanup = undefined;
    constructor(fn) {
        this.fn = fn;
        this.run();
    }
    markDirty() {
        if (this._disposed)
            return;
        if (batchDepth > 0) {
            pendingEffects.add(this);
        }
        else {
            this.run();
        }
    }
    run() {
        if (this._disposed)
            return;
        if (typeof this.cleanup === 'function') {
            this.cleanup();
        }
        pushObserver(this);
        try {
            this.cleanup = this.fn();
        }
        finally {
            popObserver();
        }
    }
    /** Stop the effect from re-running and clean up resources. */
    dispose() {
        this._disposed = true;
        if (typeof this.cleanup === 'function') {
            this.cleanup();
            this.cleanup = undefined;
        }
    }
}
/**
 * Create an effect. Returns a dispose function.
 * @public
 */
export function effect(fn) {
    const e = new Effect(fn);
    return () => e.dispose();
}
/**
 * Batch multiple signal writes into a single notification pass.
 * @public
 */
export function batch(fn) {
    batchDepth++;
    let result;
    try {
        result = fn();
    }
    finally {
        batchDepth--;
        if (batchDepth === 0) {
            const effects = Array.from(pendingEffects);
            pendingEffects.clear();
            for (const e of effects) {
                e.run();
            }
        }
    }
    return result;
}
/**
 * Run a function without tracking dependencies.
 * @public
 */
export function untracked(fn) {
    pushObserver(null);
    try {
        return fn();
    }
    finally {
        popObserver();
    }
}
/** Test-only: clear all reactive state. */
export function __resetReactivity() {
    activeObserver = null;
    observerStack.length = 0;
    batchDepth = 0;
    pendingEffects.clear();
}
/**
 * Helper to check if a value is a Signal.
 * @public
 */
export function isSignal(v) {
    return v instanceof Signal;
}
/**
 * Helper to check if a value is a Computed.
 * @public
 */
export function isComputed(v) {
    return v instanceof Computed;
}
/**
 * Helper to check if a value is a reactive cell (Signal or Computed).
 * @public
 */
export function isReactive(v) {
    return v instanceof Signal || v instanceof Computed;
}
//# sourceMappingURL=index.js.map