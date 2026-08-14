/**
 * BirrStack Template Parser — converts HTML template string into an AST.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A focused HTML parser supporting the subset needed for .birr templates:
 *  - Elements with attributes (including birr:* directives)
 *  - Text nodes with {{ }} interpolation
 *  - Self-closing tags
 *  - Void elements (img, br, input, etc.)
 *  - No support for raw HTML comments in templates (stripped)
 *
 * Not a full HTML5 parser — intentionally minimal for small bundle size.
 */
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
/** Parse a template string into a tree of TemplateNode. */
export function parseTemplate(source) {
    const parser = new TemplateParser(source);
    return parser.parseRoot();
}
class TemplateParser {
    pos = 0;
    src;
    constructor(src) {
        this.src = src;
    }
    parseRoot() {
        const nodes = [];
        this.skipWhitespace();
        while (this.pos < this.src.length) {
            const node = this.parseNode();
            if (node !== null)
                nodes.push(node);
            this.skipWhitespace();
        }
        return nodes;
    }
    parseNode() {
        this.skipWhitespace();
        if (this.pos >= this.src.length)
            return null;
        // Comment
        if (this.startsWith('<!--')) {
            const end = this.src.indexOf('-->', this.pos + 4);
            this.pos = end === -1 ? this.src.length : end + 3;
            return null;
        }
        // Element
        if (this.peek() === '<') {
            return this.parseElement();
        }
        // Text / interpolation
        return this.parseText();
    }
    parseElement() {
        // Expect '<'
        this.pos++; // consume '<'
        // Tag name
        const tag = this.readTagName();
        if (!tag)
            throw new Error(`BirrStack parse: expected tag name at pos ${this.pos}`);
        // Attributes
        const attrs = this.parseAttrs();
        // Self-closing or void
        if (this.startsWith('/>')) {
            this.pos += 2;
            return { type: 'element', tag, attrs, children: [] };
        }
        if (this.peek() === '>')
            this.pos++; // consume '>'
        if (VOID_ELEMENTS.has(tag.toLowerCase())) {
            return { type: 'element', tag, attrs, children: [] };
        }
        // Children
        const children = [];
        this.skipWhitespace();
        while (this.pos < this.src.length) {
            // Check for closing tag
            if (this.startsWith(`</${tag}`)) {
                // consume closing tag
                const end = this.src.indexOf('>', this.pos);
                this.pos = end === -1 ? this.src.length : end + 1;
                break;
            }
            const child = this.parseNode();
            if (child !== null)
                children.push(child);
            this.skipWhitespace();
        }
        return { type: 'element', tag, attrs, children };
    }
    parseAttrs() {
        const attrs = {};
        while (this.pos < this.src.length) {
            this.skipWhitespace();
            if (this.peek() === '>' || this.startsWith('/>'))
                break;
            // Attribute name
            const name = this.readAttrName();
            if (!name)
                break;
            // Value (optional)
            this.skipWhitespace();
            if (this.peek() === '=') {
                this.pos++; // consume '='
                this.skipWhitespace();
                const value = this.readAttrValue();
                attrs[name] = value;
            }
            else {
                attrs[name] = '';
            }
        }
        return attrs;
    }
    readTagName() {
        let start = this.pos;
        while (this.pos < this.src.length) {
            const c = this.src[this.pos];
            if (/[A-Za-z0-9\-_:]/.test(c)) {
                this.pos++;
            }
            else {
                break;
            }
        }
        return this.src.slice(start, this.pos);
    }
    readAttrName() {
        let start = this.pos;
        while (this.pos < this.src.length) {
            const c = this.src[this.pos];
            if (/[A-Za-z0-9\-_:.@]/.test(c)) {
                this.pos++;
            }
            else {
                break;
            }
        }
        return this.src.slice(start, this.pos);
    }
    readAttrValue() {
        const quote = this.peek();
        if (quote !== '"' && quote !== "'") {
            // Unquoted value
            let start = this.pos;
            while (this.pos < this.src.length && !/[\s>]/.test(this.src[this.pos])) {
                this.pos++;
            }
            return this.src.slice(start, this.pos);
        }
        this.pos++; // consume opening quote
        let start = this.pos;
        while (this.pos < this.src.length && this.src[this.pos] !== quote) {
            this.pos++;
        }
        const value = this.src.slice(start, this.pos);
        if (this.pos < this.src.length)
            this.pos++; // consume closing quote
        return value;
    }
    parseText() {
        let start = this.pos;
        let text = '';
        while (this.pos < this.src.length) {
            const c = this.src[this.pos];
            if (c === '<')
                break;
            // Check for interpolation
            if (c === '{' && this.startsWith('{{')) {
                // Flush any accumulated text
                if (text.length > 0) {
                    // we'll return the text node and the interpolation will be picked up next call,
                    // but since parseNode returns one node, we need to handle this differently.
                    // Reset pos to start of interpolation and return the text.
                    break;
                }
                // Parse interpolation
                this.pos += 2; // consume {{
                let exprStart = this.pos;
                while (this.pos < this.src.length && !this.startsWith('}}')) {
                    this.pos++;
                }
                const expr = this.src.slice(exprStart, this.pos).trim();
                if (this.startsWith('}}'))
                    this.pos += 2;
                return { type: 'interpolation', expression: expr };
            }
            text += c;
            this.pos++;
        }
        void start;
        if (text.trim().length === 0)
            return null;
        return { type: 'text', text };
    }
    skipWhitespace() {
        while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) {
            this.pos++;
        }
    }
    peek() {
        return this.src[this.pos] ?? '';
    }
    startsWith(s) {
        return this.src.startsWith(s, this.pos);
    }
}
//# sourceMappingURL=template.js.map