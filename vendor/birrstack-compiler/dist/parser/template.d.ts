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
export interface TemplateNode {
    type: 'element' | 'text' | 'interpolation';
    tag?: string;
    attrs?: Record<string, string>;
    children?: TemplateNode[];
    text?: string;
    expression?: string;
}
/** Parse a template string into a tree of TemplateNode. */
export declare function parseTemplate(source: string): TemplateNode[];
//# sourceMappingURL=template.d.ts.map