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
export interface StyleBlock {
    content: string;
    scoped: boolean;
    lang: string;
}
export interface SFCDescriptor {
    template: {
        content: string;
    } | null;
    script: {
        content: string;
        lang: string;
    } | null;
    styles: StyleBlock[];
}
/** Parse a .birr source string into an SFC descriptor. */
export declare function parseSFC(source: string): SFCDescriptor;
//# sourceMappingURL=sfc.d.ts.map