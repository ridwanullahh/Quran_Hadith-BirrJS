/**
 * BirrStack Code Generator — walks a template AST and emits a render function.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * The generated render function uses birrstack-core DOM helpers:
 *  - h(tag, props, children)
 *  - text(value)
 *  - bindConditional(parent, anchor, condition, factory)
 *  - bindList(parent, anchor, source, render, getKey)
 *
 * Generated code is a string. The compiler returns:
 *   { code: string, imports: string[] }
 */
import type { TemplateNode } from '../parser/template.js';
export interface CodegenResult {
    /** The generated render function body (statements). */
    code: string;
    /** The set of imports needed from birrstack-core. */
    imports: Set<string>;
}
/** Generate a render function from a template AST. */
export declare function generateRender(nodes: TemplateNode[]): CodegenResult;
/** Reset the variable counter (for tests). */
export declare function __resetVarCounter(): void;
//# sourceMappingURL=index.d.ts.map