/**
 * BirrDB Columnar Storage Engine.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Design:
 *  - Each collection stores rows as columns, not as row objects.
 *  - Each column has a type and a compression strategy:
 *    - dictionary: low-cardinality strings → integer indices into a dictionary
 *    - delta: monotonically increasing numbers (ids, timestamps) → deltas
 *    - rle: runs of identical values → (value, count) pairs
 *    - plain: raw values (fallback)
 *  - Compression is chosen automatically based on column stats.
 *
 * Target: 10x reduction vs SQLite for typical structured data
 * (text-heavy, repetitive, time-series).
 */
/** Supported column value types. */
export type ColumnType = 'string' | 'number' | 'boolean' | 'json' | 'bytes';
/** Compression strategy for a column. */
export type CompressionStrategy = 'plain' | 'dictionary' | 'delta' | 'rle';
/** A column definition. */
export interface ColumnDef {
    name: string;
    type: ColumnType;
    nullable?: boolean;
    /** Force a compression strategy. If omitted, chosen automatically. */
    compression?: CompressionStrategy;
}
/** A serialized column (post-compression). */
export interface SerializedColumn {
    name: string;
    type: ColumnType;
    compression: CompressionStrategy;
    /** Number of values in this column. */
    length: number;
    /** Compressed data — structure depends on strategy. */
    data: unknown;
    /** Optional dictionary for dictionary-encoded columns. */
    dictionary?: unknown[];
}
/** Analyze a column's values and pick the best compression strategy. */
export declare function pickCompression(values: unknown[], type: ColumnType): CompressionStrategy;
/** Dictionary-encode a column: replace values with indices into a dictionary. */
export declare function encodeDictionary(values: unknown[]): {
    dictionary: unknown[];
    indices: (number | null)[];
};
/** Delta-encode a column of numbers: store deltas from the previous non-null value. */
export declare function encodeDelta(values: (number | null)[]): {
    first: number | null;
    deltas: (number | null)[];
};
/** RLE-encode a column: store (value, count) pairs. */
export declare function encodeRLE(values: unknown[]): {
    runs: {
        value: unknown;
        count: number;
    }[];
};
/** Decode a dictionary-encoded column back to raw values. */
export declare function decodeDictionary(dictionary: unknown[], indices: (number | null)[]): unknown[];
/** Decode a delta-encoded column back to raw numbers. */
export declare function decodeDelta(first: number | null, deltas: (number | null)[]): (number | null)[];
/** Decode an RLE-encoded column back to raw values. */
export declare function decodeRLE(runs: {
    value: unknown;
    count: number;
}[]): unknown[];
/** Serialize a column (pick compression, encode, return serialized form). */
export declare function serializeColumn(name: string, type: ColumnType, values: unknown[]): SerializedColumn;
/** Deserialize a column back to raw values. */
export declare function deserializeColumn(col: SerializedColumn): unknown[];
/** Estimate the byte size of a serialized column (rough, for stats). */
export declare function estimateColumnSize(col: SerializedColumn): number;
//# sourceMappingURL=columnar.d.ts.map