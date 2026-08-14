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
import { runQuery } from '../query/engine.js';
/** A subscription manager for one collection. */
export class SubscriptionManager {
    listeners = new Map();
    nextId = 1;
    currentRows = [];
    /** Set the current rows (called by the collection on change). */
    setRows(rows) {
        this.currentRows = rows;
        this.notifyAll();
    }
    /** Subscribe to a query. Returns a subscription handle. */
    subscribe(query, fn) {
        const id = this.nextId++;
        this.listeners.set(id, { query, fn });
        // Emit immediately
        fn(runQuery(this.currentRows, query));
        return {
            unsubscribe: () => {
                this.listeners.delete(id);
            },
        };
    }
    /** Notify all listeners with their query results. */
    notifyAll() {
        for (const { query, fn } of this.listeners.values()) {
            try {
                fn(runQuery(this.currentRows, query));
            }
            catch (err) {
                console.error('BirrDB subscription error:', err);
            }
        }
    }
}
//# sourceMappingURL=manager.js.map