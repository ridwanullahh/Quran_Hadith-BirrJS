/**
 * BirrDB Persistence — pluggable storage backends.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Backends:
 *  - MemoryBackend: in-memory (default, for tests and ephemeral data)
 *  - FilesystemBackend: Node.js fs (for native/server) — lazily loaded
 *  - BrowserBackend: IndexedDB (for web apps)
 *
 * All backends implement the same StorageBackend interface.
 */
/** In-memory backend (default). */
export class MemoryBackend {
    store = new Map();
    async read(key) {
        return this.store.get(key) ?? null;
    }
    async write(key, data) {
        this.store.set(key, data);
    }
    async list(prefix) {
        const out = [];
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix))
                out.push(key);
        }
        return out;
    }
    async remove(key) {
        this.store.delete(key);
    }
}
/**
 * Node.js filesystem backend.
 * Uses dynamic require() to avoid bundling node:* in browser builds.
 * Only works in Node.js environments.
 */
export class FilesystemBackend {
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    isNode() {
        return typeof process !== 'undefined' && process.versions?.node !== undefined;
    }
    async nodeFs() {
        if (!this.isNode())
            throw new Error('FilesystemBackend requires Node.js');
        // Use createRequire to avoid Vite/Rollup from detecting node:* imports
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        return {
            fs: require('fs/promises'),
            path: require('path'),
        };
    }
    async read(key) {
        try {
            const { fs, path } = await this.nodeFs();
            const data = await fs.readFile(path.join(this.baseDir, key));
            return new Uint8Array(data);
        }
        catch {
            return null;
        }
    }
    async write(key, data) {
        const { fs, path } = await this.nodeFs();
        const fullPath = path.join(this.baseDir, key);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
    }
    async list(prefix) {
        try {
            const { fs, path } = await this.nodeFs();
            const entries = await fs.readdir(path.join(this.baseDir, prefix), { recursive: true });
            return entries.map((e) => prefix + '/' + e.toString());
        }
        catch {
            return [];
        }
    }
    async remove(key) {
        try {
            const { fs, path } = await this.nodeFs();
            await fs.unlink(path.join(this.baseDir, key));
        }
        catch {
            // ignore
        }
    }
}
/** Browser IndexedDB backend. */
export class BrowserBackend {
    dbName;
    storeName = 'birrdb';
    dbPromise = null;
    constructor(dbName) {
        this.dbName = dbName;
    }
    openDB() {
        if (this.dbPromise)
            return this.dbPromise;
        this.dbPromise = new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new Error('IndexedDB not available'));
                return;
            }
            const req = indexedDB.open(this.dbName, 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return this.dbPromise;
    }
    async read(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const req = tx.objectStore(this.storeName).get(key);
            req.onsuccess = () => resolve(req.result ? new Uint8Array(req.result) : null);
            req.onerror = () => reject(req.error);
        });
    }
    async write(key, data) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).put(data, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async list(prefix) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const req = tx.objectStore(this.storeName).getAllKeys();
            req.onsuccess = () => {
                const keys = req.result.map(k => String(k));
                resolve(keys.filter(k => k.startsWith(prefix)));
            };
            req.onerror = () => reject(req.error);
        });
    }
    async remove(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}
/** Pick a sensible default backend for the current environment. */
export function defaultBackend(name) {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
        return new BrowserBackend(name);
    }
    // Node: use MemoryBackend by default (FilesystemBackend requires explicit instantiation)
    return new MemoryBackend();
}
//# sourceMappingURL=backend.js.map