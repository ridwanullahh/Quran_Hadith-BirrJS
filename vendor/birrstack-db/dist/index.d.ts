/**
 * BirrDB — the main database entry point.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Usage:
 *   import { BirrDB } from 'birrstack-db';
 *   const db = await BirrDB.open('my-app');
 *   const users = db.collection('users', { columns: [...] });
 *   await users.insert({ name: 'Aisha', role: 'admin' });
 *
 * The DB is embedded — no server required. It runs in:
 *   - Browser (IndexedDB persistence)
 *   - Node.js / Bun / Deno (filesystem persistence)
 *   - Native shells (via the BirrStack native bridge)
 *
 * Realtime subscriptions fire on local writes.
 * Cloud sync is available via the adapter interface.
 */
import { Collection, type Row } from './storage/collection.js';
import { type Query } from './query/engine.js';
import { type Subscription } from './subscription/manager.js';
import { type StorageBackend } from './storage/backend.js';
/** Options for opening a DB. */
export interface BirrDBOptions {
    /** Storage backend. If omitted, picks a default for the environment. */
    backend?: StorageBackend;
    /** Auto-persist to backend on every write (default: false for perf; call flush() explicitly). */
    autoPersist?: boolean;
}
export interface CollectionDef {
    columns: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'json' | 'bytes';
        nullable?: boolean;
    }[];
}
/** A reactive query handle — re-emits results on change. */
export interface LiveQuery<T extends Row = Row> {
    subscribe(fn: (rows: T[]) => void): Subscription;
    /** Get the current results (non-reactive). */
    get(): T[];
}
export declare class BirrDB {
    readonly name: string;
    readonly backend: StorageBackend;
    private collections;
    private subs;
    private autoPersist;
    private constructor();
    /** Open (or create) a database with the given name. */
    static open(name: string, options?: BirrDBOptions): Promise<BirrDB>;
    /** Open an in-memory database (for tests). */
    static openMemory(name?: string): Promise<BirrDB>;
    /** Define or get a collection. */
    collection(name: string, def: CollectionDef): Collection;
    /** Get an existing collection (throws if not defined). */
    getCollection(name: string): Collection;
    /** Drop a collection. */
    dropCollection(name: string): void;
    /** Run a one-shot query against a collection. */
    query<T extends Row = Row>(collectionName: string, q: Query): T[];
    /** Create a live (reactive) query. */
    liveQuery<T extends Row = Row>(collectionName: string, q: Query): LiveQuery<T>;
    /** Persist all dirty collections to the backend. */
    flush(): Promise<void>;
    /** Load all collections from the backend. */
    private load;
    /** Wire collection changes to subscription notifications. */
    private wireSubs;
    /** Get compression stats for all collections (diagnostics). */
    stats(): Record<string, ReturnType<Collection['compressionStats']>>;
}
export { Collection, type Row, type SerializedCollection, __resetIdCounter } from './storage/collection.js';
export { runQuery, type Query, type Predicate } from './query/engine.js';
export { type Subscription } from './subscription/manager.js';
export { serializeColumn, deserializeColumn, encodeDictionary, decodeDictionary, encodeDelta, decodeDelta, encodeRLE, decodeRLE, pickCompression, } from './storage/columnar.js';
export type { ColumnDef, ColumnType, CompressionStrategy } from './storage/columnar.js';
export { MemoryBackend, FilesystemBackend, BrowserBackend, defaultBackend, } from './storage/backend.js';
export type { StorageBackend } from './storage/backend.js';
//# sourceMappingURL=index.d.ts.map