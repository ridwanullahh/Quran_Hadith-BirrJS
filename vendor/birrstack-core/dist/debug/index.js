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
import { signal } from '../signals/index.js';
const debugEnabled = signal(false);
const profileData = [];
/** Enable/disable debug mode. */
export function setDebugEnabled(enabled) {
    debugEnabled.value = enabled;
}
/** Check if debug mode is enabled. */
export function isDebugEnabled() {
    return debugEnabled.value;
}
/** Profile a component render. */
export function profileRender(componentName, fn) {
    if (!debugEnabled.value) {
        fn();
        return;
    }
    const start = performance.now();
    fn();
    const elapsed = performance.now() - start;
    profileData.push({
        componentName,
        renderTime: elapsed,
        signalCount: 0,
        mountTime: Date.now(),
    });
}
/** Get all profile data. */
export function getProfileData() {
    return [...profileData];
}
/** Clear profile data. */
export function clearProfileData() {
    profileData.length = 0;
}
/**
 * Signal dependency inspector.
 * Returns a map of signal → list of dependent signals/effects.
 */
export function inspectSignals() {
    // This is a placeholder — full implementation would require
    // hooking into the signals runtime to track dependencies.
    // For now, it returns an empty map.
    return new Map();
}
/** Log a debug message (only in debug mode). */
export function debug(...args) {
    if (debugEnabled.value) {
        console.log('[BirrStack Debug]', ...args);
    }
}
//# sourceMappingURL=index.js.map