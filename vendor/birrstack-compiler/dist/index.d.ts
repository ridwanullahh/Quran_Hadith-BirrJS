/**
 * BirrStack Compiler — compiles a .birr SFC into a JS module string.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Output: a JS module that exports a default ComponentDefinition.
 * CSS is emitted as a separate export (`__css`) so the Vite plugin can
 * extract it to a .css file for proper production builds.
 */
export interface CompileOptions {
    coreImport?: string;
    scopeId?: string;
}
export interface CompileResult {
    code: string;
    css: string;
    warnings: string[];
}
export declare function compile(source: string, options?: CompileOptions): CompileResult;
//# sourceMappingURL=index.d.ts.map