/**
 * BirrStack Compiler — compiles a .birr SFC into a JS module string.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Input:  the source of a .birr file
 * Output: a JS module string that exports a BirrStack component definition
 *
 * The generated module imports from 'birrstack-core' and exports a default
 * ComponentDefinition object.
 */
export interface CompileOptions {
    /** The module specifier to import birrstack-core from. Default: 'birrstack-core'. */
    coreImport?: string;
    /** Unique scope ID for scoped CSS. If omitted, a random one is generated. */
    scopeId?: string;
}
export interface CompileResult {
    /** Generated JS module source. */
    code: string;
    /** Any warnings emitted during compilation. */
    warnings: string[];
}
/** Compile a .birr SFC source string into a JS module. */
export declare function compile(source: string, options?: CompileOptions): CompileResult;
//# sourceMappingURL=index.d.ts.map