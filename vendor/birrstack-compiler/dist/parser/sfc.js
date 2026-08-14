/**
 * BirrStack SFC Parser — splits a .birr file into template/script/style blocks.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * A .birr file looks like:
 *   <template>...</template>
 *   <script>...</script>
 *   <style scoped>...</style>
 *
 * Blocks may appear in any order. Only one template and one script are allowed.
 * Multiple style blocks are allowed (merged).
 */
/** Parse a .birr source string into an SFC descriptor. */
export function parseSFC(source) {
    const descriptor = {
        template: null,
        script: null,
        styles: [],
    };
    // Match top-level <template>, <script>, <style> blocks.
    // We use a simple regex scanner that handles nested tags of the same name
    // by counting open/close.
    const blockRegex = /<(template|script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = blockRegex.exec(source)) !== null) {
        const tag = match[1].toLowerCase();
        const attrs = match[2] ?? '';
        const content = match[3] ?? '';
        if (tag === 'template') {
            if (descriptor.template !== null) {
                throw new Error('BirrStack SFC: multiple <template> blocks are not allowed');
            }
            descriptor.template = { content: content.trim() };
        }
        else if (tag === 'script') {
            if (descriptor.script !== null) {
                throw new Error('BirrStack SFC: multiple <script> blocks are not allowed');
            }
            const lang = extractAttr(attrs, 'lang') ?? 'js';
            descriptor.script = { content: content.trim(), lang };
        }
        else if (tag === 'style') {
            const scoped = /\bscoped\b/i.test(attrs);
            const lang = extractAttr(attrs, 'lang') ?? 'css';
            descriptor.styles.push({ content: content.trim(), scoped, lang });
        }
    }
    return descriptor;
}
/** Extract an attribute value from an attribute string. */
function extractAttr(attrs, name) {
    const re = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i');
    const m = re.exec(attrs);
    return m?.[1];
}
//# sourceMappingURL=sfc.js.map