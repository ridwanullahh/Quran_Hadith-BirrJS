/**
 * BirrStack Utility CSS System — Tailwind-like class-first approach.
 *
 * BismiLLAH Ar-Rahman Ar-Raheem.
 */
const DEFAULT_CONFIG = {
    spacing: { '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem', '16': '4rem', '20': '5rem' },
    colors: { 'primary': '#05B34D', 'accent': '#F2B91C', 'dark': '#181F25', 'light': '#E9FBF1', 'white': '#FFFFFF', 'black': '#000000', 'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937', 'gray-900': '#111827', 'red': '#ef4444', 'green': '#10b981', 'blue': '#3b82f6', 'yellow': '#f59e0b', 'purple': '#8b5cf6' },
    fontSize: { 'xs': '0.75rem', 'sm': '0.875rem', 'base': '1rem', 'lg': '1.125rem', 'xl': '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' },
    screens: { 'sm': '640px', 'md': '768px', 'lg': '1024px', 'xl': '1280px' },
    borderRadius: { 'none': '0', 'sm': '0.125rem', 'md': '0.375rem', 'lg': '0.5rem', 'xl': '0.75rem', '2xl': '1rem', 'full': '9999px' },
};
let config = DEFAULT_CONFIG;
export function configureUtilities(custom) {
    config = { ...DEFAULT_CONFIG, ...custom,
        spacing: { ...DEFAULT_CONFIG.spacing, ...custom.spacing },
        colors: { ...DEFAULT_CONFIG.colors, ...custom.colors },
        fontSize: { ...DEFAULT_CONFIG.fontSize, ...custom.fontSize },
        screens: { ...DEFAULT_CONFIG.screens, ...custom.screens },
        borderRadius: { ...DEFAULT_CONFIG.borderRadius, ...custom.borderRadius },
    };
}
export function generateUtilityCss() {
    let css = '/* BirrStack Utility CSS */\n';
    for (const [key, val] of Object.entries(config.spacing ?? {})) {
        css += `.p-${key}{padding:${val}}.px-${key}{padding-left:${val};padding-right:${val}}.py-${key}{padding-top:${val};padding-bottom:${val}}.pt-${key}{padding-top:${val}}.pr-${key}{padding-right:${val}}.pb-${key}{padding-bottom:${val}}.pl-${key}{padding-left:${val}}.m-${key}{margin:${val}}.mx-${key}{margin-left:${val};margin-right:${val}}.my-${key}{margin-top:${val};margin-bottom:${val}}.mt-${key}{margin-top:${val}}.mr-${key}{margin-right:${val}}.mb-${key}{margin-bottom:${val}}.ml-${key}{margin-left:${val}}.gap-${key}{gap:${val}}\n`;
    }
    css += `.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.block{display:block}.inline-block{display:inline-block}.hidden{display:none}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.flex-1{flex:1}.items-start{align-items:flex-start}.items-center{align-items:center}.items-end{align-items:flex-end}.justify-start{justify-content:flex-start}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.justify-between{justify-content:space-between}.justify-around{justify-content:space-around}\n`;
    for (let i = 1; i <= 12; i++) {
        css += `.grid-cols-${i}{grid-template-columns:repeat(${i},minmax(0,1fr))}\n`;
    }
    for (const [name, color] of Object.entries(config.colors ?? {})) {
        css += `.text-${name}{color:${color}}.bg-${name}{background-color:${color}}.border-${name}{border-color:${color}}\n`;
    }
    for (const [key, val] of Object.entries(config.fontSize ?? {})) {
        css += `.text-${key}{font-size:${val}}\n`;
    }
    css += `.font-thin{font-weight:100}.font-light{font-weight:300}.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}.font-extrabold{font-weight:800}\n`;
    css += `.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}\n`;
    for (const [key, val] of Object.entries(config.borderRadius ?? {})) {
        css += `.rounded-${key}{border-radius:${val}}\n`;
    }
    css += `.w-full{width:100%}.w-auto{width:auto}.w-screen{width:100vw}.h-full{height:100%}.h-auto{height:auto}.h-screen{height:100vh}.min-h-screen{min-height:100vh}\n`;
    css += `.relative{position:relative}.absolute{position:absolute}.fixed{position:fixed}.sticky{position:sticky}.top-0{top:0}.right-0{right:0}.bottom-0{bottom:0}.left-0{left:0}\n`;
    css += `.overflow-hidden{overflow:hidden}.overflow-auto{overflow:auto}.overflow-scroll{overflow:scroll}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}\n`;
    css += `.shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}.shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)}.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)}.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}.shadow-xl{box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}\n`;
    css += `.transition{transition-property:all;transition-duration:150ms}.transition-all{transition-property:all;transition-duration:150ms}.transition-colors{transition-property:color,background-color,border-color;transition-duration:150ms}.transition-transform{transition-property:transform;transition-duration:150ms}\n`;
    css += `.cursor-pointer{cursor:pointer}.cursor-default{cursor:default}.cursor-not-allowed{cursor:not-allowed}\n`;
    for (const [screen, width] of Object.entries(config.screens ?? {})) {
        css += `@media(min-width:${width}){.${screen}\\:flex{display:flex}.${screen}\\:hidden{display:none}.${screen}\\:grid{display:grid}.${screen}\\:flex-row{flex-direction:row}.${screen}\\:flex-col{flex-direction:column}`;
        for (let i = 1; i <= 12; i++) {
            css += `.${screen}\\:grid-cols-${i}{grid-template-columns:repeat(${i},minmax(0,1fr))}`;
        }
        css += '}\n';
    }
    css += `[data-theme="dark"] .dark\\:text-white{color:#fff}[data-theme="dark"] .dark\\:bg-dark{background-color:#181F25}\n`;
    return css;
}
export function injectUtilityCss(customConfig) {
    if (typeof document === 'undefined')
        return;
    if (customConfig)
        configureUtilities(customConfig);
    const css = generateUtilityCss();
    const style = document.createElement('style');
    style.id = 'birrstack-utilities';
    style.textContent = css;
    document.head.appendChild(style);
}
//# sourceMappingURL=index.js.map