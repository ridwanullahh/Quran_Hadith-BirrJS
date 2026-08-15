/**
 * BirrStack React-like Hooks — flexible and optional.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */
import { signal, computed, effect } from '../signals/index.js';
export function useEffect(fn, deps) {
    if (deps) {
        let cleanup;
        const depSignal = computed(() => { deps(); return Date.now(); });
        const dispose = effect(() => {
            void depSignal.value;
            if (cleanup)
                cleanup();
            cleanup = fn();
        });
        return () => { dispose(); if (cleanup)
            cleanup(); };
    }
    let cleanup;
    const dispose = effect(() => { cleanup = fn(); });
    return () => { dispose(); if (cleanup)
        cleanup(); };
}
export function useStore(key, initial) {
    const store = signal(initial);
    if (typeof localStorage !== 'undefined') {
        try {
            const saved = localStorage.getItem(key);
            if (saved)
                store.value = JSON.parse(saved);
        }
        catch { }
        effect(() => { try {
            localStorage.setItem(key, JSON.stringify(store.value));
        }
        catch { } });
    }
    return store;
}
export function useMemo(fn) { return computed(fn); }
export function useCallback(fn) { return fn; }
export function useRef(initial) { return { current: initial }; }
export function useState(initial) {
    const s = signal(initial);
    const setter = (v) => {
        if (typeof v === 'function')
            s.value = v(s.value);
        else
            s.value = v;
    };
    return [s, setter];
}
export function useToggle(initial = false) {
    const s = signal(initial);
    return [s, () => { s.value = !s.value; }, (v) => { s.value = v; }];
}
export function usePrevious(sig) {
    let prev;
    const prevSignal = signal(undefined);
    effect(() => { prevSignal.value = prev; prev = sig.value; });
    return prevSignal;
}
export function useDebounce(sig, delay = 300) {
    const debounced = signal(sig.value);
    let timer;
    effect(() => {
        const val = sig.value;
        clearTimeout(timer);
        timer = setTimeout(() => { debounced.value = val; }, delay);
    });
    return debounced;
}
//# sourceMappingURL=index.js.map