/**
 * BirrStack React-like Hooks — flexible and optional.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */
import { type Signal, type Computed } from '../signals/index.js';
export declare function useEffect(fn: () => void | (() => void), deps?: () => unknown[]): () => void;
export declare function useStore<T>(key: string, initial: T): Signal<T>;
export declare function useMemo<T>(fn: () => T): Computed<T>;
export declare function useCallback<T extends (...args: unknown[]) => unknown>(fn: T): T;
export declare function useRef<T>(initial: T): {
    current: T;
};
export declare function useState<T>(initial: T): [Signal<T>, (v: T | ((prev: T) => T)) => void];
export declare function useToggle(initial?: boolean): [Signal<boolean>, () => void, (v: boolean) => void];
export declare function usePrevious<T>(sig: Signal<T>): Signal<T | undefined>;
export declare function useDebounce<T>(sig: Signal<T>, delay?: number): Signal<T>;
//# sourceMappingURL=index.d.ts.map