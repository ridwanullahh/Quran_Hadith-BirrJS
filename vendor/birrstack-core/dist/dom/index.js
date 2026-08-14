/**
 * BirrStack DOM utilities — lightweight DOM creation and reactive binding.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * These helpers connect the signals runtime to actual DOM nodes.
 * The compiler generates calls to these helpers from `.birr` templates.
 */
import { effect, isReactive } from '../signals/index.js';
/**
 * Create an element with attributes and children in a single call.
 * Avoids the verbosity of createElement + setAttribute + appendChild.
 */
export function h(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('birr:on:')) {
            const event = key.slice('birr:on:'.length);
            if (typeof value === 'function') {
                el.addEventListener(event, value);
            }
        }
        else if (key.startsWith('birr:bind:')) {
            const attr = key.slice('birr:bind:'.length);
            bindAttr(el, attr, value);
        }
        else if (key === 'class' && isReactive(value)) {
            bindAttr(el, 'class', value);
        }
        else if (key === 'style' && typeof value === 'object' && value !== null && !isReactive(value)) {
            for (const [prop, val] of Object.entries(value)) {
                el.style[prop] = val;
            }
        }
        else if (value !== null && value !== undefined && value !== false) {
            el.setAttribute(key, String(value));
        }
    }
    for (const child of children) {
        appendChild(el, child);
    }
    return el;
}
/** Append a child that may be a static value or a reactive cell. */
export function appendChild(parent, child) {
    if (child === null || child === undefined || child === false)
        return;
    if (typeof child === 'string' || typeof child === 'number') {
        parent.appendChild(document.createTextNode(String(child)));
        return;
    }
    if (child instanceof Node) {
        parent.appendChild(child);
        return;
    }
    if (isReactive(child)) {
        const marker = document.createTextNode('');
        const textNode = document.createTextNode(String(child.value));
        parent.appendChild(marker);
        parent.appendChild(textNode);
        effect(() => {
            textNode.nodeValue = String(child.value);
        });
        return;
    }
}
/** Bind an element attribute to a reactive cell. */
export function bindAttr(el, attr, value) {
    if (isReactive(value)) {
        const reactive = value;
        effect(() => {
            const v = reactive.value;
            if (v === null || v === undefined || v === false) {
                el.removeAttribute(attr);
            }
            else {
                el.setAttribute(attr, String(v));
            }
        });
    }
    else if (value !== null && value !== undefined && value !== false) {
        el.setAttribute(attr, String(value));
    }
}
/** Bind a conditional (birr:if) — insert/remove the element based on a reactive boolean. */
export function bindConditional(parent, anchor, condition, factory) {
    if (typeof condition === 'boolean') {
        if (condition) {
            parent.insertBefore(factory(), anchor);
        }
        return;
    }
    let current = null;
    const reactive = condition;
    effect(() => {
        const shouldShow = Boolean(reactive.value);
        if (shouldShow && current === null) {
            current = factory();
            parent.insertBefore(current, anchor);
        }
        else if (!shouldShow && current !== null) {
            parent.removeChild(current);
            current = null;
        }
    });
}
/** Bind a list (birr:for) — reconcile a reactive array into DOM nodes. */
export function bindList(parent, anchor, source, render, getKey) {
    if (Array.isArray(source)) {
        for (let i = 0; i < source.length; i++) {
            parent.insertBefore(render(source[i], i), anchor);
        }
        return;
    }
    let rendered = new Map();
    const reactive = source;
    effect(() => {
        const items = reactive.value;
        const newRendered = new Map();
        const keys = new Set();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const key = getKey ? getKey(item, i) : `__idx_${i}`;
            keys.add(key);
            let node = rendered.get(key);
            if (node === undefined) {
                node = render(item, i);
            }
            newRendered.set(key, node);
            parent.insertBefore(node, anchor);
        }
        // Remove nodes that are no longer present
        for (const [key, node] of rendered) {
            if (!keys.has(key)) {
                parent.removeChild(node);
            }
        }
        rendered = newRendered;
    });
}
/** Create a text node bound to a reactive cell. */
export function text(value) {
    if (isReactive(value)) {
        const reactive = value;
        const node = document.createTextNode(String(reactive.value));
        effect(() => {
            node.nodeValue = String(reactive.value);
        });
        return node;
    }
    return document.createTextNode(String(value));
}
//# sourceMappingURL=index.js.map