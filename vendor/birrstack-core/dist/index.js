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
export { Signal, Computed, Effect, signal, computed, effect, batch, untracked, } from './signals/index.js';
// DOM helpers
export { h, text, appendChild, bindAttr, bindConditional, bindList, } from './dom/index.js';
// Component runtime
export { mount, defineComponent, watch, onMount, onUnmount, } from './component/index.js';
// Router
export { Router, createRouter, linkProps, registerRouter, } from './router/index.js';
/** BirrStack version. */
export const VERSION = '0.0.1';
//# sourceMappingURL=index.js.map