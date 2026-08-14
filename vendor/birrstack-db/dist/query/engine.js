/**
 * BirrDB Query Engine — filter, sort, limit on collections.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A query is a declarative description of how to select rows:
 *   { where: { role: 'admin' }, orderBy: 'name', limit: 10 }
 *
 * The engine evaluates `where` predicates against each row.
 * Supported operators: eq, ne, gt, gte, lt, lte, in, contains, startsWith.
 */
/** Convert a query's `where` clause into a list of predicates. */
function normalizeWhere(where) {
    if (!where)
        return [];
    if (Array.isArray(where))
        return where;
    if (typeof where === 'object' && 'field' in where && 'op' in where) {
        return [where];
    }
    // Shorthand: { field: value } → [{ field, op: 'eq', value }]
    const preds = [];
    for (const [field, value] of Object.entries(where)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // { field: { op: 'gt', value: 5 } }
            const v = value;
            preds.push({ field, op: v.op, value: v.value });
        }
        else {
            preds.push({ field, op: 'eq', value });
        }
    }
    return preds;
}
/** Evaluate a predicate against a row. */
function evalPredicate(row, pred) {
    const v = row[pred.field];
    switch (pred.op) {
        case 'eq': return Object.is(v, pred.value);
        case 'ne': return !Object.is(v, pred.value);
        case 'gt': return v > pred.value;
        case 'gte': return v >= pred.value;
        case 'lt': return v < pred.value;
        case 'lte': return v <= pred.value;
        case 'in': return Array.isArray(pred.value) && pred.value.includes(v);
        case 'contains':
            if (typeof v === 'string' && typeof pred.value === 'string')
                return v.includes(pred.value);
            if (Array.isArray(v))
                return v.includes(pred.value);
            return false;
        case 'startsWith':
            return typeof v === 'string' && typeof pred.value === 'string' && v.startsWith(pred.value);
        default: return false;
    }
}
/** Run a query against an array of rows. Returns matching rows. */
export function runQuery(rows, query) {
    const preds = normalizeWhere(query.where);
    let result = rows.filter(row => preds.every(p => evalPredicate(row, p)));
    if (query.orderBy) {
        const field = query.orderBy;
        const dir = query.orderDir === 'desc' ? -1 : 1;
        result = [...result].sort((a, b) => {
            const av = a[field];
            const bv = b[field];
            if (av === bv)
                return 0;
            if (av === null || av === undefined)
                return 1;
            if (bv === null || bv === undefined)
                return -1;
            return av < bv ? -dir : dir;
        });
    }
    if (query.offset) {
        result = result.slice(query.offset);
    }
    if (query.limit !== undefined) {
        result = result.slice(0, query.limit);
    }
    return result;
}
//# sourceMappingURL=engine.js.map