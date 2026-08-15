/**
 * BirrStack Page Loader — customizable loading indicator.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Shows a loading bar at the top of the page during navigation/fetching.
 * Automatically disabled on non-web platforms.
 * Each app can customize the color, height, and behavior, or disable it entirely.
 */
import { type Signal } from '../signals/index.js';
export interface LoaderOptions {
    color?: string;
    height?: number;
    enabled?: boolean;
}
/** Configure the page loader. */
export declare function configureLoader(opts: LoaderOptions): void;
/** Show the loader. */
export declare function showLoader(): void;
/** Hide the loader. */
export declare function hideLoader(): void;
/** Check if the loader is currently visible. */
export declare function isLoading(): Signal<boolean>;
/** Mount the loader element to the DOM. */
export declare function mountLoader(opts?: LoaderOptions): void;
/** Wrap a navigation function to show/hide the loader automatically. */
export declare function withLoader<T extends (...args: unknown[]) => unknown>(fn: T): T;
//# sourceMappingURL=index.d.ts.map