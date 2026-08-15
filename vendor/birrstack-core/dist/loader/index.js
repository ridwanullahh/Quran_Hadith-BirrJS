/**
 * BirrStack Page Loader — customizable loading indicator.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Shows a loading bar at the top of the page during navigation/fetching.
 * Automatically disabled on non-web platforms.
 * Each app can customize the color, height, and behavior, or disable it entirely.
 */
import { signal, effect } from '../signals/index.js';
const loading = signal(false);
let progress = signal(0);
let options = { color: '#05B34D', height: 3, enabled: true };
let element = null;
let interval = null;
/** Configure the page loader. */
export function configureLoader(opts) {
    options = { ...options, ...opts };
}
/** Show the loader. */
export function showLoader() {
    if (!options.enabled)
        return;
    if (typeof document === 'undefined')
        return;
    loading.value = true;
    progress.value = 0;
    // Animate progress
    if (interval)
        clearInterval(interval);
    interval = setInterval(() => {
        if (progress.value < 90) {
            progress.value = progress.value + Math.random() * 10;
        }
    }, 200);
}
/** Hide the loader. */
export function hideLoader() {
    if (!options.enabled)
        return;
    if (typeof document === 'undefined')
        return;
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    progress.value = 100;
    setTimeout(() => {
        loading.value = false;
        progress.value = 0;
    }, 300);
}
/** Check if the loader is currently visible. */
export function isLoading() {
    return loading;
}
/** Mount the loader element to the DOM. */
export function mountLoader(opts) {
    if (typeof document === 'undefined')
        return;
    if (opts)
        configureLoader(opts);
    // Auto-disable on non-web platforms (check for native bridge)
    if (typeof globalThis.__birrPlatform !== 'undefined') {
        options.enabled = false;
        return;
    }
    if (element)
        return;
    element = document.createElement('div');
    element.id = 'birr-loader';
    element.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; height: ${options.height ?? 3}px;
    background: ${options.color ?? '#05B34D'}; z-index: 99998;
    transform: translateX(-100%); transition: transform 0.2s ease;
    box-shadow: 0 0 8px ${options.color ?? '#05B34D'};
  `;
    document.body.appendChild(element);
    // React to loading state
    effect(() => {
        if (!element)
            return;
        if (loading.value) {
            element.style.display = 'block';
            element.style.transform = `translateX(${-100 + progress.value}%)`;
        }
        else {
            element.style.transform = 'translateX(0%)';
            setTimeout(() => {
                if (element && !loading.value)
                    element.style.display = 'none';
            }, 300);
        }
    });
    // Also react to progress changes
    effect(() => {
        if (!element || !loading.value)
            return;
        element.style.transform = `translateX(${-100 + progress.value}%)`;
    });
}
/** Wrap a navigation function to show/hide the loader automatically. */
export function withLoader(fn) {
    return ((...args) => {
        showLoader();
        try {
            const result = fn(...args);
            if (result instanceof Promise) {
                return result.finally(() => hideLoader());
            }
            hideLoader();
            return result;
        }
        catch (e) {
            hideLoader();
            throw e;
        }
    });
}
//# sourceMappingURL=index.js.map