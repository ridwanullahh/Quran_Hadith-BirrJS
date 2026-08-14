/**
 * BirrStack DOM utilities — lightweight DOM creation and reactive binding.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * These helpers connect the signals runtime to actual DOM nodes.
 * The compiler generates calls to these helpers from `.birr` templates.
 */
import { Signal, Computed } from '../signals/index.js';
/**
 * Create an element with attributes and children in a single call.
 * Avoids the verbosity of createElement + setAttribute + appendChild.
 */
export declare function h(tag: string, props?: Record<string, unknown>, children?: (Node | string | Signal<unknown> | Computed<unknown> | null | undefined | false)[]): HTMLElement;
/** Append a child that may be a static value or a reactive cell. */
export declare function appendChild(parent: Node, child: Node | string | Signal<unknown> | Computed<unknown> | null | undefined | false): void;
/** Bind an element attribute to a reactive cell. */
export declare function bindAttr(el: HTMLElement, attr: string, value: unknown): void;
/** Bind a conditional (birr:if) — insert/remove the element based on a reactive boolean. */
export declare function bindConditional(parent: Node, anchor: Comment, condition: Signal<boolean> | Computed<boolean> | boolean, factory: () => Node): void;
/** Bind a list (birr:for) — reconcile a reactive array into DOM nodes. */
export declare function bindList<T>(parent: Node, anchor: Comment, source: Signal<T[]> | Computed<T[]> | T[], render: (item: T, index: number) => Node, getKey?: (item: T, index: number) => string): void;
/** Create a text node bound to a reactive cell. */
export declare function text(value: string | Signal<unknown> | Computed<unknown>): Text;
//# sourceMappingURL=index.d.ts.map