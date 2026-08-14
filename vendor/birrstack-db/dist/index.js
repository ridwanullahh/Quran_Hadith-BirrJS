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
import { Collection } from './storage/collection.js';
import { runQuery } from './query/engine.js';
import { SubscriptionManager } from './subscription/manager.js';
import { MemoryBackend, defaultBackend } from './storage/backend.js';
export class BirrDB {
    name;
    backend;
    collections = new Map();
    subs = new Map();
    autoPersist;
    constructor(name, backend, autoPersist) {
        this.name = name;
        this.backend = backend;
        this.autoPersist = autoPersist;
    }
    /** Open (or create) a database with the given name. */
    static async open(name, options = {}) {
        const backend = options.backend ?? defaultBackend(name);
        const db = new BirrDB(name, backend, options.autoPersist ?? false);
        await db.load();
        return db;
    }
    /** Open an in-memory database (for tests). */
    static async openMemory(name = 'test') {
        return new BirrDB(name, new MemoryBackend(), false);
    }
    /** Define or get a collection. */
    collection(name, def) {
        let col = this.collections.get(name);
        if (col) {
            return col;
        }
        col = new Collection({ name, columns: def.columns });
        this.collections.set(name, col);
        this.subs.set(name, new SubscriptionManager());
        this.wireSubs(name);
        return col;
    }
    /** Get an existing collection (throws if not defined). */
    getCollection(name) {
        const col = this.collections.get(name);
        if (!col)
            throw new Error(`BirrDB: collection "${name}" not defined`);
        return col;
    }
    /** Drop a collection. */
    dropCollection(name) {
        this.collections.delete(name);
        this.subs.delete(name);
    }
    /** Run a one-shot query against a collection. */
    query(collectionName, q) {
        const col = this.getCollection(collectionName);
        return runQuery(col.all(), q);
    }
    /** Create a live (reactive) query. */
    liveQuery(collectionName, q) {
        const col = this.getCollection(collectionName);
        const subMgr = this.subs.get(collectionName);
        return {
            subscribe(fn) {
                return subMgr.subscribe(q, fn);
            },
            get() {
                return runQuery(col.all(), q);
            },
        };
    }
    /** Persist all dirty collections to the backend. */
    async flush() {
        for (const [name, col] of this.collections) {
            if (!col.dirty)
                continue;
            const serialized = col.serialize();
            const json = JSON.stringify(serialized);
            await this.backend.write(`collections/${name}.json`, new TextEncoder().encode(json));
            col.dirty = false;
        }
    }
    /** Load all collections from the backend. */
    async load() {
        const keys = await this.backend.list('collections/');
        for (const key of keys) {
            const data = await this.backend.read(key);
            if (!data)
                continue;
            const json = new TextDecoder().decode(data);
            const serialized = JSON.parse(json);
            const col = Collection.deserialize(serialized);
            this.collections.set(col.name, col);
            this.subs.set(col.name, new SubscriptionManager());
            this.wireSubs(col.name);
        }
    }
    /** Wire collection changes to subscription notifications. */
    wireSubs(name) {
        const col = this.collections.get(name);
        const subMgr = this.subs.get(name);
        const originalInsert = col.insert.bind(col);
        const originalUpdate = col.update.bind(col);
        const originalDelete = col.delete.bind(col);
        col.insert = (row) => {
            const id = originalInsert(row);
            subMgr.setRows(col.all());
            if (this.autoPersist)
                void this.flush();
            return id;
        };
        col.update = (id, patch) => {
            const ok = originalUpdate(id, patch);
            if (ok) {
                subMgr.setRows(col.all());
                if (this.autoPersist)
                    void this.flush();
            }
            return ok;
        };
        col.delete = (id) => {
            const ok = originalDelete(id);
            if (ok) {
                subMgr.setRows(col.all());
                if (this.autoPersist)
                    void this.flush();
            }
            return ok;
        };
    }
    /** Get compression stats for all collections (diagnostics). */
    stats() {
        const out = {};
        for (const [name, col] of this.collections) {
            out[name] = col.compressionStats();
        }
        return out;
    }
}
// Re-exports
export { Collection, __resetIdCounter } from './storage/collection.js';
export { runQuery } from './query/engine.js';
export { serializeColumn, deserializeColumn, encodeDictionary, decodeDictionary, encodeDelta, decodeDelta, encodeRLE, decodeRLE, pickCompression, } from './storage/columnar.js';
export { MemoryBackend, FilesystemBackend, BrowserBackend, defaultBackend, } from './storage/backend.js';
//# sourceMappingURL=index.js.map