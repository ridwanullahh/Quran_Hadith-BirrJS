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
import { signal, effect } from '../signals/index.js';
const errorsSignal = signal([]);
let overlayVisible = signal(false);
/** Get the errors signal (reactive). */
export function getErrors() {
    return errorsSignal;
}
/** Get overlay visibility signal. */
export function isOverlayVisible() {
    return overlayVisible;
}
/** Clear all errors. */
export function clearErrors() {
    errorsSignal.value = [];
    overlayVisible.value = false;
}
/** Dismiss a specific error. */
export function dismissError(id) {
    errorsSignal.value = errorsSignal.value.filter(e => e.id !== id);
}
/** Show the error overlay. */
export function showOverlay() {
    overlayVisible.value = true;
}
/** Hide the error overlay. */
export function hideOverlay() {
    overlayVisible.value = false;
}
/**
 * Intelligent import error resolver.
 * Analyzes common import mistakes and suggests fixes.
 */
export function resolveImportError(error) {
    const lower = error.toLowerCase();
    // Case 1: Missing file extension in relative imports
    if (lower.includes('could not resolve') && lower.includes("from '")) {
        const match = error.match(/Could not resolve "([^"]+)" from "([^"]+)"/);
        if (match) {
            const [, importPath, fromFile] = match;
            if (importPath.startsWith('.')) {
                // Suggest adding .js, .ts, .birr extension
                return `Try adding a file extension: '${importPath}.js', '${importPath}.ts', or '${importPath}.birr'. The file "${fromFile}" is trying to import "${importPath}" which doesn't resolve.`;
            }
        }
    }
    // Case 2: node: protocol in browser
    if (lower.includes('node:') && lower.includes('externalized')) {
        return 'This module uses Node.js built-ins (node:*). For browser compatibility, either: 1) Use a browser-compatible alternative, 2) Mark it as external in vite.config.ts, 3) Use dynamic import() with a runtime environment check.';
    }
    // Case 3: Package not installed
    if (lower.includes('could not resolve') && !lower.includes("from '")) {
        const match = error.match(/Could not resolve "([^"]+)"/);
        if (match) {
            const pkg = match[1];
            if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
                return `The package "${pkg}" is not installed. Run: npm install ${pkg}`;
            }
        }
    }
    // Case 4: Bare specifier without extension
    if (lower.includes('cannot find module')) {
        const match = error.match(/Cannot find module '([^']+)'/);
        if (match) {
            const mod = match[1];
            if (mod.startsWith('.')) {
                return `Try adding .js extension: import from '${mod}.js'`;
            }
        }
    }
    // Case 5: Export not found
    if (lower.includes('does not provide an export named')) {
        const match = error.match(/does not provide an export named '([^']+)'/);
        if (match) {
            return `The export '${match[1]}' does not exist. Check the module's exports, or use the default import if applicable.`;
        }
    }
    return undefined;
}
/** Log an error. */
export function logError(error) {
    // Add suggestion if it's an import error
    if (error.type === 'import' && !error.suggestion) {
        error.suggestion = resolveImportError(error.message);
    }
    errorsSignal.value = [...errorsSignal.value, error];
    // Also log to console for debugging
    console.error('[BirrStack Error]', error);
    // Show overlay for build and import errors in dev mode
    if (error.type === 'build' || error.type === 'import') {
        overlayVisible.value = true;
    }
}
/** Initialize global error capture. Call once at app startup. */
export function initErrorCapture() {
    if (typeof window === 'undefined')
        return;
    // Capture runtime errors
    window.addEventListener('error', (event) => {
        logError({
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            type: 'runtime',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
        });
    });
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        logError({
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            type: 'runtime',
            message: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? reason.stack : undefined,
        });
    });
    // Capture Vite preload errors
    window.addEventListener('vite:preloadError', (event) => {
        const payload = event.payload;
        const message = payload instanceof Error ? payload.message : String(payload);
        logError({
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            type: 'import',
            message: `Failed to preload module: ${message}`,
            stack: payload instanceof Error ? payload.stack : undefined,
            suggestion: resolveImportError(message),
        });
    });
}
/**
 * Render the error overlay as a DOM element.
 * Returns an HTMLElement that can be appended to document.body.
 */
export function createErrorOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'birr-error-overlay';
    overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85); z-index: 99999;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 20px; overflow-y: auto; font-family: monospace;
  `;
    const container = document.createElement('div');
    container.style.cssText = `
    background: #1a1a2e; color: #e0e0e0; border-radius: 12px;
    max-width: 900px; width: 100%; padding: 24px;
    border: 1px solid #e74c3c; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;';
    header.innerHTML = `
    <h2 style="margin: 0; color: #e74c3c; font-size: 18px;">BirrStack Error</h2>
    <button id="birr-close-overlay" style="background: #e74c3c; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Close</button>
  `;
    const errorsList = document.createElement('div');
    errorsList.id = 'birr-errors-list';
    container.appendChild(header);
    container.appendChild(errorsList);
    overlay.appendChild(container);
    // Close button
    overlay.querySelector('#birr-close-overlay').addEventListener('click', () => {
        hideOverlay();
    });
    // Subscribe to errors signal
    effect(() => {
        const errors = errorsSignal.value;
        const visible = overlayVisible.value;
        overlay.style.display = visible && errors.length > 0 ? 'flex' : 'none';
        errorsList.innerHTML = errors.map(err => `
      <div style="background: #0d0d1a; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${err.type === 'import' ? '#f39c12' : '#e74c3c'};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: ${err.type === 'import' ? '#f39c12' : '#e74c3c'}; font-weight: 700; font-size: 13px; text-transform: uppercase;">${err.type}</span>
          <span style="color: #666; font-size: 12px;">${new Date(err.timestamp).toLocaleTimeString()}</span>
        </div>
        <p style="margin: 0 0 8px 0; color: #fff; font-size: 14px;">${err.message}</p>
        ${err.filename ? `<p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">at ${err.filename}:${err.lineno}:${err.colno}</p>` : ''}
        ${err.stack ? `<pre style="margin: 8px 0 0 0; color: #aaa; font-size: 11px; overflow-x: auto; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">${err.stack}</pre>` : ''}
        ${err.suggestion ? `<div style="margin-top: 8px; padding: 8px 12px; background: #1a3a1a; border-radius: 6px; color: #4ade80; font-size: 12px;"><strong>Suggestion:</strong> ${err.suggestion}</div>` : ''}
      </div>
    `).join('');
    });
    return overlay;
}
/** Mount the error overlay to the document body. */
export function mountErrorOverlay() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById('birr-error-overlay'))
        return;
    const overlay = createErrorOverlay();
    document.body.appendChild(overlay);
}
//# sourceMappingURL=index.js.map