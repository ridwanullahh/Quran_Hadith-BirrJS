/**
 * BirrDB Persistence — pluggable storage backends.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Backends:
 *  - MemoryBackend: in-memory (default, for tests and ephemeral data)
 *  - FilesystemBackend: Node.js fs (for native/server)
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
/** Node.js filesystem backend. */
export class FilesystemBackend {
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    async read(key) {
        try {
            const { readFile } = await import('node:fs/promises');
            const { join } = await import('node:path');
            const data = await readFile(join(this.baseDir, key));
            return new Uint8Array(data);
        }
        catch {
            return null;
        }
    }
    async write(key, data) {
        const { writeFile, mkdir } = await import('node:fs/promises');
        const { join, dirname } = await import('node:path');
        const fullPath = join(this.baseDir, key);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, data);
    }
    async list(prefix) {
        const { readdir } = await import('node:fs/promises');
        const { join } = await import('node:path');
        try {
            const entries = await readdir(join(this.baseDir, prefix), { recursive: true });
            return entries.map(e => prefix + '/' + e.toString());
        }
        catch {
            return [];
        }
    }
    async remove(key) {
        const { unlink } = await import('node:fs/promises');
        const { join } = await import('node:path');
        try {
            await unlink(join(this.baseDir, key));
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
    // Node: use a temp dir by default
    return new FilesystemBackend(`./.birrdb/${name}`);
}
//# sourceMappingURL=backend.js.map