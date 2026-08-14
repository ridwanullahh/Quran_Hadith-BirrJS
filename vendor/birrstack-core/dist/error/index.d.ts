/**
 * BirrStack Error Boundary & Error Logging System.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Features:
 *  - Global error capture (window.onerror, unhandledrejection)
 *  - Error overlay UI with stack traces (like Vite's error overlay)
 *  - Build-time error logging via Vite plugin
 *  - Intelligent import error resolver (suggests fixes for common import mistakes)
 *  - Error persistence to BirrDB for later analysis
 *  - Source map support for readable stack traces
 */
import { type Signal } from '../signals/index.js';
export interface BirrError {
    id: string;
    timestamp: number;
    type: 'runtime' | 'build' | 'import' | 'network';
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    suggestion?: string;
    resolved?: boolean;
}
/** Get the errors signal (reactive). */
export declare function getErrors(): Signal<BirrError[]>;
/** Get overlay visibility signal. */
export declare function isOverlayVisible(): Signal<boolean>;
/** Clear all errors. */
export declare function clearErrors(): void;
/** Dismiss a specific error. */
export declare function dismissError(id: string): void;
/** Show the error overlay. */
export declare function showOverlay(): void;
/** Hide the error overlay. */
export declare function hideOverlay(): void;
/**
 * Intelligent import error resolver.
 * Analyzes common import mistakes and suggests fixes.
 */
export declare function resolveImportError(error: string): string | undefined;
/** Log an error. */
export declare function logError(error: BirrError): void;
/** Initialize global error capture. Call once at app startup. */
export declare function initErrorCapture(): void;
/**
 * Render the error overlay as a DOM element.
 * Returns an HTMLElement that can be appended to document.body.
 */
export declare function createErrorOverlay(): HTMLElement;
/** Mount the error overlay to the document body. */
export declare function mountErrorOverlay(): void;
//# sourceMappingURL=index.d.ts.map