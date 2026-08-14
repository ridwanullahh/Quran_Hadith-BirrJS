/**
 * BirrDB Collection — a table-like structure using columnar storage.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A Collection holds rows but stores them columnar internally.
 * On flush/serialize, each column is compressed automatically.
 */
import { serializeColumn, deserializeColumn, pickCompression, } from './columnar.js';
let nextId = 1;
function genId() {
    return nextId++;
}
function resetId(n = 1) {
    nextId = n;
}
export class Collection {
    name;
    columns;
    /** Internal columnar storage: column name → values array. */
    storage = new Map();
    /** Primary key index: id → row index. */
    idIndex = new Map();
    /** Write-ahead log (for durability). */
    wal = [];
    /** Whether the collection has unsaved changes. */
    dirty = false;
    constructor(opts) {
        this.name = opts.name;
        this.columns = opts.columns;
        for (const col of this.columns) {
            this.storage.set(col.name, []);
        }
        // Always have an implicit `id` column if not declared
        if (!this.storage.has('id')) {
            this.storage.set('id', []);
        }
    }
    /** Insert a row. Returns the assigned id. */
    insert(row) {
        const id = row.id ?? genId();
        const fullRow = { ...row, id };
        const idx = this.storage.get('id').length;
        for (const col of this.columns) {
            const arr = this.storage.get(col.name);
            if (!arr) {
                throw new Error(`BirrDB: unknown column "${col.name}"`);
            }
            arr.push(fullRow[col.name] ?? null);
        }
        this.storage.get('id').push(id);
        this.idIndex.set(id, idx);
        this.wal.push({ op: 'insert', id, row: fullRow });
        this.dirty = true;
        return id;
    }
    /** Insert multiple rows. */
    insertMany(rows) {
        return rows.map(r => this.insert(r));
    }
    /** Find a row by id. */
    findById(id) {
        const idx = this.idIndex.get(id);
        if (idx === undefined)
            return null;
        return this.getRow(idx);
    }
    /** Get a row by internal index. */
    getRow(idx) {
        if (idx < 0 || idx >= this.storage.get('id').length)
            return null;
        const row = {};
        for (const col of this.columns) {
            row[col.name] = this.storage.get(col.name)?.[idx] ?? null;
        }
        row.id = this.storage.get('id')?.[idx];
        return row;
    }
    /** Update a row by id. */
    update(id, patch) {
        const idx = this.idIndex.get(id);
        if (idx === undefined)
            return false;
        for (const [key, value] of Object.entries(patch)) {
            if (key === 'id')
                continue;
            const arr = this.storage.get(key);
            if (arr) {
                arr[idx] = value;
            }
        }
        this.wal.push({ op: 'update', id, row: patch });
        this.dirty = true;
        return true;
    }
    /** Delete a row by id. */
    delete(id) {
        const idx = this.idIndex.get(id);
        if (idx === undefined)
            return false;
        // Mark as deleted (tombstone) — compaction removes them
        for (const col of this.columns) {
            const arr = this.storage.get(col.name);
            if (arr)
                arr[idx] = null;
        }
        this.storage.get('id')[idx] = null;
        this.idIndex.delete(id);
        this.wal.push({ op: 'delete', id });
        this.dirty = true;
        return true;
    }
    /** Return all rows (excluding tombstones). */
    all() {
        const out = [];
        const idArr = this.storage.get('id');
        for (let i = 0; i < idArr.length; i++) {
            if (idArr[i] === null)
                continue;
            const row = this.getRow(i);
            if (row)
                out.push(row);
        }
        return out;
    }
    /** Count of live rows. */
    count() {
        let c = 0;
        const idArr = this.storage.get('id');
        for (const v of idArr) {
            if (v !== null)
                c++;
        }
        return c;
    }
    /** Clear all rows. */
    clear() {
        for (const arr of this.storage.values()) {
            arr.length = 0;
        }
        this.idIndex.clear();
        this.wal.length = 0;
        this.dirty = true;
    }
    /** Compact: remove tombstones and rebuild indexes. */
    compact() {
        const oldRows = this.all();
        this.clear();
        for (const row of oldRows) {
            this.insert(row);
        }
        this.dirty = true;
    }
    /** Serialize to compressed on-disk format. */
    serialize() {
        const data = [];
        for (const col of this.columns) {
            const values = this.storage.get(col.name) ?? [];
            data.push(serializeColumn(col.name, col.type, values));
        }
        // Also serialize the implicit id column
        const idValues = this.storage.get('id') ?? [];
        data.push(serializeColumn('id', 'number', idValues));
        return {
            name: this.name,
            columns: this.columns,
            data,
            length: this.count(),
            version: 1,
        };
    }
    /** Deserialize from on-disk format. */
    static deserialize(serialized) {
        const col = new Collection({ name: serialized.name, columns: serialized.columns });
        for (const scol of serialized.data) {
            const values = deserializeColumn(scol);
            col.storage.set(scol.name, values);
        }
        // Rebuild id index
        const ids = col.storage.get('id') ?? [];
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== null) {
                col.idIndex.set(ids[i], i);
            }
        }
        // Update the id counter so new inserts don't collide
        let maxId = 0;
        for (const id of ids) {
            if (typeof id === 'number' && id > maxId)
                maxId = id;
        }
        resetId(maxId + 1);
        col.dirty = false;
        return col;
    }
    /** Estimate storage size (bytes, rough). */
    estimateSize() {
        let total = 0;
        for (const col of this.columns) {
            const values = this.storage.get(col.name) ?? [];
            const serialized = serializeColumn(col.name, col.type, values);
            total += JSON.stringify(serialized).length;
        }
        return total;
    }
    /** Return stats about column compression (for diagnostics). */
    compressionStats() {
        const out = {};
        for (const col of this.columns) {
            const values = this.storage.get(col.name) ?? [];
            const raw = JSON.stringify(values).length;
            const serialized = serializeColumn(col.name, col.type, values);
            const compressed = JSON.stringify(serialized).length;
            out[col.name] = {
                strategy: pickCompression(values, col.type),
                rawBytes: raw,
                compressedBytes: compressed,
                ratio: raw > 0 ? compressed / raw : 0,
            };
        }
        return out;
    }
}
/** Reset the internal id counter (for tests). */
export function __resetIdCounter(n = 1) {
    resetId(n);
}
//# sourceMappingURL=collection.js.map