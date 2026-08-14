/**
 * BirrDB Collection — a table-like structure using columnar storage.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A Collection holds rows but stores them columnar internally.
 * On flush/serialize, each column is compressed automatically.
 */
import { type ColumnDef, type SerializedColumn } from './columnar.js';
/** A row is a plain object. */
export type Row = Record<string, unknown>;
/** A serialized collection (the on-disk format). */
export interface SerializedCollection {
    name: string;
    columns: ColumnDef[];
    /** Per-column compressed data. */
    data: SerializedColumn[];
    /** Number of rows. */
    length: number;
    /** Schema version for migrations. */
    version: number;
}
/** Options for creating a collection. */
export interface CollectionOptions {
    name: string;
    columns: ColumnDef[];
}
export declare class Collection {
    readonly name: string;
    readonly columns: ColumnDef[];
    /** Internal columnar storage: column name → values array. */
    private storage;
    /** Primary key index: id → row index. */
    private idIndex;
    /** Write-ahead log (for durability). */
    private wal;
    /** Whether the collection has unsaved changes. */
    dirty: boolean;
    constructor(opts: CollectionOptions);
    /** Insert a row. Returns the assigned id. */
    insert(row: Row): number;
    /** Insert multiple rows. */
    insertMany(rows: Row[]): number[];
    /** Find a row by id. */
    findById(id: number): Row | null;
    /** Get a row by internal index. */
    private getRow;
    /** Update a row by id. */
    update(id: number, patch: Partial<Row>): boolean;
    /** Delete a row by id. */
    delete(id: number): boolean;
    /** Return all rows (excluding tombstones). */
    all(): Row[];
    /** Count of live rows. */
    count(): number;
    /** Clear all rows. */
    clear(): void;
    /** Compact: remove tombstones and rebuild indexes. */
    compact(): void;
    /** Serialize to compressed on-disk format. */
    serialize(): SerializedCollection;
    /** Deserialize from on-disk format. */
    static deserialize(serialized: SerializedCollection): Collection;
    /** Estimate storage size (bytes, rough). */
    estimateSize(): number;
    /** Return stats about column compression (for diagnostics). */
    compressionStats(): Record<string, {
        strategy: string;
        rawBytes: number;
        compressedBytes: number;
        ratio: number;
    }>;
}
/** Reset the internal id counter (for tests). */
export declare function __resetIdCounter(n?: number): void;
//# sourceMappingURL=collection.d.ts.map