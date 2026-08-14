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
/** A node in the reactive dependency graph. */
interface ReactiveNode {
    /** Called when a dependency of this node changes. */
    markDirty(): void;
}
/**
 * A signal: a reactive cell holding a value.
 *
 * @public
 */
export declare class Signal<T> {
    private _value;
    /** Computations that depend on this signal. */
    private readonly dependents;
    constructor(value: T);
    /** Read the current value, registering the active observer as a dependent. */
    get value(): T;
    /** Write a new value, notifying dependents (batched). */
    set value(next: T);
    /** Update the value via a function. */
    update(fn: (prev: T) => T): void;
    /** Peek at the value without registering a dependency. */
    peek(): T;
    private notify;
}
/**
 * Create a signal.
 * @public
 */
export declare function signal<T>(value: T): Signal<T>;
/**
 * A computed value: re-evaluated lazily when dependencies change.
 *
 * @public
 */
export declare class Computed<T> implements ReactiveNode {
    private _value;
    private _dirty;
    private readonly fn;
    private readonly dependents;
    constructor(fn: () => T);
    markDirty(): void;
    get value(): T;
    private recompute;
}
/**
 * Create a computed value.
 * @public
 */
export declare function computed<T>(fn: () => T): Computed<T>;
/**
 * An effect: runs eagerly, re-runs when dependencies change.
 *
 * @public
 */
export declare class Effect implements ReactiveNode {
    private _disposed;
    private readonly fn;
    private cleanup;
    constructor(fn: () => void | (() => void));
    markDirty(): void;
    run(): void;
    /** Stop the effect from re-running and clean up resources. */
    dispose(): void;
}
/**
 * Create an effect. Returns a dispose function.
 * @public
 */
export declare function effect(fn: () => void | (() => void)): () => void;
/**
 * Batch multiple signal writes into a single notification pass.
 * @public
 */
export declare function batch<T>(fn: () => T): T;
/**
 * Run a function without tracking dependencies.
 * @public
 */
export declare function untracked<T>(fn: () => T): T;
/** Test-only: clear all reactive state. */
export declare function __resetReactivity(): void;
/**
 * A read-only view of a signal. Cannot be written to.
 * @public
 */
export type ReadonlySignal<T> = {
    readonly value: T;
};
/**
 * Helper to check if a value is a Signal.
 * @public
 */
export declare function isSignal(v: unknown): v is Signal<unknown>;
/**
 * Helper to check if a value is a Computed.
 * @public
 */
export declare function isComputed(v: unknown): v is Computed<unknown>;
/**
 * Helper to check if a value is a reactive cell (Signal or Computed).
 * @public
 */
export declare function isReactive(v: unknown): v is Signal<unknown> | Computed<unknown>;
export {};
//# sourceMappingURL=index.d.ts.map