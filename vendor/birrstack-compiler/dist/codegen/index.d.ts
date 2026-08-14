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
 * Expressions in interpolations, birr:if, birr:for, birr:bind, and birr:on
 * are transformed so that bare identifiers referring to reactive state
 * (Signals/Computeds) are auto-unwrapped via __unwrap(). This lets users
 * write `{{ count }}` instead of `{{ count.value }}` and
 * `birr:if="activeApp === null"` instead of `birr:if="activeApp.value === null"`.
 *
 * Generated code is a string. The compiler returns:
 *   { code: string, imports: string[] }
 */
import type { TemplateNode } from '../parser/template.js';
export interface CodegenOptions {
    /** Identifiers returned by setup() — these get auto-unwrapped in expressions. */
    stateKeys?: Set<string>;
    /** Scope ID (e.g. 'data-birr-abc123') added to every element for scoped CSS. */
    scopeId?: string;
}
export interface CodegenResult {
    /** The generated render function body (statements). */
    code: string;
    /** The set of imports needed from birrstack-core. */
    imports: Set<string>;
}
/** Generate a render function from a template AST. */
export declare function generateRender(nodes: TemplateNode[], options?: CodegenOptions): CodegenResult;
/** Reset the variable counter (for tests). */
export declare function __resetVarCounter(): void;
//# sourceMappingURL=index.d.ts.map