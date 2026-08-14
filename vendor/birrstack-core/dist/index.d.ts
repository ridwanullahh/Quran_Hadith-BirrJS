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
export { Signal, Computed, Effect, signal, computed, effect, batch, untracked, isSignal, isComputed, isReactive, } from './signals/index.js';
export { h, text, appendChild, bindAttr, bindConditional, bindList, } from './dom/index.js';
export { mount, defineComponent, watch, onMount, onUnmount, type ComponentDefinition, type ComponentInstance, type ComponentContext, type BirrProps, type Slot, } from './component/index.js';
export { Router, createRouter, linkProps, registerRouter, type RouteDefinition, type RouteLocation, type RouterOptions, type RouterMode, } from './router/index.js';
export { initErrorCapture, mountErrorOverlay, createErrorOverlay, logError, clearErrors, dismissError, showOverlay, hideOverlay, getErrors, isOverlayVisible, resolveImportError, type BirrError, } from './error/index.js';
export { setDebugEnabled, isDebugEnabled, profileRender, getProfileData, clearProfileData, inspectSignals, debug, } from './debug/index.js';
/** BirrStack version. */
export declare const VERSION = "0.0.2";
//# sourceMappingURL=index.d.ts.map