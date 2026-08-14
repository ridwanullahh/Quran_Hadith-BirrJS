/**
 * BirrStack Utility CSS System — Tailwind-like class-first approach.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */
export interface UtilityConfig {
    spacing?: Record<string, string>;
    colors?: Record<string, string>;
    fontSize?: Record<string, string>;
    screens?: Record<string, string>;
    borderRadius?: Record<string, string>;
}
export declare function configureUtilities(custom: UtilityConfig): void;
export declare function generateUtilityCss(): string;
export declare function injectUtilityCss(customConfig?: UtilityConfig): void;
//# sourceMappingURL=index.d.ts.map