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
 * Expressions in interpolations, birr:if, birr:for, birr:bind, and birr:on
 * are transformed so that bare identifiers referring to reactive state
 * (Signals/Computeds) are auto-unwrapped via __unwrap(). This lets users
 * write `{{ count }}` instead of `{{ count.value }}` and
 * `birr:if="activeApp === null"` instead of `birr:if="activeApp.value === null"`.
 *
 * Generated code is a string. The compiler returns:
 *   { code: string, imports: string[] }
 */
const JS_KEYWORDS = new Set([
    'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
    'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
    'this', 'arguments', 'super', 'class', 'function', 'return',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
    'break', 'continue', 'throw', 'try', 'catch', 'finally',
    'var', 'let', 'const', 'yield', 'await', 'async', 'static',
    'extends', 'import', 'export', 'from', 'as', 'typeof',
]);
/**
 * Transform an expression string so that bare identifiers referring to
 * reactive state are wrapped with __unwrap(...). Identifiers that follow
 * a `.` (property access), are object-literal keys, or are JS keywords
 * are left alone.
 */
function transformExpression(expr, stateKeys) {
    if (expr.length === 0)
        return expr;
    let out = '';
    let i = 0;
    while (i < expr.length) {
        const c = expr[i];
        // String literal — copy verbatim
        if (c === '"' || c === "'" || c === '`') {
            const quote = c;
            out += c;
            i++;
            while (i < expr.length) {
                const ch = expr[i];
                out += ch;
                if (ch === '\\') {
                    out += expr[i + 1] ?? '';
                    i += 2;
                    continue;
                }
                i++;
                if (ch === quote)
                    break;
            }
            continue;
        }
        // Line comment
        if (c === '/' && expr[i + 1] === '/') {
            while (i < expr.length && expr[i] !== '\n') {
                out += expr[i];
                i++;
            }
            continue;
        }
        // Block comment
        if (c === '/' && expr[i + 1] === '*') {
            out += '/*';
            i += 2;
            while (i < expr.length && !(expr[i] === '*' && expr[i + 1] === '/')) {
                out += expr[i];
                i++;
            }
            out += '*/';
            i += 2;
            continue;
        }
        // Number literal
        if (/[0-9]/.test(c)) {
            let num = '';
            while (i < expr.length && /[0-9a-fA-FxXoObBeE._+\-]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            out += num;
            continue;
        }
        // Identifier
        if (/[A-Za-z_$]/.test(c)) {
            let ident = '';
            while (i < expr.length && /[A-Za-z0-9_$]/.test(expr[i])) {
                ident += expr[i];
                i++;
            }
            // Check if it's a property access (preceded by .)
            // Look back in `out` for a non-whitespace char
            let k = out.length - 1;
            while (k >= 0 && /\s/.test(out[k]))
                k--;
            const prevChar = k >= 0 ? out[k] : '';
            const isPropertyAccess = prevChar === '.';
            // Check if it's an object-literal key (followed by ':')
            let j = i;
            while (j < expr.length && /\s/.test(expr[j]))
                j++;
            const nextChar = j < expr.length ? expr[j] : '';
            // An object key is `ident:` where the colon is NOT followed by `=`
            // (to distinguish from ternary `cond ? a : b`). We approximate by
            // checking that the previous non-ws char is `{` or `,`.
            let isObjKey = false;
            if (nextChar === ':') {
                // Look back for `{` or `,` (object literal context)
                let p = out.length - 1;
                while (p >= 0 && /\s/.test(out[p]))
                    p--;
                const before = p >= 0 ? out[p] : '';
                if (before === '{' || before === ',') {
                    // Check it's not a ternary: ternary has `?` somewhere before at same depth
                    // Simple heuristic: if there's a `?` between the last `{` or `,` and here, it's a ternary
                    let hasQuestion = false;
                    for (let q = p + 1; q < out.length; q++) {
                        if (out[q] === '?') {
                            hasQuestion = true;
                            break;
                        }
                        if (out[q] === '{' || out[q] === ',')
                            break;
                    }
                    if (!hasQuestion)
                        isObjKey = true;
                }
            }
            if (isPropertyAccess || isObjKey || JS_KEYWORDS.has(ident) || !stateKeys.has(ident)) {
                out += ident;
            }
            else {
                out += `__unwrap(${ident})`;
            }
            continue;
        }
        // Any other char (operators, punctuation, whitespace)
        out += c;
        i++;
    }
    return out;
}
/** Check if an expression is a simple identifier (no operators/calls). */
function isSimpleIdentifier(expr) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(expr.trim());
}
/** Generate a render function from a template AST. */
export function generateRender(nodes, options = {}) {
    const imports = new Set(['h']);
    const body = [];
    const stateKeys = options.stateKeys ?? new Set();
    const scopeId = options.scopeId ?? '';
    const ctx = { imports, stateKeys, scopeId };
    for (const node of nodes) {
        const stmt = generateNode(node, ctx, 'host');
        if (stmt)
            body.push(stmt);
    }
    return {
        code: body.join('\n'),
        imports,
    };
}
function generateNode(node, ctx, parentVar) {
    switch (node.type) {
        case 'element':
            return generateElement(node, ctx, parentVar);
        case 'text':
            return generateText(node, parentVar);
        case 'interpolation':
            return generateInterpolation(node, ctx, parentVar);
        default:
            return null;
    }
}
function generateElement(node, ctx, parentVar) {
    if (!node.tag || !node.attrs)
        return '';
    const { imports, stateKeys } = ctx;
    const attrs = node.attrs;
    // birr:if — conditional rendering
    const ifExpr = attrs['birr:if'];
    if (ifExpr) {
        imports.add('bindConditional');
        imports.add('computed');
        const anchorVar = freshVar('anchor');
        const factoryBody = generateChildren(node.children ?? [], ctx, '__host');
        // Always wrap in computed so the expression re-evaluates when signals change.
        // transformExpression auto-unwraps state identifiers.
        const condExpr = isSimpleIdentifier(ifExpr)
            ? ifExpr // single identifier — pass the signal directly; bindConditional handles .value
            : `computed(() => ${transformExpression(ifExpr, stateKeys)})`;
        return `const ${anchorVar} = document.createComment('birr:if');
${parentVar}.appendChild(${anchorVar});
bindConditional(${parentVar}, ${anchorVar}, ${condExpr}, () => {
  const __host = h('${node.tag}', ${propsObject(attrs, ctx)}, []);
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
        const childCtx = {
            imports: ctx.imports,
            stateKeys: new Set([...stateKeys, itemName, indexName]),
            scopeId: ctx.scopeId,
        };
        const childBody = generateChildren(node.children ?? [], childCtx, '__host', [`${itemName}`, `${indexName}`]);
        const keyExpr = childAttrs['birr:key'];
        delete childAttrs['birr:key'];
        // For the list source: if it's a simple identifier, pass directly (bindList handles signals).
        // Otherwise wrap in computed.
        const sourceExpr = isSimpleIdentifier(listExpr)
            ? listExpr
            : (() => {
                imports.add('computed');
                return `computed(() => ${transformExpression(listExpr, stateKeys)})`;
            })();
        // For the key expression: transform identifiers (iteration vars are in scope)
        const keyExprTransformed = keyExpr
            ? transformExpression(keyExpr, childCtx.stateKeys)
            : null;
        return `const ${anchorVar} = document.createComment('birr:for');
${parentVar}.appendChild(${anchorVar});
bindList(${parentVar}, ${anchorVar}, ${sourceExpr}, (${itemName}, ${indexName}) => {
  const __host = h('${node.tag}', ${propsObject(childAttrs, ctx)}, []);
${childBody}
  return __host;
}${keyExprTransformed ? `, (${itemName}, ${indexName}) => ${keyExprTransformed}` : ''});`;
    }
    // Regular element
    const hostVar = freshVar('el');
    const childBody = generateChildren(node.children ?? [], ctx, hostVar);
    return `const ${hostVar} = h('${node.tag}', ${propsObject(attrs, ctx)}, []);
${parentVar}.appendChild(${hostVar});
${childBody}`;
}
function generateChildren(children, ctx, parentVar, scopeVars = []) {
    const decls = scopeVars.length > 0 ? `  // scope: ${scopeVars.join(', ')}` : '';
    const stmts = [decls];
    for (const child of children) {
        const s = generateNode(child, ctx, parentVar);
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
function generateInterpolation(node, ctx, parentVar) {
    ctx.imports.add('text');
    const expr = node.expression ?? '';
    // If it's a simple identifier, pass directly — text() handles reactive sources.
    // Otherwise wrap in a computed so the expression re-evaluates on dependency change.
    if (isSimpleIdentifier(expr)) {
        return `${parentVar}.appendChild(text(${expr}));`;
    }
    ctx.imports.add('computed');
    const transformed = transformExpression(expr, ctx.stateKeys);
    return `${parentVar}.appendChild(text(computed(() => ${transformed})));`;
}
function propsObject(attrs, ctx) {
    const { imports, stateKeys, scopeId } = ctx;
    const entries = [];
    // Add the scopeId attribute to every element for scoped CSS matching.
    if (scopeId) {
        entries.push(`${JSON.stringify(scopeId)}: ""`);
    }
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'birr:if' || key === 'birr:for')
            continue;
        if (value === '') {
            entries.push(`${JSON.stringify(key)}: ""`);
        }
        else if (key.startsWith('birr:on:')) {
            const event = key.slice('birr:on:'.length);
            // If the value is a simple identifier (function name), pass directly.
            // Otherwise wrap in an arrow function so it's not called at render time.
            if (isSimpleIdentifier(value)) {
                entries.push(`${JSON.stringify(`birr:on:${event}`)}: ${value}`);
            }
            else {
                // Transform identifiers in the handler expression too
                const transformed = transformExpression(value, stateKeys);
                entries.push(`${JSON.stringify(`birr:on:${event}`)}: ($event) => { ${transformed}; }`);
            }
        }
        else if (key.startsWith('birr:bind:')) {
            const attr = key.slice('birr:bind:'.length);
            // If the value is a simple identifier (signal), pass directly — bindAttr handles it.
            // Otherwise wrap in a computed.
            if (isSimpleIdentifier(value)) {
                entries.push(`${JSON.stringify(`birr:bind:${attr}`)}: ${value}`);
            }
            else {
                imports.add('computed');
                const transformed = transformExpression(value, stateKeys);
                entries.push(`${JSON.stringify(`birr:bind:${attr}`)}: computed(() => ${transformed})`);
            }
        }
        else {
            // Static attribute — use string value. But if the value contains {{ }}, leave as-is
            // (the DOM helper will set it literally). For class/style bindings that interpolate,
            // the user should use birr:bind.
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