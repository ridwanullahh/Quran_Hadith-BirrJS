/**
 * BirrStack Data Fetching utilities.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides cached, deduplicated, reactive data fetching similar to
 * React Query / SWR but built on signals.
 */
import { signal } from '../signals/index.js';
const cache = new Map();
const inFlight = new Map();
/** Fetch data with caching, deduplication, and reactive signals. */
export function useFetch(url, options = {}) {
    const getUrl = typeof url === 'function' ? url : () => url;
    const ttl = options.ttl ?? 5 * 60 * 1000;
    const enabled = options.enabled ?? true;
    const data = signal(options.initialData);
    const loading = signal(enabled);
    const error = signal(null);
    async function fetchData() {
        const currentUrl = getUrl();
        if (!currentUrl)
            return;
        // Check cache
        const cached = cache.get(currentUrl);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            data.value = cached.data;
            loading.value = false;
            return;
        }
        // Check if already in flight (deduplication)
        if (inFlight.has(currentUrl)) {
            try {
                const result = await inFlight.get(currentUrl);
                data.value = result;
                error.value = null;
            }
            catch (e) {
                error.value = e;
            }
            loading.value = false;
            return;
        }
        loading.value = true;
        const promise = fetch(currentUrl)
            .then(resp => {
            if (!resp.ok)
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            return resp.json();
        })
            .then(result => {
            cache.set(currentUrl, { data: result, timestamp: Date.now(), ttl });
            data.value = result;
            error.value = null;
            return result;
        })
            .catch(e => {
            error.value = e;
            throw e;
        })
            .finally(() => {
            inFlight.delete(currentUrl);
            loading.value = false;
        });
        inFlight.set(currentUrl, promise);
        await promise;
    }
    if (enabled) {
        fetchData();
    }
    // Refetch on focus
    if (options.refetchOnFocus && typeof window !== 'undefined') {
        window.addEventListener('focus', () => fetchData());
    }
    // Refetch on interval
    if (options.refetchInterval && typeof window !== 'undefined') {
        setInterval(fetchData, options.refetchInterval);
    }
    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}
/** Clear the fetch cache. */
export function clearFetchCache() {
    cache.clear();
}
/** Prefetch a URL (caches the result without returning it). */
export async function prefetch(url, options = {}) {
    const ttl = options.ttl ?? 5 * 60 * 1000;
    if (cache.has(url) && Date.now() - cache.get(url).timestamp < ttl)
        return;
    try {
        const resp = await fetch(url);
        if (!resp.ok)
            return;
        const data = await resp.json();
        cache.set(url, { data, timestamp: Date.now(), ttl });
    }
    catch {
        // ignore
    }
}
//# sourceMappingURL=index.js.map