/**
 * BirrStack SSR — Server-Side Rendering support.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Provides renderToString() for server-side rendering of BirrStack components.
 * The output HTML can be hydrated by the client runtime.
 */
/** Render a component to an HTML string (server-side). */
export function renderToString(component, props = {}, slots = {}) {
    const ctx = {
        host: {},
        props,
        slots,
        onUnmount: () => { },
        emit: () => { },
    };
    try {
        const state = component.setup(ctx);
        const root = component.render(state, ctx);
        return nodeToString(root);
    }
    catch (e) {
        console.error('BirrStack SSR error:', e);
        return '<div>BirrStack SSR Error</div>';
    }
}
/** Convert a DOM-like node to an HTML string. */
function nodeToString(node) {
    if (typeof node === 'string')
        return escapeHtml(node);
    if (typeof node === 'number')
        return String(node);
    if (!node || typeof node !== 'object')
        return '';
    // Check if it's a DOM-like object with tagName
    const el = node;
    // Text node
    if (el.nodeType === 3 && el.textContent !== undefined) {
        return escapeHtml(el.textContent);
    }
    const tag = el.tagName?.toLowerCase() || el.nodeName?.toLowerCase();
    if (!tag)
        return '';
    // Build attributes
    let attrs = '';
    // Try to read from a mock element
    const mockEl = node;
    if (mockEl._attrs) {
        for (const [key, value] of Object.entries(mockEl._attrs)) {
            attrs += ` ${key}="${escapeAttr(value)}"`;
        }
    }
    // Build children
    let children = '';
    if (mockEl._children) {
        for (const child of mockEl._children) {
            children += nodeToString(child);
        }
    }
    else if (el.textContent) {
        children = escapeHtml(el.textContent);
    }
    // Void elements
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    if (voidElements.includes(tag)) {
        return `<${tag}${attrs} />`;
    }
    return `<${tag}${attrs}>${children}</${tag}>`;
}
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function escapeAttr(s) {
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
/** Render an app to a full HTML document (for SSR). */
export function renderToDocument(component, options = {}) {
    const body = renderToString(component);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title ?? 'BirrStack App'}</title>
  ${options.head ?? ''}
</head>
<body>
  <div id="app">${body}</div>
  <script type="module" src="./assets/index.js"></script>
</body>
</html>`;
}
//# sourceMappingURL=index.js.map