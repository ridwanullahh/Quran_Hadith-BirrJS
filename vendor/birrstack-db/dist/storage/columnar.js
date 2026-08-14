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
/** Analyze a column's values and pick the best compression strategy. */
export function pickCompression(values, type) {
    if (values.length === 0)
        return 'plain';
    const stats = analyzeColumn(values, type);
    // Booleans are always low-cardinality → dictionary
    if (stats.isBoolean)
        return 'dictionary';
    // Monotonic numbers → delta (checked before dictionary — ids/timestamps benefit most)
    if (type === 'number' && stats.isMonotonic && stats.cardinality > 2) {
        return 'delta';
    }
    // Low cardinality (<= 50% unique, or cardinality <= 10) → dictionary
    if (stats.cardinality <= 10 || (stats.cardinality / stats.count <= 0.5 && stats.cardinality < 10000)) {
        return 'dictionary';
    }
    // Long runs of identical values → RLE
    const runs = countRuns(values);
    if (runs < values.length / 2) {
        return 'rle';
    }
    return 'plain';
}
function analyzeColumn(values, type) {
    const seen = new Set();
    let nullCount = 0;
    let isMonotonic = type === 'number';
    let isBoolean = type === 'boolean';
    let prev;
    for (const v of values) {
        if (v === null || v === undefined) {
            nullCount++;
            continue;
        }
        seen.add(v);
        if (typeof v !== 'boolean')
            isBoolean = false;
        if (type === 'number' && typeof v === 'number') {
            if (prev !== undefined && v < prev)
                isMonotonic = false;
            prev = v;
        }
    }
    return {
        cardinality: seen.size,
        count: values.length,
        nullCount,
        isMonotonic,
        isBoolean,
    };
}
function countRuns(values) {
    if (values.length === 0)
        return 0;
    let runs = 1;
    for (let i = 1; i < values.length; i++) {
        if (!Object.is(values[i], values[i - 1]))
            runs++;
    }
    return runs;
}
// === Compression Encoders ===
/** Dictionary-encode a column: replace values with indices into a dictionary. */
export function encodeDictionary(values) {
    const dictionary = [];
    const lookup = new Map();
    const indices = [];
    for (const v of values) {
        if (v === null || v === undefined) {
            indices.push(null);
            continue;
        }
        let idx = lookup.get(v);
        if (idx === undefined) {
            idx = dictionary.length;
            dictionary.push(v);
            lookup.set(v, idx);
        }
        indices.push(idx);
    }
    return { dictionary, indices };
}
/** Delta-encode a column of numbers: store deltas from the previous non-null value. */
export function encodeDelta(values) {
    if (values.length === 0)
        return { first: null, deltas: [] };
    const first = values[0] ?? null;
    const deltas = [first];
    // Track the last non-null value so deltas after a null resolve correctly
    let lastNonNull = first;
    for (let i = 1; i < values.length; i++) {
        const cur = values[i] ?? null;
        if (cur === null) {
            deltas.push(null);
        }
        else if (lastNonNull === null) {
            // No baseline — store absolute value
            deltas.push(cur);
            lastNonNull = cur;
        }
        else {
            deltas.push(cur - lastNonNull);
            lastNonNull = cur;
        }
    }
    return { first, deltas };
}
/** RLE-encode a column: store (value, count) pairs. */
export function encodeRLE(values) {
    if (values.length === 0)
        return { runs: [] };
    const runs = [];
    let current = values[0];
    let count = 1;
    for (let i = 1; i < values.length; i++) {
        if (Object.is(values[i], current)) {
            count++;
        }
        else {
            runs.push({ value: current, count });
            current = values[i];
            count = 1;
        }
    }
    runs.push({ value: current, count });
    return { runs };
}
// === Compression Decoders ===
/** Decode a dictionary-encoded column back to raw values. */
export function decodeDictionary(dictionary, indices) {
    return indices.map(idx => (idx === null ? null : dictionary[idx] ?? null));
}
/** Decode a delta-encoded column back to raw numbers. */
export function decodeDelta(first, deltas) {
    if (deltas.length === 0)
        return [];
    const out = [first];
    // prev is the last non-null value (so deltas after a null still resolve correctly)
    let prev = first;
    for (let i = 1; i < deltas.length; i++) {
        const d = deltas[i] ?? null;
        if (d === null) {
            out.push(null);
            // prev unchanged — next non-null delta resolves against the last known value
        }
        else if (prev === null) {
            // No baseline to delta against — push the raw delta as absolute (loses info, but best effort)
            out.push(d);
            prev = d;
        }
        else {
            prev = prev + d;
            out.push(prev);
        }
    }
    return out;
}
/** Decode an RLE-encoded column back to raw values. */
export function decodeRLE(runs) {
    const out = [];
    for (const run of runs) {
        for (let i = 0; i < run.count; i++) {
            out.push(run.value);
        }
    }
    return out;
}
// === Column Serialization ===
/** Serialize a column (pick compression, encode, return serialized form). */
export function serializeColumn(name, type, values) {
    if (values.length === 0) {
        return { name, type, compression: 'plain', length: 0, data: [] };
    }
    const strategy = pickCompression(values, type);
    switch (strategy) {
        case 'dictionary': {
            const { dictionary, indices } = encodeDictionary(values);
            return { name, type, compression: 'dictionary', length: values.length, data: indices, dictionary };
        }
        case 'delta': {
            const { first, deltas } = encodeDelta(values);
            return { name, type, compression: 'delta', length: values.length, data: { first, deltas } };
        }
        case 'rle': {
            const { runs } = encodeRLE(values);
            return { name, type, compression: 'rle', length: values.length, data: { runs } };
        }
        default:
            return { name, type, compression: 'plain', length: values.length, data: values };
    }
}
/** Deserialize a column back to raw values. */
export function deserializeColumn(col) {
    switch (col.compression) {
        case 'dictionary':
            return decodeDictionary(col.dictionary ?? [], col.data);
        case 'delta': {
            const d = col.data;
            return decodeDelta(d.first, d.deltas);
        }
        case 'rle': {
            const d = col.data;
            return decodeRLE(d.runs);
        }
        default:
            return col.data;
    }
}
/** Estimate the byte size of a serialized column (rough, for stats). */
export function estimateColumnSize(col) {
    // Very rough heuristic — real implementation would measure actual bytes
    const dataStr = JSON.stringify(col.data);
    const dictStr = col.dictionary ? JSON.stringify(col.dictionary) : '';
    return dataStr.length + dictStr.length;
}
//# sourceMappingURL=columnar.js.map