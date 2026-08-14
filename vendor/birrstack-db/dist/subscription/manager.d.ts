/**
 * BirrDB Subscriptions — realtime pub/sub for query results.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A subscription runs a query and re-emits results whenever the collection
 * changes (insert/update/delete). Subscribers receive the full matching row
 * set on each change (simple, predictable).
 *
 * For sync to remote/cloud DBs, see the adapter interface.
 */
import type { Row } from '../storage/collection.js';
import type { Query } from '../query/engine.js';
/** A subscription on a query. */
export interface Subscription {
    /** Stop receiving updates. */
    unsubscribe(): void;
}
type Listener = (rows: Row[]) => void;
/** A subscription manager for one collection. */
export declare class SubscriptionManager {
    private listeners;
    private nextId;
    private currentRows;
    /** Set the current rows (called by the collection on change). */
    setRows(rows: Row[]): void;
    /** Subscribe to a query. Returns a subscription handle. */
    subscribe(query: Query, fn: Listener): Subscription;
    /** Notify all listeners with their query results. */
    private notifyAll;
}
export {};
//# sourceMappingURL=manager.d.ts.map