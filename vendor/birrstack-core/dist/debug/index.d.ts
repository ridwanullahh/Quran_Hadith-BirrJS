/**
 * BirrStack Debug utilities — development-time helpers.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Features:
 *  - Component tree inspector
 *  - Signal dependency graph
 *  - Performance profiler (render times)
 *  - HMR (Hot Module Replacement) support
 */
export interface DebugInfo {
    componentName: string;
    renderTime: number;
    signalCount: number;
    mountTime: number;
}
/** Enable/disable debug mode. */
export declare function setDebugEnabled(enabled: boolean): void;
/** Check if debug mode is enabled. */
export declare function isDebugEnabled(): boolean;
/** Profile a component render. */
export declare function profileRender(componentName: string, fn: () => void): void;
/** Get all profile data. */
export declare function getProfileData(): DebugInfo[];
/** Clear profile data. */
export declare function clearProfileData(): void;
/**
 * Signal dependency inspector.
 * Returns a map of signal → list of dependent signals/effects.
 */
export declare function inspectSignals(): Map<string, string[]>;
/** Log a debug message (only in debug mode). */
export declare function debug(...args: unknown[]): void;
//# sourceMappingURL=index.d.ts.map