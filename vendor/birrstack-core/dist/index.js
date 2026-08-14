/**
 * BirrStack Core — public entry point.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * BirrStack is a lightweight full-stack framework for web and native,
 * built on pure HTML, CSS, and JavaScript.
 *
 * @packageDocumentation
 */
// Reactivity
export { Signal, Computed, Effect, signal, computed, effect, batch, untracked, isSignal, isComputed, isReactive, } from './signals/index.js';
// DOM helpers
export { h, text, appendChild, bindAttr, bindConditional, bindList, } from './dom/index.js';
// Component runtime
export { mount, defineComponent, watch, onMount, onUnmount, } from './component/index.js';
// Router
export { Router, createRouter, linkProps, registerRouter, } from './router/index.js';
// Error handling & debugging
export { initErrorCapture, mountErrorOverlay, createErrorOverlay, logError, clearErrors, dismissError, showOverlay, hideOverlay, getErrors, isOverlayVisible, resolveImportError, } from './error/index.js';
export { setDebugEnabled, isDebugEnabled, profileRender, getProfileData, clearProfileData, inspectSignals, debug, } from './debug/index.js';
// Data fetching
export { useFetch, prefetch, clearFetchCache, } from './fetch/index.js';
// Page loader
export { configureLoader, showLoader, hideLoader, isLoading, mountLoader, withLoader, } from './loader/index.js';
// SSR
export { renderToString, renderToDocument, } from './ssr/index.js';
// Utility CSS (Tailwind-like)
export { configureUtilities, generateUtilityCss, injectUtilityCss, } from './utils/index.js';
/** BirrStack version. */
export const VERSION = '0.0.3';
//# sourceMappingURL=index.js.map