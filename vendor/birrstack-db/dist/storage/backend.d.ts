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
/** A storage backend — async key/value store of serialized collections. */
export interface StorageBackend {
    read(key: string): Promise<Uint8Array | null>;
    write(key: string, data: Uint8Array): Promise<void>;
    list(prefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
}
/** In-memory backend (default). */
export declare class MemoryBackend implements StorageBackend {
    private store;
    read(key: string): Promise<Uint8Array | null>;
    write(key: string, data: Uint8Array): Promise<void>;
    list(prefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
}
/** Node.js filesystem backend. */
export declare class FilesystemBackend implements StorageBackend {
    private baseDir;
    constructor(baseDir: string);
    read(key: string): Promise<Uint8Array | null>;
    write(key: string, data: Uint8Array): Promise<void>;
    list(prefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
}
/** Browser IndexedDB backend. */
export declare class BrowserBackend implements StorageBackend {
    private dbName;
    private storeName;
    private dbPromise;
    constructor(dbName: string);
    private openDB;
    read(key: string): Promise<Uint8Array | null>;
    write(key: string, data: Uint8Array): Promise<void>;
    list(prefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
}
/** Pick a sensible default backend for the current environment. */
export declare function defaultBackend(name: string): StorageBackend;
//# sourceMappingURL=backend.d.ts.map