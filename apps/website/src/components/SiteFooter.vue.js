/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../Dev/spve/node_modules/.pnpm/@vue+language-core@3.3.9/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import SpveMark from './SpveMark.vue';
const groups = [
    {
        title: 'Guide',
        links: [
            { label: 'Quick Start', href: '#quickstart' },
            { label: 'Features', href: '#features' },
            { label: 'Workflow', href: '#workflow' },
        ],
    },
    {
        title: 'SPVE',
        links: [
            { label: 'Configuration', href: '#workflow' },
            { label: 'Frameworks', href: '#frameworks' },
            { label: 'Development', href: '#why-spve' },
        ],
    },
    {
        title: 'Toolchain',
        links: [
            { label: 'Vite', href: '#top' },
            { label: 'SPFx', href: '#features' },
            { label: 'TypeScript', href: '#features' },
        ],
    },
];
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "border-t border-white/8 bg-[#050c12] py-14" },
});
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/8']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#050c12]']} */ ;
/** @type {__VLS_StyleScopedClasses['py-14']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wide-shell grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]" },
});
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-[1.7fr_1fr_1fr_1fr]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
const __VLS_0 = SpveMark;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (38),
}));
const __VLS_2 = __VLS_1({
    size: (38),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-4 max-w-xs text-sm leading-6 text-mist" },
});
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
for (const [group] of __VLS_vFor((__VLS_ctx.groups))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (group.title),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "font-display text-lg font-bold text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['font-display']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (group.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "mt-4 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [link] of __VLS_vFor((group.links))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (link.label),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (link.href),
            ...{ class: "text-sm text-mist transition hover:text-sp-cyan" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-mist']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-sp-cyan']} */ ;
        (link.label);
        // @ts-ignore
        [groups,];
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "wide-shell mt-12 border-t border-white/8 pt-6 text-xs text-mist/55" },
});
/** @type {__VLS_StyleScopedClasses['wide-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-12']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-white/8']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-mist/55']} */ ;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
