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
import type { Row } from '../storage/collection.js';
/** A single predicate. */
export interface Predicate {
    field: string;
    op: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith';
    value: unknown;
}
/** A query against a collection. */
export interface Query {
    where?: Predicate | Predicate[] | Record<string, unknown>;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
/** Run a query against an array of rows. Returns matching rows. */
export declare function runQuery(rows: Row[], query: Query): Row[];
//# sourceMappingURL=engine.d.ts.map