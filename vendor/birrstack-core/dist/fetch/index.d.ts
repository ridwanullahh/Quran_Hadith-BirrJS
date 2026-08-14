/**
 * BirrStack Data Fetching utilities.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides cached, deduplicated, reactive data fetching similar to
 * React Query / SWR but built on signals.
 */
import { type Signal } from '../signals/index.js';
export interface FetchOptions<T> {
    /** Cache key (default: URL). */
    key?: string;
    /** Time-to-live in ms (default: 5 minutes). */
    ttl?: number;
    /** Refetch on window focus. */
    refetchOnFocus?: boolean;
    /** Refetch interval in ms. */
    refetchInterval?: number;
    /** Initial data before first fetch. */
    initialData?: T;
    /** Enabled (default: true). Set to false to skip fetching. */
    enabled?: boolean;
}
export interface FetchResult<T> {
    data: Signal<T | undefined>;
    loading: Signal<boolean>;
    error: Signal<Error | null>;
    refetch: () => Promise<void>;
}
/** Fetch data with caching, deduplication, and reactive signals. */
export declare function useFetch<T = unknown>(url: string | (() => string), options?: FetchOptions<T>): FetchResult<T>;
/** Clear the fetch cache. */
export declare function clearFetchCache(): void;
/** Prefetch a URL (caches the result without returning it). */
export declare function prefetch(url: string, options?: FetchOptions<unknown>): Promise<void>;
//# sourceMappingURL=index.d.ts.map