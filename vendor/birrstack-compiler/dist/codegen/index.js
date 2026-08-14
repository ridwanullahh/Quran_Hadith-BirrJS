/**
 * BirrStack Code Generator — walks a template AST and emits a render function.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * The generated render function uses birrstack-core DOM helpers:
 *  - h(tag, props, children)
 *  - text(value)
 *  - bindConditional(parent, anchor, condition, factory)
 *  - bindList(parent, anchor, source, render, getKey)
 *
 * Generated code is a string. The compiler returns:
 *   { code: string, imports: string[] }
 */
/** Generate a render function from a template AST. */
export function generateRender(nodes) {
    const imports = new Set(['h']);
    const body = [];
    for (const node of nodes) {
        const stmt = generateNode(node, imports, 'host');
        if (stmt)
            body.push(stmt);
    }
    return {
        code: body.join('\n'),
        imports,
    };
}
function generateNode(node, imports, parentVar) {
    switch (node.type) {
        case 'element':
            return generateElement(node, imports, parentVar);
        case 'text':
            return generateText(node, parentVar);
        case 'interpolation':
            return generateInterpolation(node, imports, parentVar);
        default:
            return null;
    }
}
function generateElement(node, imports, parentVar) {
    if (!node.tag || !node.attrs)
        return '';
    const attrs = node.attrs;
    // birr:if — conditional rendering
    const ifExpr = attrs['birr:if'];
    if (ifExpr) {
        imports.add('bindConditional');
        const anchorVar = freshVar('anchor');
        const factoryBody = generateChildren(node.children ?? [], imports, '__host');
        return `const ${anchorVar} = document.createComment('birr:if');
${parentVar}.appendChild(${anchorVar});
bindConditional(${parentVar}, ${anchorVar}, ${ifExpr}, () => {
  const __host = h('${node.tag}', ${propsObject(attrs, imports)}, []);
${factoryBody}
  return __host;
});`;
    }
    // birr:for — list rendering
    const forExpr = attrs['birr:for'];
    if (forExpr) {
        imports.add('bindList');
        const anchorVar = freshVar('anchor');
        // Parse "item in items" or "(item, index) in items"
        const m = /^(\([^)]+\)|\w+)\s+in\s+(.+)$/.exec(forExpr);
        if (!m)
            throw new Error(`BirrStack codegen: invalid birr:for expression "${forExpr}"`);
        const itemBinding = m[1];
        const listExpr = m[2];
        let itemName = 'item';
        let indexName = 'index';
        const parenMatch = /^\(\s*(\w+)\s*,\s*(\w+)\s*\)$/.exec(itemBinding);
        if (parenMatch) {
            itemName = parenMatch[1];
            indexName = parenMatch[2];
        }
        else {
            itemName = itemBinding;
        }
        // Strip birr:for from attrs passed to the element
        const childAttrs = { ...attrs };
        delete childAttrs['birr:for'];
        // Children are appended to __host (the element created inside the callback)
        const childBody = generateChildren(node.children ?? [], imports, '__host', [`${itemName}`, `${indexName}`]);
        const keyExpr = childAttrs['birr:key'];
        delete childAttrs['birr:key'];
        return `const ${anchorVar} = document.createComment('birr:for');
${parentVar}.appendChild(${anchorVar});
bindList(${parentVar}, ${anchorVar}, ${listExpr}, (${itemName}, ${indexName}) => {
  const __host = h('${node.tag}', ${propsObject(childAttrs, imports)}, []);
${childBody}
  return __host;
}${keyExpr ? `, (${itemName}, ${indexName}) => ${keyExpr}` : ''});`;
    }
    // Regular element
    const hostVar = freshVar('el');
    const childBody = generateChildren(node.children ?? [], imports, hostVar);
    return `const ${hostVar} = h('${node.tag}', ${propsObject(attrs, imports)}, []);
${parentVar}.appendChild(${hostVar});
${childBody}`;
}
function generateChildren(children, imports, parentVar, scopeVars = []) {
    const decls = scopeVars.length > 0 ? `  // scope: ${scopeVars.join(', ')}` : '';
    const stmts = [decls];
    for (const child of children) {
        const s = generateNode(child, imports, parentVar);
        if (s)
            stmts.push(s);
    }
    return stmts.filter(Boolean).join('\n');
}
function generateText(node, parentVar) {
    const trimmed = node.text ?? '';
    if (trimmed.length === 0)
        return '';
    return `${parentVar}.appendChild(document.createTextNode(${JSON.stringify(trimmed)}));`;
}
function generateInterpolation(node, imports, parentVar) {
    imports.add('text');
    return `${parentVar}.appendChild(text(${node.expression}));`;
}
function propsObject(attrs, imports) {
    const entries = [];
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'birr:if' || key === 'birr:for')
            continue;
        if (value === '') {
            entries.push(`${JSON.stringify(key)}: ""`);
        }
        else if (key.startsWith('birr:on:')) {
            const event = key.slice('birr:on:'.length);
            entries.push(`${JSON.stringify(`birr:on:${event}`)}: ${value}`);
        }
        else if (key.startsWith('birr:bind:')) {
            const attr = key.slice('birr:bind:'.length);
            entries.push(`${JSON.stringify(`birr:bind:${attr}`)}: ${value}`);
        }
        else {
            // Static attribute — use string value
            entries.push(`${JSON.stringify(key)}: ${JSON.stringify(value)}`);
        }
    }
    void imports;
    return `{ ${entries.join(', ')} }`;
}
let varCounter = 0;
function freshVar(prefix) {
    return `__${prefix}_${varCounter++}`;
}
/** Reset the variable counter (for tests). */
export function __resetVarCounter() {
    varCounter = 0;
}
//# sourceMappingURL=index.js.map