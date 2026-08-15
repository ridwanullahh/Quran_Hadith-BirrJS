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
export { useFetch, prefetch, clearFetchCache, type FetchOptions, type FetchResult, } from './fetch/index.js';
export { configureLoader, showLoader, hideLoader, isLoading, mountLoader, withLoader, type LoaderOptions, } from './loader/index.js';
export { renderToString, renderToDocument, type SSRContext, } from './ssr/index.js';
export { configureUtilities, generateUtilityCss, injectUtilityCss, type UtilityConfig, } from './utils/index.js';
export { useEffect, useStore, useMemo, useCallback, useRef, useState, useToggle, usePrevious, useDebounce, } from './hooks/index.js';
export { sanitizeHtml, stripHtml, isValidEmail, isValidUrl, isValidPhone, isStrongPassword, sanitizeSql, truncate, generateCSRFToken, RateLimiter, validateForm, generateCSP, type FieldValidation, type ValidationResult, } from './security/index.js';
export { icon, iconPath, iconElement, iconNames, type IconOptions, } from './icons/index.js';
/** BirrStack version. */
export declare const VERSION = "0.0.5";
//# sourceMappingURL=index.d.ts.map